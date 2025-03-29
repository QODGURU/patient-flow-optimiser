
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, PhoneCall, MessageSquare, Star, AlertTriangle, Calendar, Database } from "lucide-react";
import { DashboardData } from "@/components/analytics/DashboardData";
import { DashboardCharts } from "@/components/analytics/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { DemoDataButton } from "@/components/DemoDataButton";

const StatCard = ({ title, value, loading, icon, iconBgColor }: any) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-semibold mt-1">{value}</p>
          )}
        </div>
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {t("overview")}
        </h1>
        <div className="flex items-center gap-3">
          <DemoDataButton />
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t("today")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardData>
        {({ followUpCounts, patientsLoading, followUpsLoading, recentFollowUps }) => (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <StatCard
                title="Total Patients"
                value={followUpCounts.total || 0}
                loading={patientsLoading}
                icon={<Users className="h-6 w-6 text-[#101B4C]" />}
                iconBgColor="bg-[#101B4C]/10"
              />
              <StatCard
                title="Calls Made"
                value={followUpCounts.call || 0}
                loading={followUpsLoading}
                icon={<PhoneCall className="h-6 w-6 text-green-600" />}
                iconBgColor="bg-green-100"
              />
              <StatCard
                title="Messages Sent"
                value={followUpCounts.message || 0}
                loading={followUpsLoading}
                icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
                iconBgColor="bg-blue-100"
              />
              <StatCard
                title="Interested"
                value={followUpCounts.interested || 0}
                loading={patientsLoading}
                icon={<Star className="h-6 w-6 text-amber-500" />}
                iconBgColor="bg-amber-100"
              />
              <StatCard
                title="Pending"
                value={followUpCounts.pending || 0}
                loading={patientsLoading}
                icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
                iconBgColor="bg-amber-100"
              />
            </div>

            {/* Chart Tabs */}
            <Tabs defaultValue="performance" className="space-y-4">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="patients">Patients</TabsTrigger>
                  <TabsTrigger value="interactions">Interactions</TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                  <Button
                    size="sm"
                    variant={dateRange === "week" ? "default" : "ghost"}
                    className={dateRange === "week" ? "" : "bg-transparent text-gray-500"}
                    onClick={() => setDateRange("week")}
                  >
                    Week
                  </Button>
                  <Button
                    size="sm"
                    variant={dateRange === "month" ? "default" : "ghost"}
                    className={dateRange === "month" ? "" : "bg-transparent text-gray-500"}
                    onClick={() => setDateRange("month")}
                  >
                    Month
                  </Button>
                  <Button
                    size="sm"
                    variant={dateRange === "year" ? "default" : "ghost"}
                    className={dateRange === "year" ? "" : "bg-transparent text-gray-500"}
                    onClick={() => setDateRange("year")}
                  >
                    Year
                  </Button>
                </div>
              </div>
              
              <TabsContent value="performance" className="space-y-4">
                <DashboardCharts />
              </TabsContent>
              
              <TabsContent value="patients" className="space-y-4">
                <DashboardCharts chartTypes={["patientStatus", "treatmentCategories", "channelPreferences"]} />
              </TabsContent>
              
              <TabsContent value="interactions" className="space-y-4">
                <DashboardCharts chartTypes={["followUpTrend", "timePreferences", "interactionOutcomes"]} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DashboardData>
    </div>
  );
}
