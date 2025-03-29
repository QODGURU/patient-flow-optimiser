import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import FileUploader from "@/components/FileUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

interface PatientFormData {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  treatment_type: string;
  price: number;
  follow_up_required: boolean;
  notes: string;
  script: string;
}

const AddPatientPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.string().transform((val) => parseInt(val, 10)),
    gender: z.enum(["male", "female", "other"]),
    phone: z.string().min(1, "Phone number is required"),
    email: z.string().email().optional().or(z.literal("")),
    treatment_type: z.string().min(1, "Treatment type is required"),
    price: z.string().transform((val) => parseFloat(val)),
    follow_up_required: z.boolean().default(true),
    notes: z.string().optional(),
    script: z.string().optional(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    // @ts-ignore - slight mismatch in the type definitions
    resolver: zodResolver(formSchema),
    defaultValues: {
      follow_up_required: true,
    }
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      // Format the data for Supabase with correct types
      const patientData = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        email: data.email || null,
        treatment_type: data.treatment_type,
        price: data.price,
        follow_up_required: data.follow_up_required,
        notes: data.notes || null,
        script: data.script || null,
        doctor_id: user?.id,
        clinic_id: user?.clinicName, // This should be updated to use actual clinic ID
        // Use the Pending status which is in the database enum
        status: "Pending",
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
        description: `${data.name} has been added as a new patient.`,
      });

      // Navigate to the new patient's details page
      navigate(`/patients/${newPatient.id}`);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        variant: "destructive",
        title: "Failed to add patient",
        description: "There was an error adding the patient. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Patient</h1>
      <p className="text-muted-foreground">
        Create a new patient record and schedule follow-ups.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Enter the basic information for the new patient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} id="patient-form" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    {...register("age")}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-500">{errors.age.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </label>
                  <Select
                    defaultValue="male"
                    {...register("gender")}
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
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="+971 50 123 4567"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email (Optional)
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="treatment_type" className="text-sm font-medium">
                    Treatment Type
                  </label>
                  <Input
                    id="treatment_type"
                    placeholder="Dental Implant"
                    {...register("treatment_type")}
                  />
                  {errors.treatment_type && (
                    <p className="text-sm text-red-500">{errors.treatment_type.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price (AED)
                  </label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="5000"
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about the patient here..."
                  rows={3}
                  {...register("notes")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="script" className="text-sm font-medium">
                  Call Script (Optional)
                </label>
                <Textarea
                  id="script"
                  placeholder="Hello [Name], I'm calling from [Clinic] regarding your interest in [Treatment]..."
                  rows={3}
                  {...register("script")}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/patients")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="patient-form"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Patient"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Patients</CardTitle>
              <CardDescription>
                Bulk import patients from a CSV or Excel file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* FileUploader component without props */}
              <FileUploader />
              
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                What happens after adding a patient.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                After adding a patient, you can:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Schedule follow-up calls or messages</li>
                <li>Update their treatment information</li>
                <li>Track conversion status</li>
                <li>View patient history</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddPatientPage;
