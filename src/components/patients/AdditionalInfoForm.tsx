
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { PatientFormValues } from "@/schemas/patientSchema";

interface AdditionalInfoFormProps {
  control: Control<PatientFormValues>;
}

export const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({ control }) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">Additional Information</h3>
      
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Any additional notes about this patient" 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="script"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call Script</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Script for calling this patient" 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
