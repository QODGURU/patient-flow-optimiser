import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "@/components/FileUploader";

interface PatientFormData {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  treatment: string;
  price: number;
  followUpRequired: boolean;
  notes: string;
  script: string;
}

// For FileUploader component
interface FileUploaderProps {
  userId: string;
}

const AddPatientPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PatientFormData>({
    defaultValues: {
      name: "",
      age: 0,
      gender: "male",
      phone: "",
      email: "",
      treatment: "",
      price: 0,
      followUpRequired: true,
      notes: "",
      script: "",
    }
  });

  const followUpRequired = watch("followUpRequired");

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      // Format the data for Supabase with correct types
      const patientData = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        treatment_type: data.treatment,
        price: data.price,
        follow_up_required: data.followUpRequired,
        notes: data.notes,
        script: data.script,
        doctor_id: user?.id,
        clinic_id: user?.clinicName, // This should be updated to use actual clinic ID
        status: 'Pending', // Use the enum value directly as a string literal
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        last_modified_by: user?.id,
      };

      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Patient added successfully",
        description: `${data.name} has been added to your patient list.`,
      });

      reset();
      navigate('/patients'); // Redirect to the patients list
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast({
        variant: "destructive",
        title: "Failed to add patient",
        description: error.message || "An error occurred while adding the patient.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploadSuccess = (result: any) => {
    setUploadSuccess(true);
    toast({
      title: "File uploaded successfully",
      description: `${result.totalRows} patients have been processed. ${result.validRows} valid entries will be imported.`,
    });
  };

  const handleFileUploadError = (error: string) => {
    toast({
      variant: "destructive",
      title: "File upload failed",
      description: error,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Patient</h1>
      <p className="text-muted-foreground">
        Add a new patient to your list manually or import from a CSV/Excel file.
      </p>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Enter the patient's details below. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Patient's full name" 
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      placeholder="+971 50 123 4567"
                      {...register("phone", { 
                        required: "Phone number is required",
                        pattern: {
                          value: /^(\+971|00971|0)?(?:50|51|52|55|56|58|2|3|4|6|7|9)\d{7}$/,
                          message: "Please enter a valid UAE phone number"
                        }
                      })}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="patient@example.com"
                      {...register("email", { 
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      {...register("age", { 
                        required: "Age is required",
                        min: {
                          value: 0,
                          message: "Age must be positive"
                        },
                        max: {
                          value: 120,
                          message: "Age cannot exceed 120"
                        }
                      })}
                    />
                    {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      {...register("gender", { required: "Gender is required" })}
                      defaultValue="male"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment Type *</Label>
                    <Input 
                      id="treatment" 
                      placeholder="e.g., Dental Implant, Botox, etc."
                      {...register("treatment", { required: "Treatment type is required" })}
                    />
                    {errors.treatment && <p className="text-sm text-red-500">{errors.treatment.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (AED) *</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00"
                      {...register("price", { 
                        required: "Price is required",
                        min: {
                          value: 0,
                          message: "Price must be positive"
                        }
                      })}
                    />
                    {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="followUpRequired" 
                      checked={followUpRequired}
                      {...register("followUpRequired")}
                    />
                    <Label htmlFor="followUpRequired">Follow-up Required</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If enabled, this patient will be added to the follow-up queue.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any additional information about this patient..."
                    className="min-h-[100px]"
                    {...register("notes")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="script">Follow-up Script (Optional)</Label>
                  <Textarea 
                    id="script" 
                    placeholder="Custom script for follow-up calls..."
                    className="min-h-[100px]"
                    {...register("script")}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/patients')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding Patient..." : "Add Patient"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Patients</CardTitle>
              <CardDescription>
                Upload a CSV or Excel file with patient data. The file should have headers matching the required fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Removed props that aren't supported by the component */}
              <FileUploader userId={user?.id || ""} />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Template Instructions:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Download the template file to see the required columns.</li>
                  <li>Fill in the data following the format in the template.</li>
                  <li>Save the file as CSV or Excel (.xlsx) format.</li>
                  <li>Upload the file using the form above.</li>
                </ul>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/templates/patient_import_template.xlsx" download>
                    Download Template
                  </a>
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              {uploadSuccess && (
                <Button onClick={() => navigate('/patients')}>
                  View Patients List
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddPatientPage;
