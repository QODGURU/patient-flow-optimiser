import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { Profile, Clinic, Settings } from "@/types/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const isAdmin = profile?.role === "admin";

  // Clinic Details State
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");
  const [isClinicDetailsEditMode, setIsClinicDetailsEditMode] = useState(false);

  // Outreach Settings State
  const [outreachStartTime, setOutreachStartTime] = useState("09:00");
  const [outreachEndTime, setOutreachEndTime] = useState("18:00");
  const [outreachInterval, setOutreachInterval] = useState(60);
  const [excludedDays, setExcludedDays] = useState<Date[]>([]);
  const [isOutreachSettingsEditMode, setIsOutreachSettingsEditMode] = useState(false);

  // Data fetching hooks
  const { data: clinic, loading: clinicLoading } = useSupabaseQuery<Clinic>("clinics", {
    filters: { id: profile?.clinic_id || "" },
    enabled: !!profile?.clinic_id,
  });

  const { data: settings, loading: settingsLoading } = useSupabaseQuery<Settings>("settings", {
    filters: { clinic_id: profile?.clinic_id || "" },
    enabled: !!profile?.clinic_id,
  });

  const { update: updateClinic, loading: updateClinicLoading } = useMutateSupabase();
  const { update: updateSettings, loading: updateSettingsLoading } = useMutateSupabase();

  useEffect(() => {
    if (clinic && clinic.length > 0) {
      setClinicName(clinic[0].name || "");
      setClinicAddress(clinic[0].address || "");
      setClinicPhone(clinic[0].phone || "");
      setClinicEmail(clinic[0].email || "");
    }
  }, [clinic]);

  useEffect(() => {
    if (settings && settings.length > 0) {
      setOutreachStartTime(settings[0].outreach_start_time || "09:00");
      setOutreachEndTime(settings[0].outreach_end_time || "18:00");
      setOutreachInterval(settings[0].outreach_interval || 60);
      setExcludedDays(settings[0].excluded_days ? settings[0].excluded_days.map(d => new Date(d)) : []);
    }
  }, [settings]);

  const handleClinicDetailsEditToggle = () => {
    setIsClinicDetailsEditMode(!isClinicDetailsEditMode);
  };

  const handleOutreachSettingsEditToggle = () => {
    setIsOutreachSettingsEditMode(!isOutreachSettingsEditMode);
  };

  const handleClinicDetailsSave = async () => {
    if (!clinic || clinic.length === 0) return;

    try {
      await updateClinic("clinics", clinic[0].id, {
        id: clinic[0].id,
        name: clinicName,
        address: clinicAddress,
        phone: clinicPhone,
        email: clinicEmail
      });
      toast.success("Clinic details updated successfully!");
      setIsClinicDetailsEditMode(false);
    } catch (error: any) {
      toast.error(`Failed to update clinic details: ${error.message}`);
    }
  };

  const handleOutreachSettingsSave = async () => {
    if (!settings || settings.length === 0) return;

    try {
      await updateSettings("settings", settings[0].id, {
        outreach_start_time: outreachStartTime,
        outreach_end_time: outreachEndTime,
        outreach_interval: outreachInterval,
        excluded_days: excludedDays.map(d => d.toISOString()),
      });
      toast.success("Outreach settings updated successfully!");
      setIsOutreachSettingsEditMode(false);
    } catch (error: any) {
      toast.error(`Failed to update outreach settings: ${error.message}`);
    }
  };

  const handleDaySelect = (date: Date) => {
    if (excludedDays.some(d => d.getTime() === date.getTime())) {
      setExcludedDays(excludedDays.filter(d => d.getTime() !== date.getTime()));
    } else {
      setExcludedDays([...excludedDays, date]);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("settings")}</h1>

      {/* Clinic Details */}
      <Card className="max-w-2xl mx-auto hover-scale mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("clinicDetails")}</CardTitle>
            <Button
              variant="outline"
              onClick={handleClinicDetailsEditToggle}
              disabled={updateClinicLoading}
            >
              {isClinicDetailsEditMode ? t("cancel") : t("edit")}
            </Button>
          </div>
          <CardDescription>
            {t("manageClinicInfo")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clinicName">{t("clinicName")}</Label>
            <Input
              id="clinicName"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              disabled={!isClinicDetailsEditMode}
            />
          </div>
          <div>
            <Label htmlFor="clinicAddress">{t("clinicAddress")}</Label>
            <Textarea
              id="clinicAddress"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              disabled={!isClinicDetailsEditMode}
            />
          </div>
          <div>
            <Label htmlFor="clinicPhone">{t("clinicPhone")}</Label>
            <Input
              id="clinicPhone"
              type="tel"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
              disabled={!isClinicDetailsEditMode}
            />
          </div>
          <div>
            <Label htmlFor="clinicEmail">{t("clinicEmail")}</Label>
            <Input
              id="clinicEmail"
              type="email"
              value={clinicEmail}
              onChange={(e) => setClinicEmail(e.target.value)}
              disabled={!isClinicDetailsEditMode}
            />
          </div>
        </CardContent>
        {isClinicDetailsEditMode && (
          <CardFooter>
            <Button
              className="bg-medical-teal hover:bg-teal-600"
              onClick={handleClinicDetailsSave}
              disabled={updateClinicLoading}
            >
              {updateClinicLoading ? t("saving") + "..." : t("save")}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Outreach Settings */}
      <Card className="max-w-2xl mx-auto hover-scale mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("outreachSettings")}</CardTitle>
            <Button
              variant="outline"
              onClick={handleOutreachSettingsEditToggle}
              disabled={updateSettingsLoading}
            >
              {isOutreachSettingsEditMode ? t("cancel") : t("edit")}
            </Button>
          </div>
          <CardDescription>
            {t("configureOutreachSchedule")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outreachStartTime">{t("outreachStartTime")}</Label>
              <Input
                id="outreachStartTime"
                type="time"
                value={outreachStartTime}
                onChange={(e) => setOutreachStartTime(e.target.value)}
                disabled={!isOutreachSettingsEditMode}
              />
            </div>
            <div>
              <Label htmlFor="outreachEndTime">{t("outreachEndTime")}</Label>
              <Input
                id="outreachEndTime"
                type="time"
                value={outreachEndTime}
                onChange={(e) => setOutreachEndTime(e.target.value)}
                disabled={!isOutreachSettingsEditMode}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="outreachInterval">{t("outreachIntervalMinutes")}</Label>
            <Input
              id="outreachInterval"
              type="number"
              value={outreachInterval}
              onChange={(e) => setOutreachInterval(Number(e.target.value))}
              disabled={!isOutreachSettingsEditMode}
            />
          </div>
          <div>
            <Label>{t("excludedDays")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !excludedDays && "text-muted-foreground"
                  )}
                  disabled={!isOutreachSettingsEditMode}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {excludedDays?.length > 0 ? (
                    format(excludedDays[0], "MM/dd/yyyy") + (excludedDays.length > 1 ? ` +${excludedDays.length - 1} more` : '')
                  ) : (
                    <span>{t("pickDates")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="multiple"
                  selected={excludedDays}
                  onSelect={handleDaySelect}
                  disabled={!isOutreachSettingsEditMode}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        {isOutreachSettingsEditMode && (
          <CardFooter>
            <Button
              className="bg-medical-teal hover:bg-teal-600"
              onClick={handleOutreachSettingsSave}
              disabled={updateSettingsLoading}
            >
              {updateSettingsLoading ? t("saving") + "..." : t("save")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SettingsPage;
