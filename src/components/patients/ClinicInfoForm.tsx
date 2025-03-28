
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Control } from "react-hook-form";
import { PatientFormValues } from "@/schemas/patientSchema";
import { Profile, Clinic } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ClinicInfoFormProps {
  control: Control<PatientFormValues>;
  doctors: Profile[];
  clinics: Clinic[];
}

export const ClinicInfoForm: React.FC<ClinicInfoFormProps> = ({ control, doctors, clinics }) => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">{t("clinicInformation")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isAdmin && (
          <FormField
            control={control}
            name="doctor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("assignedDoctor")}</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectDoctor")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={control}
          name="clinic_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("clinicName")}</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clinic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
