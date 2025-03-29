
import { useState, useEffect } from "react";
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
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { PatientForm } from "@/components/patients/PatientForm";
import { BulkImportPatients } from "@/components/patients/BulkImportPatients";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [connectionStatus, setConnectionStatus] = useState({
    checking: true,
    connected: true,
    error: null
  });
  
  const { 
    data: clinics,
    loading: clinicsLoading,
    error: clinicsError,
    refetch: refetchClinics
  } = useSupabaseQuery<Clinic>("clinics");
  
  const { 
    data: doctors,
    loading: doctorsLoading,
    error: doctorsError,
    refetch: refetchDoctors
  } = useSupabaseQuery<Profile>("profiles", {
    filters: { role: "doctor" }
  });

  // Check connection to Supabase on component mount
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        setConnectionStatus({ checking: true, connected: false, error: null });
        const { connected, error } = await checkSupabaseConnection();
        
        setConnectionStatus({ 
          checking: false, 
          connected, 
          error
        });
        
        if (!connected) {
          console.error("Supabase connection error:", error);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setConnectionStatus({ 
          checking: false, 
          connected: false, 
          error: err.message 
        });
      }
    };
    
    verifyConnection();
  }, []);

  const handleSuccess = () => {
    navigate("/patients");
  };

  const handleCancel = () => {
    navigate("/patients");
  };

  const handleRetryConnection = async () => {
    setConnectionStatus({ checking: true, connected: false, error: null });
    
    try {
      const { connected, error } = await checkSupabaseConnection();
      
      setConnectionStatus({ 
        checking: false, 
        connected, 
        error
      });
      
      if (connected) {
        refetchClinics();
        refetchDoctors();
      }
    } catch (err) {
      setConnectionStatus({ 
        checking: false, 
        connected: false, 
        error: err.message 
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("addNewPatient")}</h1>

      {/* Connection Status */}
      {!connectionStatus.connected && !connectionStatus.checking && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>
              {connectionStatus.error || "Unable to connect to the database. Please try again later."}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit flex items-center gap-2"
              onClick={handleRetryConnection}
            >
              <RefreshCw className="h-4 w-4" /> Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus.checking && (
        <Card className="max-w-2xl mx-auto mb-6 p-6">
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="w-12 h-12 border-t-4 border-medical-teal border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-center">Checking database connection...</p>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
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
