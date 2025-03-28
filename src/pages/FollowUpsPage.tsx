
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { patients, followUps } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Phone, MessageSquare, Filter } from "lucide-react";

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
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-40">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <span>Type</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={responseFilter}
            onValueChange={setResponseFilter}
          >
            <SelectTrigger className="w-40">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <span>Response</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Responses</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
              <SelectItem value="call_again">Call Again</SelectItem>
              <SelectItem value={null}>No Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Follow-ups</CardTitle>
              <CardDescription>Latest communications with patients</CardDescription>
            </CardHeader>
            <CardContent>
              {recentFollowUps.length > 0 ? (
                <div className="space-y-4">
                  {recentFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link to={`/patients/${followUp.patientId}`}>
                            <h3 className="font-medium text-medical-navy hover:underline">
                              {followUp.patientName}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {followUp.clinicName}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {followUp.type === "call" ? (
                            <div className="bg-yellow-100 p-2 rounded-full">
                              <Phone className="h-4 w-4 text-yellow-700" />
                            </div>
                          ) : (
                            <div className="bg-purple-100 p-2 rounded-full">
                              <MessageSquare className="h-4 w-4 text-purple-700" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {followUp.date}
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {followUp.time}
                        </div>
                        
                        {followUp.response ? (
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
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            No Response
                          </span>
                        )}
                      </div>
                      
                      {followUp.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm">{followUp.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <Link to={`/patients/${followUp.patientId}`}>
                          <Button variant="outline" size="sm">
                            View Patient
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No follow-ups found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try changing your filters or add new follow-ups
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Responses</CardTitle>
              <CardDescription>
                Follow-ups that need further action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingFollowUps.length > 0 ? (
                <div className="space-y-4">
                  {pendingFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link to={`/patients/${followUp.patientId}`}>
                            <h3 className="font-medium text-medical-navy hover:underline">
                              {followUp.patientName}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {followUp.clinicName}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {followUp.type === "call" ? (
                            <div className="bg-yellow-100 p-2 rounded-full">
                              <Phone className="h-4 w-4 text-yellow-700" />
                            </div>
                          ) : (
                            <div className="bg-purple-100 p-2 rounded-full">
                              <MessageSquare className="h-4 w-4 text-purple-700" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        {followUp.date}
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        {followUp.time}
                      </div>
                      
                      {followUp.notes && (
                        <div className="mb-3">
                          <p className="text-sm">{followUp.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Link to={`/patients/${followUp.patientId}`}>
                          <Button variant="outline" size="sm">
                            Update Status
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending follow-ups</p>
                  <p className="text-sm text-gray-400 mt-1">
                    All follow-ups have responses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowUpsPage;
