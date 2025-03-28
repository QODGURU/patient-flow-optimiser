
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
import { useLanguage } from "@/contexts/LanguageContext";
import { Profile, Clinic, Patient } from "@/types/supabase";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useMutateSupabase } from "@/hooks/useSupabase";
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
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { insert } = useMutateSupabase();

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
    console.log("Submitting form with values:", values);
    
    try {
      // Transform the data to match the patient table structure
      const patientData: Partial<Patient> = {
        name: values.name,
        age: values.age !== undefined && values.age !== null ? Number(values.age) : null,
        gender: values.gender,
        phone: values.phone,
        email: values.email || null,
        treatment_category: values.treatment_category || null,
        treatment_type: values.treatment_type || null,
        price: values.price !== undefined && values.price !== null ? Number(values.price) : null,
        doctor_id: values.doctor_id || profile?.id || null,
        clinic_id: values.clinic_id || profile?.clinic_id || null,
        follow_up_required: values.follow_up_required,
        status: "Pending",
        preferred_time: values.preferred_time as any || null,
        preferred_channel: values.preferred_channel as any || null,
        availability_preferences: values.availability_preferences || null,
        notes: values.notes || null,
        script: values.script || null,
        last_modified_by: profile?.id,
      };

      console.log("Sending patient data to Supabase:", patientData);
      
      const result = await insert<Patient>("patients", patientData);
      console.log("Insert result:", result);
      
      toast.success(t("patientAddedSuccessfully"));
      onSuccess();
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error(t("errorAddingPatient"));
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
            {isSubmitting ? "Adding..." : t("addPatient")}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
