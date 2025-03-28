
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/FileUploader";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Clock,
  Upload,
  Building,
  Plus,
  Trash2,
  Save,
  User
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generatePatientTemplateFile } from "@/utils/templateGenerator";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { Settings, Clinic, Profile } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [activeClinic, setActiveClinic] = useState<string | null>(null);
  
  // Dialogs state
  const [addClinicDialogOpen, setAddClinicDialogOpen] = useState(false);
  const [addDoctorDialogOpen, setAddDoctorDialogOpen] = useState(false);
  const [deleteClinicDialogOpen, setDeleteClinicDialogOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);
  
  // Form states
  const [timeSettings, setTimeSettings] = useState<Partial<Settings>>({
    outreach_start_time: "09:00",
    outreach_end_time: "18:00",
    excluded_days: [],
    outreach_interval: 60,
  });
  
  const [newClinic, setNewClinic] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    clinic_id: "",
  });

  // Data fetching
  const { 
    data: settings, 
    loading: settingsLoading,
    refetch: refetchSettings
  } = useSupabaseQuery<Settings>("settings");
  
  const { 
    data: clinics, 
    loading: clinicsLoading,
    refetch: refetchClinics
  } = useSupabaseQuery<Clinic>("clinics");
  
  const { 
    data: doctors, 
    loading: doctorsLoading,
    refetch: refetchDoctors
  } = useSupabaseQuery<Profile>(
    "profiles",
    {
      filters: { role: "doctor" }
    }
  );

  // Mutations
  const { 
    update: updateSettings, 
    insert: insertSettings,
    insert: insertClinic,
    remove: removeClinic,
    loading: mutationLoading 
  } = useMutateSupabase();

  // Set initial settings from database
  useEffect(() => {
    if (settings.length > 0) {
      const setting = settings[0];
      setTimeSettings({
        outreach_start_time: setting.outreach_start_time,
        outreach_end_time: setting.outreach_end_time,
        excluded_days: setting.excluded_days || [],
        outreach_interval: setting.outreach_interval,
      });
      
      if (setting.clinic_id) {
        setActiveClinic(setting.clinic_id);
      } else if (clinics.length > 0) {
        setActiveClinic(clinics[0].id);
      }
    }
  }, [settings, clinics]);

  const handleTimeSettingChange = (field: keyof Settings, value: any) => {
    setTimeSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleExcludedDay = (day: string) => {
    setTimeSettings(prev => {
      const currentExcludedDays = prev.excluded_days || [];
      return {
        ...prev,
        excluded_days: currentExcludedDays.includes(day)
          ? currentExcludedDays.filter(d => d !== day)
          : [...currentExcludedDays, day]
      };
    });
  };

  const saveTimeSettings = async () => {
    try {
      if (settings.length > 0) {
        await updateSettings("settings", settings[0].id, timeSettings);
      } else {
        await insertSettings("settings", {
          ...timeSettings,
          clinic_id: activeClinic
        });
      }
      toast.success("Outreach settings saved successfully");
      refetchSettings();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleNewClinicChange = (field: string, value: string) => {
    setNewClinic(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewDoctorChange = (field: string, value: string) => {
    setNewDoctor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addClinic = async () => {
    try {
      const result = await insertClinic("clinics", newClinic);
      toast.success("Clinic added successfully");
      setAddClinicDialogOpen(false);
      setNewClinic({
        name: "",
        address: "",
        phone: "",
        email: "",
      });
      refetchClinics();
    } catch (error) {
      // Error handled in hook
    }
  };

  const addDoctor = async () => {
    try {
      // Create auth user first
      const { data, error } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: newDoctor.password,
        options: {
          data: {
            name: newDoctor.name,
          }
        }
      });
      
      if (error) {
        toast.error(`Error creating user: ${error.message}`);
        return;
      }
      
      // The trigger will create the profile, so we just need to update the clinic_id and phone
      if (data.user) {
        await updateSettings("profiles", data.user.id, {
          clinic_id: newDoctor.clinic_id,
          phone: newDoctor.phone
        });
        
        toast.success("Doctor added successfully");
        setAddDoctorDialogOpen(false);
        setNewDoctor({
          name: "",
          email: "",
          password: "",
          phone: "",
          clinic_id: "",
        });
        refetchDoctors();
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Failed to add doctor");
    }
  };

  const confirmDeleteClinic = (clinicId: string) => {
    setClinicToDelete(clinicId);
    setDeleteClinicDialogOpen(true);
  };

  const deleteClinic = async () => {
    if (!clinicToDelete) return;
    
    try {
      await removeClinic("clinics", clinicToDelete);
      toast.success("Clinic deleted successfully");
      refetchClinics();
    } catch (error) {
      // Error handled in hook
    } finally {
      setDeleteClinicDialogOpen(false);
      setClinicToDelete(null);
    }
  };

  const handleFileAccepted = (file: File) => {
    console.log("File accepted:", file.name);
    toast.success(`${file.name} uploaded successfully. Processing...`);
    
    // Simulate processing delay
    setTimeout(() => {
      toast.success("10 patients imported successfully");
    }, 2000);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#101B4C]">Settings</h1>
        </div>
        
        <Card className="border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-[#101B4C]">Access Restricted</CardTitle>
            <CardDescription>
              Only administrators can access settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#101B4C]">Settings</h1>
      </div>

      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="time" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" /> Outreach Settings
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" /> Import Patients
          </TabsTrigger>
          <TabsTrigger value="clinics" className="flex items-center">
            <Building className="h-4 w-4 mr-2" /> Clinics & Doctors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time">
          <Card className="border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center text-[#101B4C]">
                <Clock className="mr-2 h-5 w-5 text-[#00FFC8]" />
                Outreach Time Settings
              </CardTitle>
              <CardDescription>
                Configure when to contact patients and how often to follow up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={timeSettings.outreach_start_time}
                        onChange={(e) => handleTimeSettingChange('outreach_start_time', e.target.value)}
                        className="border-[#2B2E33]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={timeSettings.outreach_end_time}
                        onChange={(e) => handleTimeSettingChange('outreach_end_time', e.target.value)}
                        className="border-[#2B2E33]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Excluded Days</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                        (day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day}`}
                              checked={(timeSettings.excluded_days || []).includes(day)}
                              onCheckedChange={() => toggleExcludedDay(day)}
                            />
                            <Label htmlFor={`day-${day}`} className="cursor-pointer">
                              {day}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interval">Outreach Interval (minutes)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="10"
                      max="1440"
                      value={timeSettings.outreach_interval}
                      onChange={(e) => handleTimeSettingChange('outreach_interval', parseInt(e.target.value) || 60)}
                      className="border-[#2B2E33]/20"
                    />
                    <p className="text-xs text-[#2B2E33]/60">
                      Minimum duration between consecutive follow-ups for the same patient
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={saveTimeSettings} 
                disabled={mutationLoading || settingsLoading}
                className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
              >
                {mutationLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card className="border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center text-[#101B4C]">
                <Upload className="mr-2 h-5 w-5 text-[#00FFC8]" />
                Import Patients
              </CardTitle>
              <CardDescription>
                Upload CSV or Excel files to bulk import patient records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[#101B4C]">File Requirements</h3>
                <ul className="text-xs text-[#2B2E33] list-disc list-inside space-y-1">
                  <li>File must be .csv, .xlsx, or .xls format</li>
                  <li>Required columns: Patient Name, Phone</li>
                  <li>Phone numbers must be in UAE format (+971...)</li>
                  <li>Maximum 1000 records per file</li>
                </ul>
              </div>
              
              <FileUploader 
                onFileAccepted={handleFileAccepted}
                allowedFileTypes={[".csv", ".xlsx", ".xls"]}
                maxSizeMB={10}
              />
              
              <div className="text-xs text-[#2B2E33] mt-4">
                <p>Need a template file? <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs text-[#00FFC8] hover:text-[#00FFC8]/80"
                  onClick={generatePatientTemplateFile}
                >
                  Download Sample File
                </Button></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clinics Management */}
            <Card className="border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-[#101B4C]">
                    <Building className="mr-2 h-5 w-5 text-[#00FFC8]" />
                    Clinics
                  </CardTitle>
                  <Button 
                    onClick={() => setAddClinicDialogOpen(true)}
                    className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Clinic
                  </Button>
                </div>
                <CardDescription>
                  Manage your clinics and their information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clinicsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : clinics.length > 0 ? (
                  clinics.map(clinic => (
                    <div 
                      key={clinic.id} 
                      className="border p-4 rounded-lg hover:bg-[#101B4C]/5 transition-colors duration-200"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-[#101B4C]">{clinic.name}</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-[#FF3B3B] border-[#FF3B3B]/20 hover:bg-[#FF3B3B]/10 h-8 w-8 p-0"
                          onClick={() => confirmDeleteClinic(clinic.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-[#2B2E33]">
                        {clinic.address && <p>{clinic.address}</p>}
                        <div className="flex flex-wrap gap-2">
                          {clinic.phone && <p>Phone: {clinic.phone}</p>}
                          {clinic.email && <p>Email: {clinic.email}</p>}
                        </div>
                        <p className="text-xs text-[#2B2E33]/60">
                          ID: {clinic.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#2B2E33]">
                    <p>No clinics found</p>
                    <p className="text-sm text-[#2B2E33]/60 mt-1">
                      Add a clinic to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Doctors Management */}
            <Card className="border-[#101B4C]/10 hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-[#101B4C]">
                    <User className="mr-2 h-5 w-5 text-[#00FFC8]" />
                    Doctors
                  </CardTitle>
                  <Button 
                    onClick={() => setAddDoctorDialogOpen(true)}
                    className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Doctor
                  </Button>
                </div>
                <CardDescription>
                  Manage doctors and their clinic assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctorsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : doctors.length > 0 ? (
                  doctors.map(doctor => {
                    const doctorClinic = clinics.find(c => c.id === doctor.clinic_id);
                    return (
                      <div 
                        key={doctor.id} 
                        className="border p-4 rounded-lg hover:bg-[#101B4C]/5 transition-colors duration-200"
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium text-[#101B4C]">{doctor.name}</h3>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-[#2B2E33]">
                          <p>Email: {doctor.email}</p>
                          {doctor.phone && <p>Phone: {doctor.phone}</p>}
                          <p>Clinic: {doctorClinic?.name || 'Not assigned'}</p>
                          <p className="text-xs text-[#2B2E33]/60">
                            ID: {doctor.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-[#2B2E33]">
                    <p>No doctors found</p>
                    <p className="text-sm text-[#2B2E33]/60 mt-1">
                      Add a doctor to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Clinic Dialog */}
      <Dialog open={addClinicDialogOpen} onOpenChange={setAddClinicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#101B4C]">Add New Clinic</DialogTitle>
            <DialogDescription>
              Enter the details of the new clinic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input
                id="clinic-name"
                value={newClinic.name}
                onChange={(e) => handleNewClinicChange('name', e.target.value)}
                placeholder="Enter clinic name"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-address">Address</Label>
              <Textarea
                id="clinic-address"
                value={newClinic.address}
                onChange={(e) => handleNewClinicChange('address', e.target.value)}
                placeholder="Enter clinic address"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-phone">Phone</Label>
              <Input
                id="clinic-phone"
                value={newClinic.phone}
                onChange={(e) => handleNewClinicChange('phone', e.target.value)}
                placeholder="+971 XX XXX XXXX"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-email">Email</Label>
              <Input
                id="clinic-email"
                type="email"
                value={newClinic.email}
                onChange={(e) => handleNewClinicChange('email', e.target.value)}
                placeholder="clinic@example.com"
                className="border-[#2B2E33]/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddClinicDialogOpen(false)}
              className="border-[#2B2E33]/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={addClinic}
              disabled={!newClinic.name || mutationLoading}
              className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
            >
              {mutationLoading ? "Adding..." : "Add Clinic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Doctor Dialog */}
      <Dialog open={addDoctorDialogOpen} onOpenChange={setAddDoctorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#101B4C]">Add New Doctor</DialogTitle>
            <DialogDescription>
              Create a new doctor account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-name">Doctor Name</Label>
              <Input
                id="doctor-name"
                value={newDoctor.name}
                onChange={(e) => handleNewDoctorChange('name', e.target.value)}
                placeholder="Dr. John Doe"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-email">Email</Label>
              <Input
                id="doctor-email"
                type="email"
                value={newDoctor.email}
                onChange={(e) => handleNewDoctorChange('email', e.target.value)}
                placeholder="doctor@example.com"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-password">Password</Label>
              <Input
                id="doctor-password"
                type="password"
                value={newDoctor.password}
                onChange={(e) => handleNewDoctorChange('password', e.target.value)}
                placeholder="Create a password"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-phone">Phone</Label>
              <Input
                id="doctor-phone"
                value={newDoctor.phone}
                onChange={(e) => handleNewDoctorChange('phone', e.target.value)}
                placeholder="+971 XX XXX XXXX"
                className="border-[#2B2E33]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-clinic">Assigned Clinic</Label>
              <Select
                value={newDoctor.clinic_id}
                onValueChange={(value) => handleNewDoctorChange('clinic_id', value)}
              >
                <SelectTrigger id="doctor-clinic" className="border-[#2B2E33]/20">
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map(clinic => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddDoctorDialogOpen(false)}
              className="border-[#2B2E33]/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={addDoctor}
              disabled={!newDoctor.name || !newDoctor.email || !newDoctor.password || mutationLoading}
              className="bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
            >
              {mutationLoading ? "Adding..." : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Clinic Dialog */}
      <Dialog open={deleteClinicDialogOpen} onOpenChange={setDeleteClinicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#101B4C]">Delete Clinic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this clinic? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteClinicDialogOpen(false)}
              className="border-[#2B2E33]/20"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={deleteClinic}
              disabled={mutationLoading}
              className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/90"
            >
              {mutationLoading ? "Deleting..." : "Delete Clinic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
