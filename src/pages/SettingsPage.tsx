
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

const SettingsPage = () => {
  const [language, setLanguage] = useState<LanguageSettings>({
    primary: "en",
    enableTranslation: true,
  });

  const handleTimeSettingsChange = (settings: TimeSlotSettings) => {
    console.log("Time settings updated:", settings);
    // In a real app, this would save to backend
  };

  const handleFileAccepted = (file: File) => {
    console.log("File accepted:", file.name);
    // In a real app, this would start processing the file
  };

  const handleLanguageChange = (lang: "en" | "ar") => {
    setLanguage((prev) => ({
      ...prev,
      primary: lang,
    }));
    toast.success(`Language set to ${lang === "en" ? "English" : "العربية"}`);
    
    // In a real app, this would change the app's language
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const toggleTranslation = (enabled: boolean) => {
    setLanguage((prev) => ({
      ...prev,
      enableTranslation: enabled,
    }));
    
    toast.success(`Automatic translation ${enabled ? "enabled" : "disabled"}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="time" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" /> Outreach Time
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" /> Import
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center">
            <Languages className="h-4 w-4 mr-2" /> Language
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Scripts
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Compliance
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
                Import Patients
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
                  <li>Required columns: Name, Phone, Treatment, Price</li>
                  <li>Phone numbers must be in UAE format (+971...)</li>
                  <li>Maximum 1000 records per file</li>
                </ul>
              </div>
              
              <FileUploader 
                onFileAccepted={handleFileAccepted}
                allowedFileTypes={[".csv", ".xlsx", ".xls"]}
                maxSizeMB={10}
              />
              
              <div className="text-xs text-muted-foreground mt-4">
                <p>Need a template? <a href="#" className="text-primary hover:underline">Download sample file</a></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="mr-2 h-5 w-5 text-primary" />
                Language Settings
              </CardTitle>
              <CardDescription>
                Configure language preferences and translation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="primaryLanguage">Primary Interface Language</Label>
                <Select
                  value={language.primary}
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
                    checked={language.enableTranslation}
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
                Communication Scripts
              </CardTitle>
              <CardDescription>
                Customize follow-up messages and call scripts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="scriptType">Script Type</Label>
                <Select defaultValue="sms">
                  <SelectTrigger id="scriptType" className="w-full sm:w-64">
                    <SelectValue placeholder="Select script type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS Template</SelectItem>
                    <SelectItem value="voice">Voice Call Script</SelectItem>
                    <SelectItem value="email">Email Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="treatmentType">Treatment Category</Label>
                <Select defaultValue="dental">
                  <SelectTrigger id="treatmentType" className="w-full sm:w-64">
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="cosmetic">Cosmetic</SelectItem>
                    <SelectItem value="fertility">Fertility</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scriptContent">Script Content</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Available variables: {"{name}"}, {"{clinic}"}, {"{treatment}"}, {"{price}"}
                </div>
                <textarea
                  id="scriptContent"
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your script content"
                  defaultValue="Hi {name}, this is {clinic} following up on your {treatment} consultation. Your quoted price was AED {price}. Are you interested in booking an appointment?"
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Script</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Compliance Settings
              </CardTitle>
              <CardDescription>
                Configure privacy and compliance settings for patient communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="aiDisclosure" defaultChecked />
                  <Label htmlFor="aiDisclosure">
                    Enable AI disclosure message
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  When enabled, all AI voice calls will begin with "This is an automated call from [Clinic Name]"
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="optOutMessage" defaultChecked />
                  <Label htmlFor="optOutMessage">
                    Include opt-out instructions in messages
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  Add "Reply STOP to opt-out" to all SMS communications
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="maxAttempts">Maximum Contact Attempts</Label>
                <Select defaultValue="3">
                  <SelectTrigger id="maxAttempts" className="w-full sm:w-64">
                    <SelectValue placeholder="Select max attempts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 attempt</SelectItem>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  After reaching maximum attempts, leads will be marked as "Cold"
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="consentRequirement">Consent Requirement</Label>
                <Select defaultValue="explicit">
                  <SelectTrigger id="consentRequirement" className="w-full sm:w-64">
                    <SelectValue placeholder="Select consent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explicit">Explicit consent only</SelectItem>
                    <SelectItem value="implied">Allow implied consent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  "Explicit" requires documented patient consent before follow-up
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Save Compliance Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
