
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { Profile, Clinic } from "@/types/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Upload } from "lucide-react";
import { PatientForm } from "@/components/patients/PatientForm";
import { BulkImportPatients } from "@/components/patients/BulkImportPatients";

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  
  const { data: clinics } = useSupabaseQuery<Clinic>("clinics");
  const { data: doctors } = useSupabaseQuery<Profile>("profiles", {
    filters: { role: "doctor" }
  });

  const handleSuccess = () => {
    navigate("/patients");
  };

  const handleCancel = () => {
    navigate("/patients");
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
            
            <PatientForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              doctors={doctors}
              clinics={clinics}
            />
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
            
            <BulkImportPatients
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddPatientPage;
