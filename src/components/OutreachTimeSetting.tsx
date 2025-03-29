
import { useState } from "react";
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
  initialSettings?: {
    startTime: string;
    endTime: string;
    excludedDays: string[];
  };
  onSave?: (settings: {
    startTime: string;
    endTime: string;
    excludedDays: string[];
  }) => void;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const OutreachTimeSetting = ({
  initialSettings = {
    startTime: "09:00",
    endTime: "17:00",
    excludedDays: ["Friday", "Saturday"],
  },
  onSave,
  id,
  value,
  onChange,
}: OutreachTimeSettingProps) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(initialSettings);

  // If value and onChange are provided, use them instead of the internal state
  const effectiveValue = value || (id === 'start-time' ? settings.startTime : settings.endTime);

  const handleTimeChange = (time: string) => {
    if (onChange) {
      onChange(time);
    } else {
      setSettings((prev) => ({
        ...prev,
        [id === 'start-time' ? 'startTime' : 'endTime']: time,
      }));
    }
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
    <div className="w-full">
      <Input
        id={id}
        type="time"
        value={effectiveValue}
        onChange={(e) => handleTimeChange(e.target.value)}
      />
    </div>
  );
};

export default OutreachTimeSetting;
