
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { Control } from "react-hook-form";
import { PatientFormValues } from "@/schemas/patientSchema";

interface TreatmentInfoFormProps {
  control: Control<PatientFormValues>;
}

export const TreatmentInfoForm: React.FC<TreatmentInfoFormProps> = ({ control }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">{t("treatmentInformation")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="treatment_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("treatmentCategory")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Dental" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="treatment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("treatmentType")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Dental Implant" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("price")} (AED)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="follow_up_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {t("thisPatientNeedsFollowUp")}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
