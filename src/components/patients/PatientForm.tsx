
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormValues, defaultPatientValues } from "@/schemas/patientSchema";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { TreatmentInfoForm } from "./TreatmentInfoForm";
import { FollowUpPreferencesForm } from "./FollowUpPreferencesForm";
import { ClinicInfoForm } from "./ClinicInfoForm";
import { AdditionalInfoForm } from "./AdditionalInfoForm";
import { VoipInfoForm } from "./VoipInfoForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Profile, Clinic, Patient } from "@/types/supabase";
import { CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  doctors: Profile[];
  clinics: Clinic[];
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  onSuccess, 
  onCancel,
  doctors,
  clinics
}) => {
  const { t } = useLanguage();
  const { profile, session } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize form with profile-specific default values
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      ...defaultPatientValues,
      doctor_id: profile?.id || "",
      clinic_id: profile?.clinic_id || "",
    },
  });

  const onSubmit = async (values: PatientFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting patient form with values:", values);
    console.log("Current user profile:", profile);
    console.log("Current session:", session);
    
    try {
      // Check authentication status directly
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const isAdminBypass = localStorage.getItem("admin_bypass");
      
      if (!currentSession && !isAdminBypass) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      // Transform the data to match the patient table structure without using Partial<Patient>
      const patientData = {
        name: values.name, // Required field
        age: values.age !== undefined && values.age !== null ? Number(values.age) : null,
        gender: values.gender,
        phone: values.phone, // Required field
        email: values.email || null,
        treatment_category: values.treatment_category || null,
        treatment_type: values.treatment_type || null,
        price: values.price !== undefined && values.price !== null ? Number(values.price) : null,
        doctor_id: values.doctor_id || profile?.id || null,
        clinic_id: values.clinic_id || profile?.clinic_id || null,
        follow_up_required: values.follow_up_required,
        status: "Pending", // Using the type from Patient interface
        preferred_time: values.preferred_time,
        preferred_channel: values.preferred_channel,
        availability_preferences: values.availability_preferences || null,
        notes: values.notes || null,
        script: values.script || null,
        voip_call_id: values.voip_call_id || null,
        voip_call_status: values.voip_call_status || null,
        last_modified_by: profile?.id,
      };

      console.log("Sending patient data to Supabase:", patientData);
      
      // Direct Supabase insert with more detailed error handling
      const { data: result, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select();
      
      console.log("Insert result:", result);
      
      if (error) {
        console.error("Supabase error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          throw new Error("Permission denied. You may not have rights to add patients.");
        } else if (error.code === '23505') {
          throw new Error("A patient with this information already exists.");
        } else {
          throw error;
        }
      }
      
      toast.success(t("patientAddedSuccessfully"));
      onSuccess();
    } catch (error: any) {
      console.error("Error adding patient:", error);
      
      // Provide more user-friendly error messages
      let errorMessage = "An unknown error occurred";
      
      if (error.message.includes("JWT expired")) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error.message.includes("Invalid JWT")) {
        errorMessage = "Invalid authentication. Please log in again.";
      } else if (error.message.includes("Permission denied")) {
        errorMessage = "You don't have permission to add patients.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error adding patient: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <PersonalInfoForm control={form.control} />
          <TreatmentInfoForm control={form.control} />
          <FollowUpPreferencesForm control={form.control} />
          <ClinicInfoForm 
            control={form.control} 
            doctors={doctors} 
            clinics={clinics} 
          />
          <VoipInfoForm control={form.control} />
          <AdditionalInfoForm control={form.control} />
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            {t("cancel")}
          </Button>
          <Button 
            type="submit" 
            className="bg-medical-teal hover:bg-teal-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? `${t("adding")}...` : t("addPatient")}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
