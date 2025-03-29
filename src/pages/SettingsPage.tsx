
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { Clinic, Profile, Settings as SettingsType } from "@/types/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutreachTimeSetting } from "@/components/OutreachTimeSetting";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type ExcludedDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

const SettingsPage = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("outreach");

  // Settings state
  const [outreachStartTime, setOutreachStartTime] = useState("09:00");
  const [outreachEndTime, setOutreachEndTime] = useState("17:00");
  const [excludedDays, setExcludedDays] = useState<ExcludedDay[]>([]);
  const [outreachInterval, setOutreachInterval] = useState(60);

  // Clinic state
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch settings
  const { data: settingsData, loading: settingsLoading, refetch: refetchSettings } = useSupabaseQuery<SettingsType>(
    "settings",
    {
      filters: { clinic_id: profile?.clinic_id },
    }
  );

  // Fetch clinic
  const { data: clinicData, loading: clinicLoading, refetch: refetchClinic } = useSupabaseQuery<Clinic>(
    "clinics",
    {
      filters: { id: profile?.clinic_id },
    }
  );

  const { update, insert } = useMutateSupabase();

  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      const settings = settingsData[0];
      setOutreachStartTime(settings.outreach_start_time || "09:00");
      setOutreachEndTime(settings.outreach_end_time || "17:00");
      setOutreachInterval(settings.outreach_interval || 60);
      setExcludedDays((settings.excluded_days as ExcludedDay[]) || []);
    }
  }, [settingsData]);

  useEffect(() => {
    if (clinicData && clinicData.length > 0) {
      const clinic = clinicData[0];
      setClinicName(clinic.name);
      setClinicAddress(clinic.address || "");
      setClinicPhone(clinic.phone || "");
      setClinicEmail(clinic.email || "");
    }
  }, [clinicData]);

  const handleUpdateSettings = async () => {
    try {
      setIsSubmitting(true);

      // Update or insert settings
      if (settingsData && settingsData.length > 0) {
        await update<SettingsType>(
          "settings",
          settingsData[0].id,
          {
            outreach_start_time: outreachStartTime,
            outreach_end_time: outreachEndTime,
            excluded_days: excludedDays,
            outreach_interval: outreachInterval,
            clinic_id: profile?.clinic_id,
            updated_at: new Date().toISOString(),
          }
        );
      } else {
        await insert<Partial<SettingsType>>(
          "settings",
          {
            outreach_start_time: outreachStartTime,
            outreach_end_time: outreachEndTime,
            excluded_days: excludedDays,
            outreach_interval: outreachInterval,
            clinic_id: profile?.clinic_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      }

      toast.success("Outreach settings updated successfully");
      refetchSettings();
    } catch (error) {
      // Error handling is done in the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClinic = async () => {
    try {
      setIsSubmitting(true);

      // Update clinic
      if (clinicData && clinicData.length > 0) {
        await update<Clinic>(
          "clinics",
          clinicData[0].id,
          {
            name: clinicName,
            address: clinicAddress,
            phone: clinicPhone,
            email: clinicEmail,
            updated_at: new Date().toISOString(),
          }
        );

        toast.success("Clinic information updated successfully");
        refetchClinic();
        setIsEditing(false);
      }
    } catch (error) {
      // Error handling is done in the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle multiple day selection from Calendar
  const handleDaySelect = (days: Date[] | undefined) => {
    if (!days) return;
    
    const weekdays: ExcludedDay[] = days.map(day => {
      const dayNames: ExcludedDay[] = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
      ];
      return dayNames[day.getDay()];
    });
    
    setExcludedDays(weekdays);
  };

  if (settingsLoading || clinicLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="outreach">Outreach Settings</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Information</TabsTrigger>
        </TabsList>

        <TabsContent value="outreach">
          <Card>
            <CardHeader>
              <CardTitle>Outreach Timing Configuration</CardTitle>
              <CardDescription>
                Configure the times when automatic outreach to patients is permitted
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <OutreachTimeSetting
                    id="start-time"
                    value={outreachStartTime}
                    onChange={setOutreachStartTime}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <OutreachTimeSetting
                    id="end-time"
                    value={outreachEndTime}
                    onChange={setOutreachEndTime}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="interval">Outreach Interval (minutes)</Label>
                <Input
                  id="interval"
                  type="number"
                  value={outreachInterval}
                  onChange={(e) => setOutreachInterval(Number(e.target.value))}
                  min={15}
                  max={180}
                  step={15}
                  className="w-full mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum time between automated outreach attempts to the same patient
                </p>
              </div>

              <div>
                <Label>Excluded Days</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left mt-1">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {excludedDays.length > 0
                        ? `${excludedDays.join(", ")}`
                        : "No excluded days"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="multiple"
                      selected={[]}
                      onSelect={handleDaySelect}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  Select days when automated outreach should not occur
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="bg-medical-teal hover:bg-teal-600"
                onClick={handleUpdateSettings}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>
                View and update your clinic's information
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input
                      id="clinic-name"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic-address">Address</Label>
                    <Input
                      id="clinic-address"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic-phone">Phone</Label>
                    <Input
                      id="clinic-phone"
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic-email">Email</Label>
                    <Input
                      id="clinic-email"
                      value={clinicEmail}
                      onChange={(e) => setClinicEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Clinic Name</Label>
                    <p className="mt-1 font-medium">{clinicName || "Not set"}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <p className="mt-1">{clinicAddress || "Not set"}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="mt-1">{clinicPhone || "Not set"}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="mt-1">{clinicEmail || "Not set"}</p>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter>
              {isEditing ? (
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-medical-teal hover:bg-teal-600 flex-1"
                    onClick={handleUpdateClinic}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Edit Clinic Information
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
