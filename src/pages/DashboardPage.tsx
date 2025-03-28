
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { patients, followUps } from "@/data/mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Users,
  UserCheck,
  PhoneCall,
  MessageSquare,
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Filter patients based on user role
  const filteredPatients = isAdmin
    ? patients
    : patients.filter((patient) => patient.doctorId === user?.id);

  // Count patients by status
  const patientStatusCounts = {
    pending: filteredPatients.filter((p) => p.status === "pending").length,
    contacted: filteredPatients.filter((p) => p.status === "contacted").length,
    interested: filteredPatients.filter((p) => p.status === "interested").length,
    booked: filteredPatients.filter((p) => p.status === "booked").length,
    cold: filteredPatients.filter((p) => p.status === "cold").length,
  };

  // Count follow-ups by type
  const followUpCounts = {
    call: followUps.filter((f) => f.type === "call").length,
    message: followUps.filter((f) => f.type === "message").length,
  };

  // Get recent follow-ups
  const recentFollowUps = [...followUps]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <h3 className="text-2xl font-bold">{filteredPatients.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Booked Appointments
              </p>
              <h3 className="text-2xl font-bold">
                {patientStatusCounts.booked}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <PhoneCall className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Call Follow-ups</p>
              <h3 className="text-2xl font-bold">{followUpCounts.call}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Message Follow-ups
              </p>
              <h3 className="text-2xl font-bold">{followUpCounts.message}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart className="h-5 w-5" /> Patient Status
            </CardTitle>
            <CardDescription>
              Overview of current patient statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <StatusBadge status="pending" />
                <div className="w-full mx-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (patientStatusCounts.pending / filteredPatients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {patientStatusCounts.pending}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <StatusBadge status="contacted" />
                <div className="w-full mx-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (patientStatusCounts.contacted /
                          filteredPatients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {patientStatusCounts.contacted}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <StatusBadge status="interested" />
                <div className="w-full mx-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (patientStatusCounts.interested /
                          filteredPatients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {patientStatusCounts.interested}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <StatusBadge status="booked" />
                <div className="w-full mx-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (patientStatusCounts.booked / filteredPatients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {patientStatusCounts.booked}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <StatusBadge status="cold" />
                <div className="w-full mx-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gray-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (patientStatusCounts.cold / filteredPatients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {patientStatusCounts.cold}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Follow-ups</CardTitle>
            <CardDescription>
              Latest patient communications
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
                    className="flex items-start p-3 border rounded-lg bg-gray-50"
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
                      <p className="text-sm font-medium text-gray-900 truncate">
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
                          ? "Call Again"
                          : followUp.response.charAt(0).toUpperCase() +
                            followUp.response.slice(1)}
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
