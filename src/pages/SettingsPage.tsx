
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import OutreachTimeSetting from "@/components/OutreachTimeSetting";
import FileUploader from "@/components/FileUploader";
import { TimeSlotSettings, LanguageSettings } from "@/types";
import { toast } from "sonner";
import {
  Settings,
  Clock,
  Upload,
  Languages,
  MessageSquare,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    primary: language,
    enableTranslation: true,
  });

  const handleTimeSettingsChange = (settings: TimeSlotSettings) => {
    console.log("Time settings updated:", settings);
    toast.success(t("settingsSaved"));
    // In a real app, this would save to backend
  };

  const handleFileAccepted = (file: File) => {
    console.log("File accepted:", file.name);
    // In a real app, this would start processing the file
  };

  const handleLanguageChange = (lang: "en" | "ar") => {
    setLanguageSettings((prev) => ({
      ...prev,
      primary: lang,
    }));
    
    setLanguage(lang);
    toast.success(lang === "en" ? "Language set to English" : "تم تعيين اللغة إلى العربية");
  };

  const toggleTranslation = (enabled: boolean) => {
    setLanguageSettings((prev) => ({
      ...prev,
      enableTranslation: enabled,
    }));
    
    toast.success(enabled ? t("autoTranslationEnabled") : t("autoTranslationDisabled"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
      </div>

      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="time" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" /> {t("outreachTime")}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" /> {t("import")}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center">
            <Languages className="h-4 w-4 mr-2" /> {t("language")}
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> {t("scripts")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time">
          <OutreachTimeSetting onSave={handleTimeSettingsChange} />
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5 text-primary" />
                {t("importPatients")}
              </CardTitle>
              <CardDescription>
                {t("uploadCSVorExcel")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">{t("fileRequirements")}</h3>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  <li>{t("fileFormatRequirement")}</li>
                  <li>{t("requiredColumns")}</li>
                  <li>{t("phoneNumberFormat")}</li>
                  <li>{t("maxRecords")}</li>
                </ul>
              </div>
              
              <FileUploader 
                onFileAccepted={handleFileAccepted}
                allowedFileTypes={[".csv", ".xlsx", ".xls"]}
                maxSizeMB={10}
              />
              
              <div className="text-xs text-muted-foreground mt-4">
                <p>{t("needTemplate")} <a href="/templates/patient_import_template.xlsx" download className="text-primary hover:underline">{t("downloadSampleFile")}</a></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="mr-2 h-5 w-5 text-primary" />
                {t("language")}
              </CardTitle>
              <CardDescription>
                Configure language preferences and translation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="primaryLanguage">Primary Interface Language</Label>
                <Select
                  value={languageSettings.primary}
                  onValueChange={(value: "en" | "ar") => handleLanguageChange(value)}
                >
                  <SelectTrigger id="primaryLanguage" className="w-full sm:w-64">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will change the interface language for all users
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enableTranslation" 
                    checked={languageSettings.enableTranslation}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        toggleTranslation(checked);
                      }
                    }}
                  />
                  <Label htmlFor="enableTranslation">
                    Enable automatic translation for patient communications
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  When enabled, the system will automatically translate communications based on patient language preference
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                {t("communicationScripts")}
              </CardTitle>
              <CardDescription>
                {t("customizeFollowUpMessages")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="scriptType">{t("scriptType")}</Label>
                <Select defaultValue="sms">
                  <SelectTrigger id="scriptType" className="w-full sm:w-64">
                    <SelectValue placeholder={t("selectScriptType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">{t("smsTemplate")}</SelectItem>
                    <SelectItem value="voice">{t("voiceCallScript")}</SelectItem>
                    <SelectItem value="email">{t("emailTemplate")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="treatmentType">{t("treatmentCategory")}</Label>
                <Select defaultValue="dental">
                  <SelectTrigger id="treatmentType" className="w-full sm:w-64">
                    <SelectValue placeholder={t("selectTreatment")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dental">{t("dental")}</SelectItem>
                    <SelectItem value="cosmetic">{t("cosmetic")}</SelectItem>
                    <SelectItem value="fertility">{t("fertility")}</SelectItem>
                    <SelectItem value="general">{t("general")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scriptContent">{t("scriptContent")}</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  {t("availableVariables")}: {"{name}"}, {"{clinic}"}, {"{treatment}"}, {"{price}"}
                </div>
                <textarea
                  id="scriptContent"
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your script content"
                  defaultValue="Hi {name}, this is {clinic} following up on your {treatment} consultation. Your quoted price was AED {price}. Are you interested in booking an appointment?"
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline">{t("resetToDefault")}</Button>
                <Button>{t("saveScript")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
