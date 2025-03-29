import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { patients, followUps } from "@/data/mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  FileText,
  Edit,
} from "lucide-react";

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState<any>(null);
  const [patientFollowUps, setPatientFollowUps] = useState<any[]>([]);
  const [newFollowUp, setNewFollowUp] = useState({
    type: "call",
    response: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    // In a real app, we'd fetch from an API
    const foundPatient = patients.find((p) => p.id === id);
    const patientFollowUps = followUps.filter((f) => f.patientId === id);
    
    setPatient(foundPatient || null);
    setPatientFollowUps(patientFollowUps);
    setNewStatus(foundPatient?.status || "");
    setLoading(false);
  }, [id]);

  const handleStatusChange = (value: string) => {
    setNewStatus(value);
  };

  const updatePatientStatus = () => {
    // In a real app, we'd make an API call
    setPatient((prev: any) => ({ ...prev, status: newStatus }));
    toast.success("Patient status updated successfully");
    setStatusUpdateOpen(false);
  };

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFollowUp((prev) => ({ ...prev, [name]: value }));
  };

  const handleFollowUpTypeChange = (value: string) => {
    setNewFollowUp((prev) => ({ ...prev, type: value }));
  };

  const handleFollowUpResponseChange = (value: string) => {
    setNewFollowUp((prev) => ({ ...prev, response: value }));
  };

  const addFollowUp = () => {
    // In a real app, we'd make an API call
    const newFollowUpData = {
      id: Date.now().toString(),
      patientId: id!,
      type: newFollowUp.type,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      response: newFollowUp.response || null,
      notes: newFollowUp.notes,
    };
    
    setPatientFollowUps((prev) => [newFollowUpData, ...prev]);
    setNewFollowUp({
      type: "call",
      response: "",
      notes: "",
    });
    
    toast.success("Follow-up added successfully");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
        <p className="text-gray-600 mb-6">The patient you're looking for does not exist.</p>
        <Button onClick={() => navigate("/patients")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => navigate("/patients")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
      </div>

      {/* Patient Summary Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{patient.name}</CardTitle>
            <CardDescription>
              Patient ID: {patient.id} • Created: {new Date(patient.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={patient.status} className="h-fit" />
            <Button
              variant="outline"
              size="sm"
              className="h-fit"
              onClick={() => setStatusUpdateOpen(!statusUpdateOpen)}
            >
              <Edit className="h-3 w-3 mr-1" /> Update Status
            </Button>
          </div>
        </CardHeader>
        
        {statusUpdateOpen && (
          <div className="px-6 pb-3 flex items-center gap-2">
            <Select
              value={newStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={updatePatientStatus}>
              Save
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setStatusUpdateOpen(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Age:</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Gender:</span>
                <span className="font-medium capitalize">{patient.gender}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Phone:</span>
                <span className="font-medium">{patient.phone}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Treatment:</span>
                <span className="font-medium">{patient.treatment}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Price:</span>
                <span className="font-medium">{patient.price.toLocaleString()} AED</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Clinic:</span>
                <span className="font-medium">{patient.clinicName}</span>
              </div>
            </div>
          </div>
          
          {patient.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes:</h3>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {patient.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups and Communication Tabs */}
      <Tabs defaultValue="followups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="addnew">Add New Follow-up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="followups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                All follow-up attempts and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patientFollowUps.length > 0 ? (
                <div className="space-y-4">
                  {patientFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          {followUp.type === "call" ? (
                            <Phone className="h-4 w-4 text-yellow-700 mr-2" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-purple-700 mr-2" />
                          )}
                          <span className="font-medium capitalize">
                            {followUp.type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {followUp.date}
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {followUp.time}
                        </div>
                      </div>
                      
                      {followUp.response && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-500 mr-2">Response:</span>
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
                        </div>
                      )}
                      
                      {followUp.notes && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Notes:</span>
                          <p className="text-sm mt-1">{followUp.notes}</p>
                        </div>
                      )}
                      
                      {followUp.transcript && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-sm text-gray-500">Transcript:</span>
                          <p className="text-sm mt-1 text-gray-700">
                            {followUp.transcript}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No follow-ups recorded yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add a new follow-up to start tracking communication
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addnew">
          <Card>
            <CardHeader>
              <CardTitle>Record New Follow-up</CardTitle>
              <CardDescription>
                Add details about your communication with this patient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followupType">Communication Type</Label>
                  <Select
                    value={newFollowUp.type}
                    onValueChange={handleFollowUpTypeChange}
                  >
                    <SelectTrigger id="followupType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="followupResponse">Response</Label>
                  <Select
                    value={newFollowUp.response}
                    onValueChange={handleFollowUpResponseChange}
                  >
                    <SelectTrigger id="followupResponse">
                      <SelectValue placeholder="Select response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes (Positive)</SelectItem>
                      <SelectItem value="no">No (Negative)</SelectItem>
                      <SelectItem value="maybe">Maybe (Unsure)</SelectItem>
                      <SelectItem value="call_again">Call Again Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newFollowUp.notes}
                  onChange={handleFollowUpChange}
                  placeholder="Enter details about the communication"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={addFollowUp}
                  className="bg-medical-teal hover:bg-teal-600"
                >
                  Save Follow-up
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetailsPage;
