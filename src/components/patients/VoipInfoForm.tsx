
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Control } from "react-hook-form";
import { PatientFormValues } from "@/schemas/patientSchema";

interface VoipInfoFormProps {
  control: Control<PatientFormValues>;
}

export const VoipInfoForm: React.FC<VoipInfoFormProps> = ({ control }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">VoIP Call Settings</h3>
      <FormDescription>
        Configure settings for automated VoIP calls using Voximplant
      </FormDescription>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="voip_call_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VoIP Call ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Auto-generated after call" disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="voip_call_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call Status</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Not called yet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="no-answer">No Answer</SelectItem>
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
