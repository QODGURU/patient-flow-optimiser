
import { useAuth } from "@/contexts/AuthContext";
import { patients, followUps } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, PhoneCall, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PatientStatusChart from "@/components/analytics/PatientStatusChart";
import FollowUpTrendChart from "@/components/analytics/FollowUpTrendChart";
import ConversionRateChart from "@/components/analytics/ConversionRateChart";
import { useMemo } from "react";

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === "admin";

  // Filter patients based on user role
  const filteredPatients = useMemo(() => {
    return isAdmin
      ? patients
      : patients.filter((patient) => patient.doctorId === user?.id);
  }, [isAdmin, user?.id]);

  // Count patients by status
  const patientStatusCounts = useMemo(() => {
    return [
      { status: "pending", count: filteredPatients.filter((p) => p.status === "pending").length },
      { status: "contacted", count: filteredPatients.filter((p) => p.status === "contacted").length },
      { status: "interested", count: filteredPatients.filter((p) => p.status === "interested").length },
      { status: "booked", count: filteredPatients.filter((p) => p.status === "booked").length },
      { status: "cold", count: filteredPatients.filter((p) => p.status === "cold").length },
      { status: "opt-out", count: filteredPatients.filter((p) => p.status === "opt-out").length }
    ];
  }, [filteredPatients]);

  // Count follow-ups by type
  const followUpCounts = useMemo(() => {
    return {
      call: followUps.filter((f) => f.type === "call").length,
      message: followUps.filter((f) => f.type === "message").length,
    };
  }, []);

  // Create data for follow-up trend chart
  const followUpTrendData = useMemo(() => {
    // In a real app, this would be coming from an API with actual dates
    return [
      { date: "Jan 01", calls: 12, messages: 8, responses: 15 },
      { date: "Jan 08", calls: 19, messages: 10, responses: 18 },
      { date: "Jan 15", calls: 15, messages: 12, responses: 20 },
      { date: "Jan 22", calls: 22, messages: 16, responses: 24 },
      { date: "Jan 29", calls: 28, messages: 20, responses: 32 },
      { date: "Feb 05", calls: 24, messages: 22, responses: 30 }
    ];
  }, []);

  // Create data for conversion rate chart
  const conversionData = useMemo(() => {
    // In a real app, this would be coming from an API with actual data
    return [
      { doctor: "Dr. Smith", contacted: 45, interested: 30, booked: 20 },
      { doctor: "Dr. Johnson", contacted: 35, interested: 25, booked: 18 },
      { doctor: "Dr. Garcia", contacted: 50, interested: 35, booked: 28 },
      { doctor: "Dr. Lee", contacted: 40, interested: 28, booked: 22 }
    ];
  }, []);

  // Get recent follow-ups
  const recentFollowUps = useMemo(() => {
    return [...followUps]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("dashboard")}</h1>
        <div className="text-sm text-gray-500">
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
        <Card className="hover-scale">
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t("totalPatients")}</p>
              <h3 className="text-2xl font-bold">{filteredPatients.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("bookedAppointments")}
              </p>
              <h3 className="text-2xl font-bold">
                {patientStatusCounts.find(s => s.status === "booked")?.count || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <PhoneCall className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t("callFollowUps")}</p>
              <h3 className="text-2xl font-bold">{followUpCounts.call}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("messageFollowUps")}
              </p>
              <h3 className="text-2xl font-bold">{followUpCounts.message}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Status Chart */}
        <PatientStatusChart 
          data={patientStatusCounts} 
          title={t("patientStatus")} 
          className="lg:col-span-1 hover-scale"
        />
        
        {/* Follow-up Trend Chart */}
        <FollowUpTrendChart 
          data={followUpTrendData} 
          title={t("followUpTrends")} 
          description="Last 6 weeks" 
          className="lg:col-span-2 hover-scale"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Conversion Rate Chart */}
        {isAdmin && (
          <ConversionRateChart 
            data={conversionData} 
            title="Doctor Performance" 
            description="Conversion rates by doctor" 
            className="lg:col-span-2 hover-scale"
          />
        )}

        {/* Recent Follow-ups */}
        <Card className={`${isAdmin ? 'lg:col-span-1' : 'lg:col-span-3'} hover-scale`}>
          <CardHeader>
            <CardTitle className="text-xl">{t("recentFollowUps")}</CardTitle>
            <CardDescription>
              {t("latestCommunications")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFollowUps.map((followUp) => {
                const patient = patients.find(
                  (p) => p.id === followUp.patientId
                );
                return (
                  <div
                    key={followUp.id}
                    className="flex items-start p-3 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-200"
                  >
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        followUp.type === "call"
                          ? "bg-yellow-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {followUp.type === "call" ? (
                        <PhoneCall
                          className="h-4 w-4 text-yellow-700"
                          aria-hidden="true"
                        />
                      ) : (
                        <MessageSquare
                          className="h-4 w-4 text-purple-700"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate story-link">
                        {patient?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {followUp.date} at {followUp.time}
                      </p>
                      {followUp.notes && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {followUp.notes}
                        </p>
                      )}
                    </div>
                    {followUp.response && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          followUp.response === "yes"
                            ? "bg-green-100 text-green-800"
                            : followUp.response === "no"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {followUp.response === "call_again"
                          ? t("callAgain")
                          : t(followUp.response)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
