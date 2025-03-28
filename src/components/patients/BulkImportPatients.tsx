
import React from "react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMutateSupabase } from "@/hooks/useSupabase";
import { Patient } from "@/types/supabase";
import FileUploader from "@/components/FileUploader";
import { DownloadCloud } from "lucide-react";
import * as XLSX from 'xlsx';

interface BulkImportPatientsProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BulkImportPatients: React.FC<BulkImportPatientsProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { insert } = useMutateSupabase();

  const handleFileAccepted = async (file: File) => {
    console.log("File accepted:", file.name);
    toast.success(`${file.name} uploaded successfully. Processing...`);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, {type: 'array'});
        
        // Get first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error("No data found in the file");
          return;
        }
        
        // Process records
        let successCount = 0;
        let errorCount = 0;
        
        for (const record of jsonData) {
          try {
            // Map spreadsheet columns to database fields
            const patientData: Partial<Patient> = {
              name: record['Patient Name'],
              age: record['Age'] ? Number(record['Age']) : null,
              gender: record['Gender'],
              phone: record['Phone'],
              email: record['Email'] || null,
              treatment_category: record['Treatment Category'] || null,
              treatment_type: record['Treatment Type'] || null,
              price: record['Price (AED)'] ? Number(record['Price (AED)']) : null,
              follow_up_required: record['Follow-Up Required'] === 'Yes',
              status: record['Status'] || 'Pending',
              preferred_time: record['Preferred Follow-Up Time'] as any || null,
              preferred_channel: record['Preferred Channel'] as any || null,
              availability_preferences: record['Availability Preferences'] || null,
              notes: record['Notes'] || null,
              script: record['Script'] || null,
              doctor_id: profile?.id,
              clinic_id: profile?.clinic_id,
              last_modified_by: profile?.id,
            };
            
            await insert<Patient>("patients", patientData);
            successCount++;
          } catch (err) {
            console.error("Error inserting record:", err, record);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} patients imported successfully`);
        }
        
        if (errorCount > 0) {
          toast.error(`${errorCount} patients failed to import`);
        }
        
        onSuccess();
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file");
    }
  };

  const downloadTemplateFile = () => {
    const link = document.createElement('a');
    link.href = '/templates/patient_import_template.csv';
    link.download = 'patient_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template file downloading...");
  };

  return (
    <>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">File Requirements</h3>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
            <li>File must be .csv, .xlsx, or .xls format</li>
            <li>Required columns: Name, Phone, Age, Gender, Treatment, Price, Clinic</li>
            <li>Phone numbers must be in UAE format (+971...)</li>
            <li>Maximum 1000 records per file</li>
          </ul>
        </div>
        
        <FileUploader 
          onFileAccepted={handleFileAccepted}
          allowedFileTypes={[".csv", ".xlsx", ".xls"]}
          maxSizeMB={10}
          onValidationComplete={(isValid, data) => {
            console.log("Validation complete:", isValid, data);
          }}
        />
        
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={downloadTemplateFile}
          >
            <DownloadCloud className="h-4 w-4" />
            Download Template File
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          {t("cancel")}
        </Button>
        <Button 
          className="bg-medical-teal hover:bg-teal-600"
          onClick={onSuccess}
        >
          Back to Patients
        </Button>
      </CardFooter>
    </>
  );
};
