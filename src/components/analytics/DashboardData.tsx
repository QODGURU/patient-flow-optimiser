import { useMemo, useEffect, useState } from "react";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { Patient, FollowUp } from "@/types/supabase";

export interface DashboardDataProps {
  children: (data: {
    patientStatusCounts: { status: string; count: number }[];
    followUpCounts: { 
      call: number; 
      message: number; 
      total: number; 
      pending: number; 
      notInterested: number; 
      interested: number;
    };
    followUpTrendData: { date: string; calls: number; messages: number; responses: number }[];
    conversionRateData: { doctor: string; contacted: number; interested: number; booked: number }[];
    treatmentCategories: { category: string; count: number }[];
    channelPreferences: { channel: string; count: number }[];
    timePreferences: { time: string; count: number }[];
    interactionOutcomes: { outcome: string; count: number }[];
    conversionTrend: { week: string; total: number; interested: number; rate: number }[];
    recentFollowUps: any[];
    patientsLoading: boolean;
    followUpsLoading: boolean;
  }) => React.ReactNode;
}

export const DashboardData = ({ children }: DashboardDataProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [demoPatients, setDemoPatients] = useState<Patient[]>([]);
  const [demoFollowUps, setDemoFollowUps] = useState<FollowUp[]>([]);

  // Fetch patients data
  const { data: patients, loading: patientsLoading } = useSupabaseQuery<Patient>("patients", {
    orderBy: { column: "created_at", ascending: false },
  });

  // Fetch follow-ups data
  const { data: followUps, loading: followUpsLoading } = useSupabaseQuery<FollowUp>("follow_ups", {
    orderBy: { column: "created_at", ascending: false },
  });

  // Load demo data if available
  useEffect(() => {
    const storedDemoPatients = localStorage.getItem("demo_patients");
    const storedDemoFollowUps = localStorage.getItem("demo_follow_ups");
    
    if (storedDemoPatients && patients.length === 0) {
      try {
        setDemoPatients(JSON.parse(storedDemoPatients));
      } catch (e) {
        console.error("Error parsing demo patients:", e);
      }
    }
    
    if (storedDemoFollowUps && followUps.length === 0) {
      try {
        setDemoFollowUps(JSON.parse(storedDemoFollowUps));
      } catch (e) {
        console.error("Error parsing demo follow-ups:", e);
      }
    }
  }, [patients, followUps]);

  // Use either real data or demo data
  const displayPatients = patients.length > 0 ? patients : demoPatients;
  const displayFollowUps = followUps.length > 0 ? followUps : demoFollowUps;

  // Filter patients based on role
  const filteredPatients = useMemo(() => {
    return isAdmin
      ? displayPatients
      : displayPatients.filter((patient) => patient.doctor_id === profile?.id);
  }, [isAdmin, displayPatients, profile?.id]);

  // Count patients by status
  const patientStatusCounts = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return getSampleStatusData();
    }
    
    const statusGroups = filteredPatients.reduce((acc, patient) => {
      const status = patient.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusGroups).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Count follow-ups by type
  const followUpCounts = useMemo(() => {
    if ((followUpsLoading && !demoFollowUps.length) || (patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return {
        call: 35,
        message: 42,
        total: 77,
        pending: 23,
        interested: 18,
        notInterested: 12
      };
    }
    
    const pending = filteredPatients.filter(p => 
      p.status === 'Pending' || p.status === 'Contacted'
    ).length;
    
    const interested = filteredPatients.filter(p => p.status === 'Interested').length;
    const notInterested = filteredPatients.filter(p => p.status === 'Not Interested').length;
    
    const stats = displayFollowUps.reduce((acc, followUp) => {
      if (followUp.type.toLowerCase().includes('call')) {
        acc.call += 1;
      } else if (followUp.type.toLowerCase().includes('message') || followUp.type.toLowerCase().includes('sms')) {
        acc.message += 1;
      }
      acc.total += 1;
      return acc;
    }, { call: 0, message: 0, total: 0, pending, interested, notInterested });
    
    return stats;
  }, [displayFollowUps, followUpsLoading, filteredPatients, patientsLoading, demoFollowUps.length, demoPatients.length]);

  // Create data for follow-up trend chart
  const followUpTrendData = useMemo(() => {
    if ((followUpsLoading && !demoFollowUps.length) || !displayFollowUps.length) {
      return getSampleFollowUpTrendData();
    }
    
    // Group follow-ups by date
    const grouped = displayFollowUps.reduce((acc, followUp) => {
      const date = followUp.date;
      if (!acc[date]) {
        acc[date] = { date, calls: 0, messages: 0, responses: 0 };
      }
      
      if (followUp.type.toLowerCase().includes('call')) {
        acc[date].calls += 1;
      } else if (followUp.type.toLowerCase().includes('message') || followUp.type.toLowerCase().includes('sms')) {
        acc[date].messages += 1;
      }
      
      if (followUp.response) {
        acc[date].responses += 1;
      }
      
      return acc;
    }, {} as Record<string, { date: string; calls: number; messages: number; responses: number }>);
    
    // Convert to array and sort by date
    const data = Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6); // Last 6 dates with data
      
    return data.length ? data : getSampleFollowUpTrendData();
  }, [displayFollowUps, followUpsLoading, demoFollowUps.length]);
  
  // Conversion rate by doctor data
  const conversionRateData = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return getSampleConversionRateData();
    }
    
    // Group by doctor
    const doctorStats = filteredPatients.reduce((acc, patient) => {
      const doctorId = patient.doctor_id || 'Unknown';
      
      if (!acc[doctorId]) {
        acc[doctorId] = { 
          doctor: doctorId, 
          contacted: 0, 
          interested: 0,
          booked: 0 
        };
      }
      
      if (patient.status === 'Contacted' || patient.status === 'Pending') {
        acc[doctorId].contacted += 1;
      } else if (patient.status === 'Interested') {
        acc[doctorId].interested += 1;
      } else if (patient.status === 'Booked') {
        acc[doctorId].booked += 1;
      }
      
      return acc;
    }, {} as Record<string, { doctor: string; contacted: number; interested: number; booked: number }>);
    
    const result = Object.values(doctorStats);
    return result.length ? result : getSampleConversionRateData();
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Interaction outcome distribution
  const interactionOutcomes = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return [
        { outcome: "Yes", count: 43 },
        { outcome: "No", count: 21 },
        { outcome: "Maybe", count: 18 },
        { outcome: "No Answer", count: 32 },
        { outcome: "Opt-out", count: 7 }
      ];
    }
    
    const outcomes = filteredPatients.reduce((acc, patient) => {
      if (patient.last_interaction_outcome) {
        acc[patient.last_interaction_outcome] = (acc[patient.last_interaction_outcome] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(outcomes).map(([outcome, count]) => ({
      outcome,
      count,
    }));
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Treatment categories distribution
  const treatmentCategories = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return [
        { category: "Dental", count: 32 },
        { category: "Orthodontics", count: 28 },
        { category: "Cosmetic", count: 25 },
        { category: "Surgical", count: 15 },
        { category: "Preventive", count: 20 }
      ];
    }
    
    const categories = filteredPatients.reduce((acc, patient) => {
      const category = patient.treatment_category || 'Not Specified';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Channel preference distribution
  const channelPreferences = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return [
        { channel: "Call", count: 45 },
        { channel: "SMS", count: 32 },
        { channel: "Email", count: 18 },
        { channel: "Not Specified", count: 10 }
      ];
    }
    
    const preferences = filteredPatients.reduce((acc, patient) => {
      const channel = patient.preferred_channel || 'Not Specified';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(preferences).map(([channel, count]) => ({
      channel,
      count,
    }));
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Time preference distribution
  const timePreferences = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return [
        { time: "Morning", count: 38 },
        { time: "Afternoon", count: 29 },
        { time: "Evening", count: 25 },
        { time: "Not Specified", count: 13 }
      ];
    }
    
    const preferences = filteredPatients.reduce((acc, patient) => {
      const time = patient.preferred_time || 'Not Specified';
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(preferences).map(([time, count]) => ({
      time,
      count,
    }));
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Conversion rate over time (interested / total patients per week)
  const conversionTrend = useMemo(() => {
    if ((patientsLoading && !demoPatients.length) || !filteredPatients.length) {
      return getSampleConversionTrendData();
    }
    
    // Group by week
    const weeks: Record<string, { week: string; total: number; interested: number }> = {};
    
    filteredPatients.forEach(patient => {
      if (!patient.created_at) return;
      
      const date = new Date(patient.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, total: 0, interested: 0 };
      }
      
      weeks[weekKey].total += 1;
      if (patient.status === 'Interested') {
        weeks[weekKey].interested += 1;
      }
    });
    
    const result = Object.values(weeks)
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8)
      .map(week => ({
        ...week,
        rate: week.total > 0 ? (week.interested / week.total) * 100 : 0
      }));
      
    return result.length > 0 ? result : getSampleConversionTrendData();
  }, [filteredPatients, patientsLoading, demoPatients.length]);

  // Get recent follow-ups
  const recentFollowUps = useMemo(() => {
    if ((followUpsLoading && !demoFollowUps.length) || (patientsLoading && !demoPatients.length) || 
        !displayFollowUps.length || !filteredPatients.length) {
      return getSampleRecentFollowUps();
    }
    
    return displayFollowUps
      .slice(0, 5)
      .map(followUp => {
        const patient = filteredPatients.find(p => p.id === followUp.patient_id);
        return { ...followUp, patientName: patient?.name || 'Unknown' };
      });
  }, [displayFollowUps, filteredPatients, followUpsLoading, patientsLoading, demoFollowUps.length, demoPatients.length]);

  return children({
    patientStatusCounts,
    followUpCounts,
    followUpTrendData,
    conversionRateData,
    treatmentCategories,
    channelPreferences,
    timePreferences,
    interactionOutcomes,
    conversionTrend,
    recentFollowUps,
    patientsLoading: patientsLoading && !demoPatients.length,
    followUpsLoading: followUpsLoading && !demoFollowUps.length
  });
};

function getSampleStatusData() {
  return [
    { status: "Interested", count: 37 },
    { status: "Not Interested", count: 24 },
    { status: "Pending", count: 45 },
    { status: "Contacted", count: 28 },
    { status: "Booked", count: 19 }
  ];
}

function getSampleFollowUpTrendData() {
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.unshift({
      date: dateStr,
      calls: Math.floor(Math.random() * 8) + 3,
      messages: Math.floor(Math.random() * 10) + 5,
      responses: Math.floor(Math.random() * 7) + 2
    });
  }
  
  return data;
}

function getSampleConversionRateData() {
  return [
    { doctor: "Dr. Smith", contacted: 48, interested: 22, booked: 15 },
    { doctor: "Dr. Johnson", contacted: 52, interested: 19, booked: 12 },
    { doctor: "Dr. Williams", contacted: 38, interested: 24, booked: 18 },
    { doctor: "Dr. Brown", contacted: 45, interested: 20, booked: 14 }
  ];
}

function getSampleConversionTrendData() {
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < 8; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7)); // Weekly data
    const weekKey = date.toISOString().split('T')[0];
    
    const total = Math.floor(Math.random() * 20) + 10;
    const interested = Math.floor(Math.random() * (total - 2)) + 2;
    
    data.unshift({
      week: weekKey,
      total,
      interested,
      rate: (interested / total) * 100
    });
  }
  
  return data;
}

function getSampleRecentFollowUps() {
  const today = new Date();
  
  return [
    {
      id: "1",
      patientName: "John Smith",
      date: today.toISOString().split('T')[0],
      time: "09:30:00",
      type: "Phone Call",
      notes: "Patient requested more information",
      response: "Yes"
    },
    {
      id: "2",
      patientName: "Sarah Johnson",
      date: today.toISOString().split('T')[0],
      time: "10:15:00",
      type: "SMS",
      notes: "Appointment reminder sent",
      response: "Yes"
    },
    {
      id: "3",
      patientName: "Michael Brown",
      date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0],
      time: "14:45:00",
      type: "Phone Call",
      notes: "Discussed treatment options",
      response: "Maybe"
    },
    {
      id: "4",
      patientName: "Emily Wilson",
      date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0],
      time: "16:30:00",
      type: "SMS",
      notes: "Checking availability",
      response: "call_again"
    },
    {
      id: "5",
      patientName: "David Lee",
      date: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0],
      time: "11:00:00",
      type: "Phone Call",
      notes: "Left voicemail",
      response: "No Answer"
    }
  ];
}
