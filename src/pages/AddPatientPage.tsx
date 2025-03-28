import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { doctors } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploader from "@/components/FileUploader";
import { useLanguage } from "@/contexts/LanguageContext";
import { FilePlus, Upload, DownloadCloud } from "lucide-react";
import { useMutateSupabase, useSupabaseQuery } from "@/hooks/useSupabase";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Patient, Profile, Clinic } from "@/types/supabase";
import * as XLSX from 'xlsx';

// Validation schema for patient form
const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().nullable().optional(),
  gender: z.string().optional(),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\+971\d{9}$/, "Phone must be in +971 format with 9 digits"),
  email: z.string().email("Invalid email").optional().nullable(),
  treatment_category: z.string().optional().nullable(),
  treatment_type: z.string().optional().nullable(),
  price: z.coerce.number().nullable().optional(),
  doctor_id: z.string().optional().nullable(),
  clinic_id: z.string().optional().nullable(),
  clinic_name: z.string().optional().nullable(),
  follow_up_required: z.boolean().default(true),
  preferred_time: z.string().optional().nullable(),
  preferred_channel: z.string().optional().nullable(),
  availability_preferences: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  script: z.string().optional().nullable(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const isAdmin = profile?.role === "admin";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: null,
      gender: "male",
      phone: "+971",
      email: "",
      treatment_category: "",
      treatment_type: "",
      price: null,
      doctor_id: profile?.id || "",
      clinic_id: profile?.clinic_id || "",
      clinic_name: "",
      follow_up_required: true,
      preferred_time: "Morning",
      preferred_channel: "Call",
      availability_preferences: "",
      notes: "",
      script: "",
    },
  });

  const { data: clinics } = useSupabaseQuery<Clinic>("clinics");
  const { data: doctors } = useSupabaseQuery<Profile>("profiles", {
    filters: { role: "doctor" }
  });

  const { insert, loading } = useMutateSupabase();

  const onSubmit = async (values: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      // Transform the data to match the patient table structure
      const patientData: Partial<Patient> = {
        name: values.name,
        age: values.age !== null ? values.age : null,
        gender: values.gender,
        phone: values.phone,
        email: values.email || null,
        treatment_category: values.treatment_category || null,
        treatment_type: values.treatment_type || null,
        price: values.price !== null ? values.price : null,
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

      const result = await insert<Patient>("patients", patientData);
      
      toast.success(t("patientAddedSuccessfully"));
      navigate("/patients");
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error(t("errorAddingPatient"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
        
        navigate("/patients");
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
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("addNewPatient")}</h1>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="manual" className="flex-1">
            <FilePlus className="h-4 w-4 mr-2" /> 
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex-1">
            <Upload className="h-4 w-4 mr-2" /> 
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="max-w-2xl mx-auto hover-scale">
            <CardHeader>
              <CardTitle>{t("patientInformation")}</CardTitle>
              <CardDescription>
                {t("enterPatientDetails")}
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("personalInformation")}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("patientName")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("phoneNumber")}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+971 XX XXX XXXX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("age")}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max="120"
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
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("gender")}</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">{t("male")}</SelectItem>
                                <SelectItem value="female">{t("female")}</SelectItem>
                                <SelectItem value="other">{t("other")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")} (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Treatment Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">{t("treatmentInformation")}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
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
                        control={form.control}
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
                        control={form.control}
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

                  {/* Follow-up Preferences */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Follow-up Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferred_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Morning">Morning</SelectItem>
                                <SelectItem value="Afternoon">Afternoon</SelectItem>
                                <SelectItem value="Evening">Evening</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="preferred_channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Channel</FormLabel>
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="SMS">SMS</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="availability_preferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability Preferences</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Weekdays 9-5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Clinic Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">{t("clinicInformation")}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isAdmin && (
                        <FormField
                          control={form.control}
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
                        control={form.control}
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

                  {/* Additional Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Additional Information</h3>
                    
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/patients")}
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
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="max-w-2xl mx-auto hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5 text-primary" />
                Bulk Import Patients
              </CardTitle>
              <CardDescription>
                Upload CSV or Excel files to bulk import patient records
              </CardDescription>
            </CardHeader>
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
                onClick={() => navigate("/patients")}
              >
                {t("cancel")}
              </Button>
              <Button 
                className="bg-medical-teal hover:bg-teal-600"
                onClick={() => navigate("/patients")}
              >
                Back to Patients
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddPatientPage;
