
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { patients, followUps } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowUpFilters } from "@/components/followups/FollowUpFilters";
import { RecentFollowUps } from "@/components/followups/RecentFollowUps";
import { PendingFollowUps } from "@/components/followups/PendingFollowUps";

const FollowUpsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");

  // Merge follow-ups with patient data
  const mergedFollowUps = followUps.map((followUp) => {
    const patient = patients.find((p) => p.id === followUp.patientId);
    return {
      ...followUp,
      patientName: patient?.name || "Unknown Patient",
      clinicName: patient?.clinicName || "Unknown Clinic",
      doctorId: patient?.doctorId,
    };
  });

  // Filter follow-ups based on role and filters
  const filteredFollowUps = mergedFollowUps
    .filter((followUp) => (isAdmin ? true : followUp.doctorId === user?.id))
    .filter(
      (followUp) => typeFilter === "all" || followUp.type === typeFilter
    )
    .filter(
      (followUp) =>
        responseFilter === "all" || followUp.response === responseFilter
    );

  // Group by date (for Recent) or by pending response
  const recentFollowUps = [...filteredFollowUps]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const pendingFollowUps = filteredFollowUps.filter(
    (followUp) => followUp.response === null
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <FollowUpFilters
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          responseFilter={responseFilter}
          setResponseFilter={setResponseFilter}
        />
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <RecentFollowUps followUps={recentFollowUps} />
        </TabsContent>
        
        <TabsContent value="pending">
          <PendingFollowUps followUps={pendingFollowUps} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowUpsPage;
