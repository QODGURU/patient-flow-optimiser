
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, PhoneCall, MessageSquare, Star } from "lucide-react";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { Patient, FollowUp } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

// Premium color palette
const COLORS = [
  "#101B4C", // Midnight Navy
  "#00FFC8", // Radiant Aquamarine
  "#2B2E33", // Graphite Grey
  "#FFC107", // Gold Amber
  "#FF3B3B", // Luxe Crimson
  "#8066DC", // Premium Purple
  "#01C5C4", // Teal Accent
];

const DashboardPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  // Fetch patients data
  const { data: patients, loading: patientsLoading } = useSupabaseQuery<Patient>("patients", {
    orderBy: { column: "created_at", ascending: false },
  });

  // Fetch follow-ups data
  const { data: followUps, loading: followUpsLoading } = useSupabaseQuery<FollowUp>("follow_ups", {
    orderBy: { column: "created_at", ascending: false },
  });

  // Filter patients based on role
  const filteredPatients = useMemo(() => {
    return isAdmin
      ? patients
      : patients.filter((patient) => patient.doctor_id === profile?.id);
  }, [isAdmin, patients, profile?.id]);

  // Count patients by status
  const patientStatusCounts = useMemo(() => {
    if (patientsLoading) return [];
    
    const statusGroups = filteredPatients.reduce((acc, patient) => {
      acc[patient.status] = (acc[patient.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusGroups).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredPatients, patientsLoading]);

  // Count follow-ups by type
  const followUpCounts = useMemo(() => {
    if (followUpsLoading) return { call: 0, message: 0, total: 0, pending: 0 };
    
    const pending = filteredPatients.filter(p => 
      p.status === 'Pending' || p.status === 'Contacted'
    ).length;
    
    const stats = followUps.reduce((acc, followUp) => {
      if (followUp.type.toLowerCase().includes('call')) {
        acc.call += 1;
      } else if (followUp.type.toLowerCase().includes('message') || followUp.type.toLowerCase().includes('sms')) {
        acc.message += 1;
      }
      acc.total += 1;
      return acc;
    }, { call: 0, message: 0, total: 0, pending });
    
    return stats;
  }, [followUps, followUpsLoading, filteredPatients]);

  // Create data for follow-up trend chart
  const followUpTrendData = useMemo(() => {
    if (followUpsLoading) return [];
    
    // Group follow-ups by date
    const grouped = followUps.reduce((acc, followUp) => {
      const date = followUp.date;
      if (!acc[date]) {
        acc[date] = { date, calls: 0, messages: 0 };
      }
      
      if (followUp.type.toLowerCase().includes('call')) {
        acc[date].calls += 1;
      } else if (followUp.type.toLowerCase().includes('message') || followUp.type.toLowerCase().includes('sms')) {
        acc[date].messages += 1;
      }
      
      return acc;
    }, {} as Record<string, { date: string; calls: number; messages: number }>);
    
    // Convert to array and sort by date
    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-6); // Last 6 dates with data
  }, [followUps, followUpsLoading]);

  // Interaction outcome distribution
  const interactionOutcomes = useMemo(() => {
    if (patientsLoading) return [];
    
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
  }, [filteredPatients, patientsLoading]);

  // Treatment categories distribution
  const treatmentCategories = useMemo(() => {
    if (patientsLoading) return [];
    
    const categories = filteredPatients.reduce((acc, patient) => {
      if (patient.treatment_category) {
        acc[patient.treatment_category] = (acc[patient.treatment_category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  }, [filteredPatients, patientsLoading]);

  // Get recent follow-ups
  const recentFollowUps = useMemo(() => {
    if (followUpsLoading || patientsLoading) return [];
    
    return followUps
      .slice(0, 5)
      .map(followUp => {
        const patient = filteredPatients.find(p => p.id === followUp.patient_id);
        return { ...followUp, patientName: patient?.name || 'Unknown' };
      });
  }, [followUps, filteredPatients, followUpsLoading, patientsLoading]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#101B4C]">Dashboard</h1>
        <div className="text-sm text-[#2B2E33]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#101B4C]/10 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-[#101B4C]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2B2E33]">Total Patients</p>
              {patientsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <h3 className="text-2xl font-bold text-[#101B4C]">{filteredPatients.length}</h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#00FFC8]/10 p-3 rounded-full mr-4">
              <Star className="h-6 w-6 text-[#00FFC8]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2B2E33]">
                Interested
              </p>
              {patientsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <h3 className="text-2xl font-bold text-[#101B4C]">
                  {filteredPatients.filter(p => p.status === 'Interested').length}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#FFC107]/10 p-3 rounded-full mr-4">
              <PhoneCall className="h-6 w-6 text-[#FFC107]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2B2E33]">Total Follow-ups</p>
              {followUpsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <h3 className="text-2xl font-bold text-[#101B4C]">{followUpCounts.total}</h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#FF3B3B]/10 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-[#FF3B3B]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2B2E33]">
                Pending Follow-ups
              </p>
              {patientsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <h3 className="text-2xl font-bold text-[#101B4C]">{followUpCounts.pending}</h3>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Status Chart */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-xl text-[#101B4C]">Patient Status</CardTitle>
            <CardDescription>Distribution by current status</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {patientsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : patientStatusCounts.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientStatusCounts}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ status, percent }) => 
                        `${status}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {patientStatusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} patients`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-[#2B2E33]">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Follow-up Trend Chart */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-xl text-[#101B4C]">Follow-up Trends</CardTitle>
            <CardDescription>Communication activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            {followUpsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : followUpTrendData.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={followUpTrendData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#101B4C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#101B4C" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFC8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00FFC8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FDFDFD', 
                        borderColor: '#101B4C20',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="#101B4C" 
                      fillOpacity={1} 
                      fill="url(#colorCalls)" 
                      strokeWidth={2}
                      name="Phone Calls"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#00FFC8" 
                      fillOpacity={1} 
                      fill="url(#colorMessages)" 
                      strokeWidth={2}
                      name="Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-[#2B2E33]">
                No follow-up trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Interaction Outcomes */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-xl text-[#101B4C]">Interaction Outcomes</CardTitle>
            <CardDescription>Patient responses to follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : interactionOutcomes.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interactionOutcomes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="outcome" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FDFDFD', 
                        borderColor: '#101B4C20',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="count" 
                      name="Responses" 
                      radius={[0, 4, 4, 0]}
                    >
                      {interactionOutcomes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-[#2B2E33]">
                No interaction outcome data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Treatment Categories */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-xl text-[#101B4C]">Treatment Distribution</CardTitle>
            <CardDescription>Patient counts by treatment category</CardDescription>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : treatmentCategories.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={treatmentCategories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FDFDFD', 
                        borderColor: '#101B4C20',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="count" 
                      name="Patients" 
                      radius={[4, 4, 0, 0]}
                    >
                      {treatmentCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-[#2B2E33]">
                No treatment category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Follow-ups */}
        <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-xl text-[#101B4C]">Recent Follow-ups</CardTitle>
            <CardDescription>Latest communications with patients</CardDescription>
          </CardHeader>
          <CardContent>
            {followUpsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentFollowUps.length > 0 ? (
              <div className="space-y-4">
                {recentFollowUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="flex items-start p-3 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-200"
                  >
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        followUp.type.toLowerCase().includes('call')
                          ? "bg-[#FFC107]/10"
                          : "bg-[#00FFC8]/10"
                      }`}
                    >
                      {followUp.type.toLowerCase().includes('call') ? (
                        <PhoneCall
                          className="h-4 w-4 text-[#FFC107]"
                          aria-hidden="true"
                        />
                      ) : (
                        <MessageSquare
                          className="h-4 w-4 text-[#00FFC8]"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#101B4C] truncate">
                        {followUp.patientName}
                      </p>
                      <p className="text-xs text-[#2B2E33] mt-1">
                        {followUp.date} at {followUp.time}
                      </p>
                      {followUp.notes && (
                        <p className="text-xs text-[#2B2E33] mt-1 truncate">
                          {followUp.notes}
                        </p>
                      )}
                    </div>
                    {followUp.response && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          followUp.response === "Yes"
                            ? "bg-green-100 text-green-800"
                            : followUp.response === "No"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {followUp.response === "call_again"
                          ? "Call Again"
                          : followUp.response}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-[#2B2E33]">
                No recent follow-ups available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
