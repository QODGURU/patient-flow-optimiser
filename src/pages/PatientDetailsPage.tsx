
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  Save,
  Trash2
} from "lucide-react";
import { Patient, FollowUp, Profile, Clinic } from "@/types/supabase";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { Skeleton } from "@/components/ui/skeleton";

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [editMode, setEditMode] = useState(false);
  const [patientData, setPatientData] = useState<Partial<Patient> | null>(null);
  const [newFollowUp, setNewFollowUp] = useState({
    type: "Call",
    response: "",
    notes: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch patient data
  const { 
    data: patients,
    loading: patientLoading, 
    refetch: refetchPatient 
  } = useSupabaseQuery<Patient>(
    "patients",
    {
      filters: { id },
      enabled: !!id
    }
  );

  // Fetch follow-ups for this patient
  const { 
    data: followUps,
    loading: followUpsLoading, 
    refetch: refetchFollowUps 
  } = useSupabaseQuery<FollowUp>(
    "follow_ups",
    {
      filters: { patient_id: id },
      orderBy: { column: "created_at", ascending: false },
      enabled: !!id
    }
  );

  // Fetch clinics
  const { data: clinics, loading: clinicsLoading } = useSupabaseQuery<Clinic>("clinics");
  
  // Fetch doctors (profiles with role=doctor)
  const { data: doctors, loading: doctorsLoading } = useSupabaseQuery<Profile>(
    "profiles",
    {
      filters: { role: "doctor" }
    }
  );

  // Mutations
  const { 
    update: updatePatient,
    insert: insertFollowUp,
    remove: deletePatient,
    loading: mutationLoading 
  } = useMutateSupabase();

  // Set initial patient data
  useEffect(() => {
    if (patients.length > 0) {
      setPatientData(patients[0]);
    }
  }, [patients]);

  const patient = patients[0];
  const clinic = clinics.find(c => c.id === patient?.clinic_id);
  const doctor = doctors.find(d => d.id === patient?.doctor_id);

  const handlePatientDataChange = (field: string, value: any) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFollowUp(prev => ({ ...prev, [name]: value }));
  };

  const handleFollowUpTypeChange = (value: string) => {
    setNewFollowUp(prev => ({ ...prev, type: value }));
  };

  const handleFollowUpResponseChange = (value: string) => {
    setNewFollowUp(prev => ({ ...prev, response: value }));
  };

  const savePatientChanges = async () => {
    if (!patientData || !id) return;
    
    try {
      await updatePatient("patients", id, {
        ...patientData,
        last_modified: new Date().toISOString(),
        last_modified_by: profile?.id
      });
      
      toast.success("Patient details updated successfully");
      refetchPatient();
      setEditMode(false);
    } catch (error) {
      // Error handling is in the hook
    }
  };

  const addFollowUp = async () => {
    if (!id || !profile) return;
    
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      const time = today.toTimeString().split(' ')[0].substring(0, 5);
      
      await insertFollowUp("follow_ups", {
        patient_id: id,
        type: newFollowUp.type,
        date,
        time,
        notes: newFollowUp.notes,
        response: newFollowUp.response || null,
        created_by: profile.id
      });
      
      // Update patient's last interaction details
      await updatePatient("patients", id, {
        last_interaction: new Date().toISOString(),
        last_interaction_outcome: newFollowUp.response as any || null,
        last_modified: new Date().toISOString(),
        last_modified_by: profile.id,
        call_attempts: newFollowUp.type === "Call" 
          ? ((patient?.call_attempts || 0) + 1) 
          : patient?.call_attempts,
        sms_attempts: newFollowUp.type === "SMS" 
          ? ((patient?.sms_attempts || 0) + 1) 
          : patient?.sms_attempts
      });
      
      setNewFollowUp({
        type: "Call",
        response: "",
        notes: "",
      });
      
      toast.success("Follow-up added successfully");
      refetchFollowUps();
      refetchPatient();
    } catch (error) {
      // Error handling is in the hook
    }
  };

  const handleDeletePatient = async () => {
    if (!id) return;
    
    try {
      await deletePatient("patients", id);
      toast.success("Patient deleted successfully");
      navigate("/patients");
    } catch (error) {
      // Error handling is in the hook
    }
  };

  if (patientLoading && !patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    );
  }

  if (!patient && !patientLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-[#101B4C] mb-2">Patient Not Found</h2>
        <p className="text-[#2B2E33] mb-6">The patient you're looking for does not exist.</p>
        <Button onClick={() => navigate("/patients")} className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4 border-[#2B2E33]/20"
            onClick={() => navigate("/patients")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-[#101B4C]">Patient Details</h1>
        </div>
        
        <div className="flex gap-2">
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              className="border-[#2B2E33]/20"
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <Button
              onClick={savePatientChanges}
              disabled={mutationLoading}
              className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-1" /> Save Changes
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="text-[#FF3B3B] border-[#FF3B3B]/20 hover:bg-[#FF3B3B]/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Patient Summary Card */}
      <Card className="mb-6 border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl text-[#101B4C]">{patient?.name}</CardTitle>
            <CardDescription>
              Patient ID: {patient?.id?.substring(0, 8)} • Created: {patient?.created_at && new Date(patient.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={patient?.status || "Pending"} className="h-fit" />
            {editMode && (
              <Select
                value={patientData?.status}
                onValueChange={(value) => handlePatientDataChange('status', value)}
              >
                <SelectTrigger className="w-40 h-fit border-[#2B2E33]/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {editMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Patient Name</Label>
                    <Input
                      id="patient-name"
                      value={patientData?.name || ""}
                      onChange={(e) => handlePatientDataChange('name', e.target.value)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-age">Age</Label>
                    <Input
                      id="patient-age"
                      type="number"
                      value={patientData?.age || ""}
                      onChange={(e) => handlePatientDataChange('age', parseInt(e.target.value) || null)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-gender">Gender</Label>
                    <Select
                      value={patientData?.gender || ""}
                      onValueChange={(value) => handlePatientDataChange('gender', value)}
                    >
                      <SelectTrigger id="patient-gender" className="border-[#2B2E33]/20">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-phone">Phone</Label>
                    <Input
                      id="patient-phone"
                      value={patientData?.phone || ""}
                      onChange={(e) => handlePatientDataChange('phone', e.target.value)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      value={patientData?.email || ""}
                      onChange={(e) => handlePatientDataChange('email', e.target.value)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Age:</span>
                    <span className="font-medium">{patient?.age ? `${patient.age} years` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Gender:</span>
                    <span className="font-medium capitalize">{patient?.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Phone:</span>
                    <span className="font-medium">{patient?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Email:</span>
                    <span className="font-medium">{patient?.email || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              {editMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="patient-treatment-cat">Treatment Category</Label>
                    <Input
                      id="patient-treatment-cat"
                      value={patientData?.treatment_category || ""}
                      onChange={(e) => handlePatientDataChange('treatment_category', e.target.value)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-treatment">Treatment Type</Label>
                    <Input
                      id="patient-treatment"
                      value={patientData?.treatment_type || ""}
                      onChange={(e) => handlePatientDataChange('treatment_type', e.target.value)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-price">Price (AED)</Label>
                    <Input
                      id="patient-price"
                      type="number"
                      value={patientData?.price || ""}
                      onChange={(e) => handlePatientDataChange('price', parseFloat(e.target.value) || null)}
                      className="border-[#2B2E33]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-clinic">Clinic</Label>
                    <Select
                      value={patientData?.clinic_id || ""}
                      onValueChange={(value) => handlePatientDataChange('clinic_id', value)}
                      disabled={clinicsLoading}
                    >
                      <SelectTrigger id="patient-clinic" className="border-[#2B2E33]/20">
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map(clinic => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-doctor">Assigned Doctor</Label>
                    <Select
                      value={patientData?.doctor_id || ""}
                      onValueChange={(value) => handlePatientDataChange('doctor_id', value)}
                      disabled={doctorsLoading}
                    >
                      <SelectTrigger id="patient-doctor" className="border-[#2B2E33]/20">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Treatment Category:</span>
                    <span className="font-medium">{patient?.treatment_category || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Treatment Type:</span>
                    <span className="font-medium">{patient?.treatment_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Price:</span>
                    <span className="font-medium">
                      {patient?.price ? `${patient.price.toLocaleString()} AED` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Clinic:</span>
                    <span className="font-medium">{clinic?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-[#2B2E33]/40 mr-2" />
                    <span className="text-sm text-[#2B2E33] mr-2">Doctor:</span>
                    <span className="font-medium">{doctor?.name || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {editMode ? (
            <>
              <div className="mt-6 space-y-2">
                <Label htmlFor="patient-script">Script</Label>
                <Textarea
                  id="patient-script"
                  value={patientData?.script || ""}
                  onChange={(e) => handlePatientDataChange('script', e.target.value)}
                  placeholder="Add a script that will be used by the calling agent"
                  rows={4}
                  className="border-[#2B2E33]/20"
                />
              </div>
              
              <div className="mt-6 space-y-2">
                <Label htmlFor="patient-notes">Notes</Label>
                <Textarea
                  id="patient-notes"
                  value={patientData?.notes || ""}
                  onChange={(e) => handlePatientDataChange('notes', e.target.value)}
                  placeholder="Add notes about this patient"
                  rows={4}
                  className="border-[#2B2E33]/20"
                />
              </div>
            </>
          ) : (
            <>
              {patient?.script && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-[#101B4C] mb-2">Script:</h3>
                  <div className="p-3 bg-[#101B4C]/5 rounded-md text-sm">
                    {patient.script}
                  </div>
                </div>
              )}
              
              {patient?.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-[#101B4C] mb-2">Notes:</h3>
                  <div className="p-3 bg-[#101B4C]/5 rounded-md text-sm">
                    {patient.notes}
                  </div>
                </div>
              )}
            </>
          )}
          
          {editMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="preferred-time">Preferred Contact Time</Label>
                <Select
                  value={patientData?.preferred_time || ""}
                  onValueChange={(value) => handlePatientDataChange('preferred_time', value)}
                >
                  <SelectTrigger id="preferred-time" className="border-[#2B2E33]/20">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred-channel">Preferred Channel</Label>
                <Select
                  value={patientData?.preferred_channel || ""}
                  onValueChange={(value) => handlePatientDataChange('preferred_channel', value)}
                >
                  <SelectTrigger id="preferred-channel" className="border-[#2B2E33]/20">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Follow-up Required</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="follow-up-required"
                    checked={patientData?.follow_up_required || false}
                    onCheckedChange={(checked) => 
                      handlePatientDataChange('follow_up_required', !!checked)
                    }
                  />
                  <Label htmlFor="follow-up-required" className="cursor-pointer">
                    This patient needs follow-up
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups and Communication Tabs */}
      <Tabs defaultValue="followups" className="space-y-4">
        <TabsList className="border-b border-[#101B4C]/10">
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="addnew">Add New Follow-up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="followups" className="space-y-4">
          <Card className="border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl text-[#101B4C]">Communication History</CardTitle>
              <CardDescription>
                All follow-up attempts and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followUpsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : followUps.length > 0 ? (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="border rounded-lg p-4 bg-[#101B4C]/5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          {followUp.type.toLowerCase().includes('call') ? (
                            <Phone className="h-4 w-4 text-[#FFC107] mr-2" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-[#00FFC8] mr-2" />
                          )}
                          <span className="font-medium capitalize">
                            {followUp.type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-[#2B2E33]">
                          <Calendar className="h-3 w-3 mr-1" />
                          {followUp.date}
                          <Clock className="h-3 w-3 ml-2 mr-1" />
                          {followUp.time}
                        </div>
                      </div>
                      
                      {followUp.response && (
                        <div className="mb-3">
                          <span className="text-sm text-[#2B2E33] mr-2">Response:</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              followUp.response === "Yes"
                                ? "bg-green-100 text-green-800"
                                : followUp.response === "No"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {followUp.response}
                          </span>
                        </div>
                      )}
                      
                      {followUp.notes && (
                        <div className="mt-2">
                          <span className="text-sm text-[#2B2E33]">Notes:</span>
                          <p className="text-sm mt-1">{followUp.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#2B2E33]">No follow-ups recorded yet</p>
                  <p className="text-sm text-[#2B2E33]/60 mt-1">
                    Add a new follow-up to start tracking communication
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addnew">
          <Card className="border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl text-[#101B4C]">Record New Follow-up</CardTitle>
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
                    <SelectTrigger id="followupType" className="border-[#2B2E33]/20">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call">Phone Call</SelectItem>
                      <SelectItem value="SMS">Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="followupResponse">Response</Label>
                  <Select
                    value={newFollowUp.response}
                    onValueChange={handleFollowUpResponseChange}
                  >
                    <SelectTrigger id="followupResponse" className="border-[#2B2E33]/20">
                      <SelectValue placeholder="Select response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes (Positive)</SelectItem>
                      <SelectItem value="No">No (Negative)</SelectItem>
                      <SelectItem value="Maybe">Maybe (Unsure)</SelectItem>
                      <SelectItem value="No Answer">No Answer</SelectItem>
                      <SelectItem value="Opt-out">Opt-out</SelectItem>
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
                  className="border-[#2B2E33]/20"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={addFollowUp}
                  disabled={mutationLoading}
                  className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
                >
                  {mutationLoading ? "Saving..." : "Save Follow-up"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#101B4C]">Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={mutationLoading}
              className="border-[#2B2E33]/20"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePatient}
              disabled={mutationLoading}
              className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/90"
            >
              {mutationLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetailsPage;
