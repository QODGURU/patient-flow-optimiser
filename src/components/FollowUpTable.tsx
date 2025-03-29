
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { FollowUp, Patient, Profile } from '@/types/supabase';
import { MergedFollowUp } from '@/types/followUp';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface FollowUpTableProps {
  patientId?: string;
  limit?: number;
}

export const FollowUpTable: React.FC<FollowUpTableProps> = ({ patientId, limit = 10 }) => {
  const navigate = useNavigate();
  const [mergedFollowUps, setMergedFollowUps] = useState<MergedFollowUp[]>([]);
  
  // Get follow-ups from Supabase
  const { data: followUps, loading: followUpsLoading, refetch: refetchFollowUps } = 
    useSupabaseQuery<FollowUp>('follow_ups', {
      filters: patientId ? { patient_id: patientId } : {},
      orderBy: { column: 'date', ascending: false },
      limit,
      enabled: true
    });
  
  // Get patients for patient names
  const { data: patients } = useSupabaseQuery<Patient>('patients', {
    columns: 'id, name',
    enabled: !patientId
  });
  
  // Get profiles for doctor/creator names
  const { data: profiles } = useSupabaseQuery<Profile>('profiles', {
    columns: 'id, name'
  });
  
  // Check for demo data first
  useEffect(() => {
    const demoFollowUps = localStorage.getItem('demo_follow_ups');
    const demoPatients = localStorage.getItem('demo_patients');
    
    if (demoFollowUps && demoPatients) {
      try {
        const parsedFollowUps = JSON.parse(demoFollowUps);
        const parsedPatients = JSON.parse(demoPatients);
        
        let filteredFollowUps;
        
        if (patientId) {
          // Filter for specific patient
          filteredFollowUps = parsedFollowUps.filter((f: FollowUp) => f.patient_id === patientId);
          console.log(`Found ${filteredFollowUps.length} follow-ups in demo data for patient ${patientId}`);
        } else {
          // Get all follow-ups
          filteredFollowUps = parsedFollowUps;
          console.log(`Found ${filteredFollowUps.length} total follow-ups in demo data`);
        }
        
        if (filteredFollowUps.length > 0 || patientId) {
          // Merge data
          const merged = filteredFollowUps.map((followUp: FollowUp) => {
            const patient = parsedPatients.find((p: Patient) => p.id === followUp.patient_id);
            return {
              ...followUp,
              patientName: patient?.name || 'Unknown Patient',
              clinicName: 'Demo Clinic',
              doctorId: followUp.created_by || 'unknown'
            };
          });
          
          // Apply limit if needed and not specific to a patient
          const limitedFollowUps = !patientId && limit ? merged.slice(0, limit) : merged;
          setMergedFollowUps(limitedFollowUps);
          return; // Exit early as we have demo data
        }
      } catch (error) {
        console.error("Error parsing demo data:", error);
      }
    }
    
    // If no demo data or error parsing, continue to use Supabase data
    if (followUps.length > 0) {
      const merged = followUps.map((followUp) => {
        const patient = patients.find(p => p.id === followUp.patient_id);
        const creator = profiles.find(p => p.id === followUp.created_by);
        
        return {
          ...followUp,
          patientName: patient?.name || 'Unknown Patient',
          clinicName: 'Clinic Name',
          doctorName: creator?.name || 'Unknown',
          doctorId: followUp.created_by || ''
        };
      });
      
      setMergedFollowUps(merged);
    }
  }, [followUps, patients, profiles, patientId, limit]);
  
  const handleNewFollowUp = () => {
    if (!patientId) {
      toast.error('Please select a patient first');
      return;
    }
    
    navigate(`/add-follow-up?patientId=${patientId}`);
  };
  
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Follow-Ups</CardTitle>
          <CardDescription>
            {patientId ? 'Scheduled follow-ups for this patient' : 'Recent follow-ups across all patients'}
          </CardDescription>
        </div>
        {patientId && (
          <Button onClick={handleNewFollowUp} className="bg-medical-teal hover:bg-teal-600">
            <PlusCircle className="mr-2 h-4 w-4" /> New Follow-Up
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {followUpsLoading && mergedFollowUps.length === 0 ? (
          <div className="text-center py-4">Loading follow-ups...</div>
        ) : mergedFollowUps.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No follow-ups found {patientId ? 'for this patient' : ''}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {!patientId && <TableHead>Patient</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedFollowUps.map((followUp) => (
                <TableRow key={followUp.id}>
                  {!patientId && (
                    <TableCell className="font-medium">
                      {followUp.patientName}
                    </TableCell>
                  )}
                  <TableCell>{followUp.type}</TableCell>
                  <TableCell>
                    {followUp.date ? format(new Date(followUp.date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>{followUp.time || 'N/A'}</TableCell>
                  <TableCell>{followUp.notes || 'N/A'}</TableCell>
                  <TableCell>{followUp.response || 'No response yet'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
