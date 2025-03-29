
import { useState } from "react";
import { TimeSlotSettings } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface OutreachTimeSettingProps {
  initialSettings?: TimeSlotSettings;
  onSave?: (settings: TimeSlotSettings) => void;
}

const OutreachTimeSetting = ({
  initialSettings = {
    startTime: "09:00",
    endTime: "17:00",
    excludedDays: ["Friday", "Saturday"],
  },
  onSave,
}: OutreachTimeSettingProps) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<TimeSlotSettings>(initialSettings);

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setSettings((prev) => {
      const excludedDays = [...prev.excludedDays];
      const index = excludedDays.indexOf(day);

      if (index >= 0) {
        excludedDays.splice(index, 1);
      } else {
        excludedDays.push(day);
      }

      return {
        ...prev,
        excludedDays,
      };
    });
  };

  const saveSettings = () => {
    // Validate time format and range
    const startHour = parseInt(settings.startTime.split(":")[0]);
    const endHour = parseInt(settings.endTime.split(":")[0]);

    if (startHour >= endHour) {
      toast.error("End time must be after start time");
      return;
    }

    if (onSave) {
      onSave(settings);
    }
    
    toast.success(t("outreachTimeSettingsSaved"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          {t("outreachTimeSettings")}
        </CardTitle>
        <CardDescription>
          {t("setTimeRangeForPatient")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startTime">{t("startTime")}</Label>
            <Input
              id="startTime"
              type="time"
              value={settings.startTime}
              onChange={(e) => handleTimeChange("startTime", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("earliestTimeToContact")}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime">{t("endTime")}</Label>
            <Input
              id="endTime"
              type="time"
              value={settings.endTime}
              onChange={(e) => handleTimeChange("endTime", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("latestTimeToContact")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t("excludedDays")}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={settings.excludedDays.includes(day)}
                  onCheckedChange={() => handleDayToggle(day)}
                />
                <Label
                  htmlFor={`day-${day}`}
                  className="text-sm font-normal"
                >
                  {day}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("systemWillNotSendFollowUps")}
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={saveSettings}>
            {t("saveSettings")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutreachTimeSetting;
