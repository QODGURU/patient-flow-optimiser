
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { patients, followUps } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowUpFilters } from "@/components/followups/FollowUpFilters";
import { RecentFollowUps } from "@/components/followups/RecentFollowUps";
import { PendingFollowUps } from "@/components/followups/PendingFollowUps";
import { DemoDataButton } from "@/components/DemoDataButton";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { FollowUp, Patient } from "@/types/supabase";
import { MergedFollowUp } from "@/types/followUp";

const FollowUpsPage = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");

  // Fetch data from Supabase
  const { data: supabasePatients, loading: patientsLoading } = 
    useSupabaseQuery<Patient>("patients", {
      orderBy: { column: "created_at", ascending: false },
    });

  const { data: supabaseFollowUps, loading: followUpsLoading } = 
    useSupabaseQuery<FollowUp>("follow_ups", {
      orderBy: { column: "date", ascending: false },
    });

  // Use real data if available, otherwise use mock data
  const useRealData = supabasePatients.length > 0 && supabaseFollowUps.length > 0;
  
  // Merge follow-ups with patient data
  const mergedFollowUps: MergedFollowUp[] = useRealData 
    ? supabaseFollowUps.map((followUp) => {
        const patient = supabasePatients.find((p) => p.id === followUp.patient_id);
        return {
          ...followUp,
          patientName: patient?.name || "Unknown Patient",
          clinicName: patient?.clinic_id ? "Clinic" : "Unknown Clinic",
          doctorId: patient?.doctor_id,
          response: followUp.response || null,
        };
      })
    : followUps.map((followUp) => {
        const patient = patients.find((p) => p.id === followUp.patientId);
        return {
          ...followUp,
          patientName: patient?.name || "Unknown Patient",
          clinicName: patient?.clinicName || "Unknown Clinic",
          doctorId: patient?.doctorId,
          response: followUp.response || null,
        };
      });

  // Filter follow-ups based on role and filters
  const filteredFollowUps = mergedFollowUps
    .filter((followUp) => {
      if (isAdmin) return true;
      return followUp.doctorId === profile?.id || 
             followUp.created_by === profile?.id;
    })
    .filter(
      (followUp) => typeFilter === "all" || followUp.type.toLowerCase().includes(typeFilter.toLowerCase())
    )
    .filter(
      (followUp) =>
        responseFilter === "all" || followUp.response === responseFilter
    );

  // Group by date (for Recent) or by pending response
  const recentFollowUps = [...filteredFollowUps]
    .sort((a, b) => {
      // Handle both real and mock data date formats
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  const pendingFollowUps = filteredFollowUps.filter(
    (followUp) => followUp.response === null
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <div className="flex items-center gap-2">
          <DemoDataButton />
          <FollowUpFilters
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            responseFilter={responseFilter}
            setResponseFilter={setResponseFilter}
          />
        </div>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <RecentFollowUps 
            followUps={recentFollowUps} 
            isLoading={patientsLoading || followUpsLoading}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <PendingFollowUps 
            followUps={pendingFollowUps}
            isLoading={patientsLoading || followUpsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowUpsPage;
