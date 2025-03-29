import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { Patient, FollowUp, Profile } from "@/types/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FollowUpTable } from "@/components/FollowUpTable";

const PatientDetailsPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [nextInteraction, setNextInteraction] = useState<Date | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manualPatientData, setManualPatientData] = useState<Patient | null>(null);

  // Check if we have demo data
  useEffect(() => {
    if (patientId) {
      const demoPatients = localStorage.getItem("demo_patients");
      if (demoPatients) {
        try {
          const parsedPatients = JSON.parse(demoPatients);
          const patient = parsedPatients.find((p: Patient) => p.id === patientId);
          if (patient) {
            console.log("Found patient in demo data:", patient);
            setManualPatientData(patient);
            
            // Set initial form values
            setName(patient.name);
            setPhone(patient.phone);
            setEmail(patient.email || "");
            setNotes(patient.notes || "");
            setNextInteraction(patient.next_interaction ? new Date(patient.next_interaction) : undefined);
          }
        } catch (error) {
          console.error("Error parsing demo patients:", error);
        }
      }
    }
  }, [patientId]);

  const { data: patient, loading: patientLoading } = useSupabaseQuery<Patient>(
    "patients",
    {
      filters: { id: patientId },
      enabled: !!patientId && !manualPatientData,
    }
  );

  const { data: doctors } = useSupabaseQuery<Profile>("profiles", {
    filters: { role: "doctor" },
  });

  const { update, remove, loading: mutationLoading } = useMutateSupabase();

  useEffect(() => {
    if (patient && patient.length > 0 && !manualPatientData) {
      setName(patient[0].name);
      setPhone(patient[0].phone);
      setEmail(patient[0].email || "");
      setNotes(patient[0].notes || "");
      setNextInteraction(patient[0].next_interaction ? new Date(patient[0].next_interaction) : undefined);
    }
  }, [patient, manualPatientData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (manualPatientData) {
      setName(manualPatientData.name);
      setPhone(manualPatientData.phone);
      setEmail(manualPatientData.email || "");
      setNotes(manualPatientData.notes || "");
      setNextInteraction(manualPatientData.next_interaction ? new Date(manualPatientData.next_interaction) : undefined);
    } else if (patient && patient.length > 0) {
      setName(patient[0].name);
      setPhone(patient[0].phone);
      setEmail(patient[0].email || "");
      setNotes(patient[0].notes || "");
      setNextInteraction(patient[0].next_interaction ? new Date(patient[0].next_interaction) : undefined);
    }
  };

  const handleSaveClick = async () => {
    if (!patientId) return;

    try {
      // If we're in demo mode, update localStorage instead of database
      if (manualPatientData) {
        const demoPatients = localStorage.getItem("demo_patients");
        if (demoPatients) {
          const parsedPatients = JSON.parse(demoPatients);
          const updatedPatients = parsedPatients.map((p: Patient) => {
            if (p.id === patientId) {
              return {
                ...p,
                name,
                phone,
                email,
                notes,
                next_interaction: nextInteraction?.toISOString() || null,
                last_modified: new Date().toISOString(),
              };
            }
            return p;
          });
          
          // Update localStorage and state
          localStorage.setItem("demo_patients", JSON.stringify(updatedPatients));
          setManualPatientData({ ...manualPatientData, name, phone, email, notes });
          toast.success("Patient details updated successfully");
          setIsEditing(false);
          return;
        }
      }
      
      // Otherwise use Supabase
      await update("patients", patientId, {
        name,
        phone,
        email,
        notes,
        next_interaction: nextInteraction?.toISOString() || null,
        last_modified: new Date().toISOString(),
        last_modified_by: profile?.id,
      });
      toast.success("Patient details updated successfully");
      setIsEditing(false);
    } catch (error) {
      // Error is handled in the mutation hook
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientId) return;

    try {
      // If we're in demo mode, update localStorage instead of database
      if (manualPatientData) {
        const demoPatients = localStorage.getItem("demo_patients");
        if (demoPatients) {
          const parsedPatients = JSON.parse(demoPatients);
          const updatedPatients = parsedPatients.filter((p: Patient) => p.id !== patientId);
          
          // Update localStorage
          localStorage.setItem("demo_patients", JSON.stringify(updatedPatients));
          
          // Also update follow-ups in localStorage to remove any for this patient
          const demoFollowUps = localStorage.getItem("demo_follow_ups");
          if (demoFollowUps) {
            const parsedFollowUps = JSON.parse(demoFollowUps);
            const updatedFollowUps = parsedFollowUps.filter((f: FollowUp) => f.patient_id !== patientId);
            localStorage.setItem("demo_follow_ups", JSON.stringify(updatedFollowUps));
          }
          
          toast.success("Patient deleted successfully");
          navigate("/patients");
          return;
        }
      }
      
      // Otherwise use Supabase
      await remove("patients", patientId);
      toast.success("Patient deleted successfully");
      navigate("/patients");
    } catch (error) {
      // Error is handled in the mutation hook
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (patientLoading && !manualPatientData) {
    return <div>Loading patient details...</div>;
  }

  // If we don't have a patient object either from Supabase or demo data
  if (!manualPatientData && (!patient || patient.length === 0)) {
    return <div>Patient not found</div>;
  }

  // Use either the manual data or the first patient from Supabase
  const patientData = manualPatientData || patient[0];
  
  const {
    age,
    gender,
    treatment_category,
    treatment_type,
    price,
    follow_up_required,
    status,
    preferred_time,
    preferred_channel,
    availability_preferences,
    script,
    created_at,
    last_interaction,
    last_interaction_outcome,
    call_attempts,
    sms_attempts,
    sms_transcript,
    call_transcript,
    interaction_rating,
    patient_feedback,
  } = patientData;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/patients")}>
          ← Back to Patients
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>
            {isEditing ? "Edit Patient Details" : "Patient Details"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div>
                <Label>Next Interaction</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !nextInteraction && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextInteraction ? (
                        format(nextInteraction, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={nextInteraction}
                      onSelect={setNextInteraction}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{name}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p>{phone}</p>
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <p>{email || "N/A"}</p>
              </div>
              <div>
                <Label>Notes</Label>
                <p>{notes || "N/A"}</p>
              </div>
              <div>
                <Label>Next Interaction</Label>
                <p>{nextInteraction ? new Date(nextInteraction).toLocaleString() : "Not scheduled"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <p>{age || "N/A"}</p>
                </div>
                <div>
                  <Label>Gender</Label>
                  <p>{gender || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Treatment Category</Label>
                  <p>{treatment_category || "N/A"}</p>
                </div>
                <div>
                  <Label>Treatment Type</Label>
                  <p>{treatment_type || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <p>{price ? `${price.toLocaleString()} AED` : "N/A"}</p>
                </div>
                <div>
                  <Label>Follow-Up Required</Label>
                  <p>{follow_up_required ? "Yes" : "No"}</p>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <p>{status || "N/A"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Time</Label>
                  <p>{preferred_time || "N/A"}</p>
                </div>
                <div>
                  <Label>Preferred Channel</Label>
                  <p>{preferred_channel || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label>Availability Preferences</Label>
                <p>{availability_preferences || "N/A"}</p>
              </div>
              <div>
                <Label>Script</Label>
                <p>{script || "N/A"}</p>
              </div>
              <div>
                <Label>Created At</Label>
                <p>{created_at ? new Date(created_at).toLocaleString() : "N/A"}</p>
              </div>
              <div>
                <Label>Last Interaction</Label>
                <p>{last_interaction ? new Date(last_interaction).toLocaleString() : "N/A"}</p>
              </div>
              <div>
                <Label>Last Interaction Outcome</Label>
                <p>{last_interaction_outcome || "N/A"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Call Attempts</Label>
                  <p>{call_attempts || "0"}</p>
                </div>
                <div>
                  <Label>SMS Attempts</Label>
                  <p>{sms_attempts || "0"}</p>
                </div>
              </div>
              <div>
                <Label>SMS Transcript</Label>
                <p>{sms_transcript || "N/A"}</p>
              </div>
              <div>
                <Label>Call Transcript</Label>
                <p>{call_transcript || "N/A"}</p>
              </div>
              <div>
                <Label>Interaction Rating</Label>
                <p>{interaction_rating || "N/A"}</p>
              </div>
              <div>
                <Label>Patient Feedback</Label>
                <p>{patient_feedback || "N/A"}</p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button
                className="bg-medical-teal hover:bg-teal-600"
                onClick={handleSaveClick}
                disabled={mutationLoading}
              >
                {mutationLoading ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEditClick}>
                Edit Details
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={mutationLoading}
                className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/90"
              >
                Delete Patient
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <FollowUpTable patientId={patientId} />

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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
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
