
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMutateSupabase } from "@/hooks/useSupabase";
import { Patient } from "@/types/supabase";
import FileUploader from "@/components/FileUploader";
import { DownloadCloud, FileSpreadsheet, AlertCircle, InfoIcon } from "lucide-react";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; error: string | null }>({
    connected: true,
    error: null
  });
  const [importStatus, setImportStatus] = useState<{
    processing: boolean;
    success: number;
    error: number;
    total: number;
  }>({
    processing: false,
    success: 0,
    error: 0,
    total: 0
  });

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { count, error } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
        
        setConnectionStatus({
          connected: !error,
          error: error ? error.message : null
        });
        
        if (error) {
          console.error("Database connection error:", error);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setConnectionStatus({
          connected: false,
          error: err.message
        });
      }
    };
    
    checkConnection();
  }, []);

  const handleFileAccepted = async (file: File) => {
    console.log("File accepted:", file.name);
    toast.success(`${file.name} uploaded successfully. Processing...`);
    
    setImportStatus({
      processing: true,
      success: 0,
      error: 0,
      total: 0
    });
    
    try {
      // Check connection before proceeding
      if (!connectionStatus.connected) {
        throw new Error(`Database connection error: ${connectionStatus.error}`);
      }
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, {type: 'array'});
          
          // Get first worksheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            toast.error("No data found in the file");
            setImportStatus(prev => ({...prev, processing: false}));
            return;
          }
          
          console.log("Parsed data from Excel:", jsonData);
          
          // Update total count
          setImportStatus(prev => ({...prev, total: jsonData.length}));
          
          // Process records
          let successCount = 0;
          let errorCount = 0;
          
          for (const record of jsonData) {
            try {
              console.log("Processing record:", record);
              
              // Check if the record has required fields
              if (!record['Patient Name'] && !record['Name']) {
                console.warn("Skipping record due to missing name:", record);
                errorCount++;
                continue;
              }
              
              if (!record['Phone'] && !record['Phone Number']) {
                console.warn("Skipping record due to missing phone number:", record);
                errorCount++;
                continue;
              }
              
              // Map spreadsheet columns to database fields - ensure required fields are present
              const patientData = {
                name: record['Patient Name'] || record['Name'] || '', // Ensure required field is present
                phone: record['Phone'] || record['Phone Number'] || '', // Ensure required field is present
                age: record['Age'] ? Number(record['Age']) : null,
                gender: record['Gender'] || null,
                email: record['Email'] || null,
                treatment_category: record['Treatment Category'] || null,
                treatment_type: record['Treatment Type'] || record['Treatment'] || null,
                price: record['Price (AED)'] || record['Price'] ? Number(record['Price (AED)'] || record['Price']) : null,
                follow_up_required: record['Follow-Up Required'] === 'Yes' || record['Follow Up'] === 'Yes',
                status: (record['Status'] || 'Pending') as 'Pending' | 'Contacted' | 'Interested' | 'Booked' | 'Cold',
                preferred_time: record['Preferred Follow-Up Time'] || record['Preferred Time'] as 'Morning' | 'Afternoon' | 'Evening' | undefined,
                preferred_channel: record['Preferred Channel'] as 'Call' | 'SMS' | 'Email' | undefined,
                availability_preferences: record['Availability Preferences'] || record['Availability'] || null,
                notes: record['Notes'] || null,
                script: record['Script'] || null,
                doctor_id: profile?.id || null,
                clinic_id: profile?.clinic_id || record['Clinic ID'] || null,
                last_modified_by: profile?.id || null,
              };
              
              // Double-check required fields (defensive programming)
              if (!patientData.name || !patientData.phone) {
                throw new Error("Missing required fields: name and phone are required");
              }
              
              console.log("Inserting patient data:", patientData);
              // Direct insert approach rather than using the hook to bypass any potential issues
              const { data, error } = await supabase
                .from('patients')
                .insert(patientData)
                .select();
                
              if (error) {
                throw error;
              }
              
              successCount++;
              
              // Update counts as we progress
              setImportStatus(prev => ({
                ...prev, 
                success: prev.success + 1,
                error: errorCount
              }));
            } catch (err) {
              console.error("Error inserting record:", err, record);
              errorCount++;
              
              // Update error count
              setImportStatus(prev => ({
                ...prev, 
                error: prev.error + 1
              }));
            }
          }
          
          setImportStatus(prev => ({
            ...prev, 
            processing: false,
            success: successCount,
            error: errorCount
          }));
          
          if (successCount > 0) {
            toast.success(`${successCount} patients imported successfully`);
            
            // Only call onSuccess if at least one record was successfully imported
            setTimeout(() => onSuccess(), 2000);
          } else if (errorCount > 0) {
            toast.error(`${errorCount} patients failed to import`);
          }
        } catch (error: any) {
          console.error("Error processing Excel file:", error);
          toast.error(`Error parsing Excel file: ${error.message}`);
          setImportStatus(prev => ({...prev, processing: false}));
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("Error processing file:", error);
      toast.error(`Error processing file: ${error.message}`);
      setImportStatus(prev => ({...prev, processing: false}));
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
        {!connectionStatus.connected && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription>
              {connectionStatus.error || "Unable to connect to the database. Please try again later."}
            </AlertDescription>
          </Alert>
        )}
      
        <div className="space-y-1">
          <h3 className="text-sm font-medium">File Requirements</h3>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
            <li>File must be .csv, .xlsx, or .xls format</li>
            <li>Required columns: Name, Phone, Age, Gender, Treatment, Price, Clinic</li>
            <li>Phone numbers must be in UAE format (+971...)</li>
            <li>Maximum 1000 records per file</li>
          </ul>
        </div>
        
        {importStatus.processing ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-t-4 border-medical-teal border-solid rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-sm">
              Processing {importStatus.total} records...<br />
              <span className="text-green-600">{importStatus.success} successful</span> • 
              <span className="text-red-600">{importStatus.error} failed</span>
            </p>
          </div>
        ) : (
          <FileUploader 
            onFileAccepted={handleFileAccepted}
            allowedFileTypes={[".csv", ".xlsx", ".xls"]}
            maxSizeMB={10}
            onValidationComplete={(isValid, data) => {
              console.log("Validation complete:", isValid, data);
            }}
          />
        )}
        
        {importStatus.success > 0 && !importStatus.processing && (
          <Alert className="bg-green-50 border-green-200">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <AlertTitle>Import Successful</AlertTitle>
            <AlertDescription>
              Successfully imported {importStatus.success} patients to the database.
              {importStatus.error > 0 && ` ${importStatus.error} records failed to import.`}
            </AlertDescription>
          </Alert>
        )}
        
        {importStatus.error > 0 && importStatus.success === 0 && !importStatus.processing && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Import Failed</AlertTitle>
            <AlertDescription>
              All {importStatus.error} records failed to import. Please check the file format.
            </AlertDescription>
          </Alert>
        )}
        
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
          disabled={importStatus.processing}
        >
          Back to Patients
        </Button>
      </CardFooter>
    </>
  );
};
