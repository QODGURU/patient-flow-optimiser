
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

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === "admin";

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    doctorId: user?.id || "",
    clinicName: "",
    treatment: "",
    price: "",
    needsFollowUp: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, needsFollowUp: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd make an API call to save the patient
    
    // For demo purposes, we'll just show a success message
    toast.success(t("patientAddedSuccessfully"));
    navigate("/patients");
  };

  const handleFileAccepted = (file: File) => {
    console.log("File accepted:", file.name);
    // In a real app, this would start processing the file
    toast.success(`${file.name} uploaded successfully. Processing...`);
    
    // Simulate processing delay
    setTimeout(() => {
      toast.success("10 patients imported successfully");
      navigate("/patients");
    }, 2000);
  };

  // If admin, get a list of doctors for the dropdown
  const availableDoctors = isAdmin ? doctors : [];

  const downloadTemplateFile = () => {
    // In a real app, this would download a properly formatted Excel template
    toast.success("Template file downloading...");
    // Simulate download
    const link = document.createElement('a');
    link.href = '/templates/patient_import_template.xlsx';
    link.download = 'patient_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("personalInformation")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("patientName")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("phoneNumber")}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+971 XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">{t("age")}</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        min="0"
                        max="120"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">{t("gender")}</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange("gender", value)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t("male")}</SelectItem>
                          <SelectItem value="female">{t("female")}</SelectItem>
                          <SelectItem value="other">{t("other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Treatment Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{t("treatmentInformation")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="treatment">{t("treatment")}</Label>
                      <Input
                        id="treatment"
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleChange}
                        placeholder="e.g., Dental Implant"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">{t("price")}</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="needsFollowUp"
                      checked={formData.needsFollowUp}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="needsFollowUp" className="cursor-pointer">
                      {t("thisPatientNeedsFollowUp")}
                    </Label>
                  </div>
                </div>

                {/* Clinic Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">{t("clinicInformation")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label htmlFor="doctorId">{t("assignedDoctor")}</Label>
                        <Select
                          value={formData.doctorId}
                          onValueChange={(value) => handleSelectChange("doctorId", value)}
                        >
                          <SelectTrigger id="doctorId">
                            <SelectValue placeholder={t("selectDoctor")} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDoctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">{t("clinicName")}</Label>
                      <Input
                        id="clinicName"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
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
                <Button type="submit" className="bg-medical-teal hover:bg-teal-600">
                  {t("addPatient")}
                </Button>
              </CardFooter>
            </form>
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
