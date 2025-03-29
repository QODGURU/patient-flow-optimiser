
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, PhoneCall, MessageSquare, Star, ThumbsUp, AlertTriangle, Calendar, Database } from "lucide-react";
import { DashboardData } from "@/components/analytics/DashboardData";
import { DashboardCharts } from "@/components/analytics/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { generateDemoData } from "@/utils/demoDataGenerator";

const DashboardPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    try {
      await generateDemoData();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#101B4C]">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateData}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Demo Data"}
          </Button>
          <div className="text-sm text-[#2B2E33]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardData>
        {({ followUpCounts, patientsLoading, followUpsLoading, filteredPatients, recentFollowUps }) => (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <StatCard
                title="Total Patients"
                value={filteredPatients?.length || 0}
                loading={patientsLoading}
                icon={<Users className="h-6 w-6 text-[#101B4C]" />}
                iconBgColor="bg-[#101B4C]/10"
              />

              <StatCard
                title="Interested"
                value={followUpCounts.interested}
                loading={patientsLoading}
                icon={<Star className="h-6 w-6 text-[#00FFC8]" />}
                iconBgColor="bg-[#00FFC8]/10"
              />

              <StatCard
                title="Not Interested"
                value={followUpCounts.notInterested}
                loading={patientsLoading}
                icon={<AlertTriangle className="h-6 w-6 text-[#FF3B3B]" />}
                iconBgColor="bg-[#FF3B3B]/10"
              />

              <StatCard
                title="Total Follow-ups"
                value={followUpCounts.total}
                loading={followUpsLoading}
                icon={<PhoneCall className="h-6 w-6 text-[#FFC107]" />}
                iconBgColor="bg-[#FFC107]/10"
              />

              <StatCard
                title="Pending Follow-ups"
                value={followUpCounts.pending}
                loading={patientsLoading}
                icon={<Calendar className="h-6 w-6 text-[#8066DC]" />}
                iconBgColor="bg-[#8066DC]/10"
              />
            </div>

            {/* Charts */}
            <DashboardCharts />
            
            {/* Recent Follow-ups */}
            <div className="mt-6">
              <Card className="hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#101B4C] mb-4">Recent Follow-ups</h3>
                  
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
          </>
        )}
      </DashboardData>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
  iconBgColor: string;
}

const StatCard = ({ title, value, loading, icon, iconBgColor }: StatCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-[#101B4C]/10">
      <CardContent className="p-6 flex items-center">
        <div className={`${iconBgColor} p-3 rounded-full mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-[#2B2E33]">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <h3 className="text-2xl font-bold text-[#101B4C]">{value}</h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
