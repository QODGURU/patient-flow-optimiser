
import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

// Translations interface
type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

// Default translations
const translations: Translations = {
  en: {
    // Dashboard
    "dashboard": "Dashboard",
    "totalPatients": "Total Patients",
    "bookedAppointments": "Booked Appointments",
    "callFollowUps": "Call Follow-ups",
    "messageFollowUps": "Message Follow-ups",
    "patientStatus": "Patient Status",
    "recentFollowUps": "Recent Follow-ups",
    
    // Patients
    "patients": "Patients",
    "addPatient": "Add Patient",
    "searchByNameOrPhone": "Search by name or phone",
    "statusAll": "All Statuses",
    "name": "Name",
    "phone": "Phone",
    "treatment": "Treatment",
    "price": "Price (AED)",
    "status": "Status",
    "clinic": "Clinic",
    "actions": "Actions",
    "viewDetails": "View Details",
    "noPatientsFound": "No patients found",
    "tryChangingSearchOrFilter": "Try changing your search or filter criteria",
    "startByAddingNewPatient": "Start by adding a new patient",
    
    // Patient Status
    "pending": "Pending",
    "contacted": "Contacted",
    "interested": "Interested",
    "booked": "Booked",
    "cold": "Cold",
    "optOut": "Opt-out",
    
    // Add Patient
    "addNewPatient": "Add New Patient",
    "patientInformation": "Patient Information",
    "enterPatientDetails": "Enter the patient's details from the consultation",
    "personalInformation": "Personal Information",
    "patientName": "Patient Name",
    "phoneNumber": "Phone Number",
    "age": "Age",
    "gender": "Gender",
    "male": "Male",
    "female": "Female",
    "other": "Other",
    "treatmentInformation": "Treatment Information",
    "price": "Price (AED)",
    "thisPatientNeedsFollowUp": "This patient needs follow-up",
    "clinicInformation": "Clinic Information",
    "assignedDoctor": "Assigned Doctor",
    "selectDoctor": "Select doctor",
    "clinicName": "Clinic Name",
    "cancel": "Cancel",
    
    // Follow-ups
    "followUps": "Follow-ups",
    "type": "Type",
    "allTypes": "All Types",
    "calls": "Calls",
    "messages": "Messages",
    "response": "Response",
    "allResponses": "All Responses",
    "yes": "Yes",
    "no": "No",
    "maybe": "Maybe",
    "callAgain": "Call Again",
    "noResponse": "No Response",
    "recent": "Recent",
    "pendingResponses": "Pending Responses",
    "latestCommunications": "Latest communications with patients",
    "followUpsNeedFurtherAction": "Follow-ups that need further action",
    "noFollowUpsFound": "No follow-ups found",
    "noFollowUpsMessage": "Try changing your filters or add new follow-ups",
    "noPendingFollowUps": "No pending follow-ups",
    "allFollowUpsHaveResponses": "All follow-ups have responses",
    "updateStatus": "Update Status",
    
    // Settings
    "settings": "Settings",
    "outreachTime": "Outreach Time",
    "import": "Import",
    "language": "Language",
    "scripts": "Scripts",
    "compliance": "Compliance",
    
    // Time Settings
    "outreachTimeSettings": "Outreach Time Settings",
    "setTimeRangeForPatient": "Set the time range for patient follow-ups and excluded days",
    "startTime": "Start Time",
    "earliestTimeToContact": "Earliest time to contact patients",
    "endTime": "End Time",
    "latestTimeToContact": "Latest time to contact patients",
    "excludedDays": "Excluded Days",
    "systemWillNotSendFollowUps": "System will not send follow-ups on these days",
    "saveSettings": "Save Settings",
    
    // Import
    "importPatients": "Import Patients",
    "uploadCSVorExcel": "Upload CSV or Excel files to bulk import patient records",
    "fileRequirements": "File Requirements",
    "fileFormatRequirement": "File must be .csv, .xlsx, or .xls format",
    "requiredColumns": "Required columns: Name, Phone, Treatment, Price",
    "phoneNumberFormat": "Phone numbers must be in UAE format (+971...)",
    "maxRecords": "Maximum 1000 records per file",
    "needTemplate": "Need a template?",
    "downloadSampleFile": "Download sample file",
    
    // Scripts
    "communicationScripts": "Communication Scripts",
    "customizeFollowUpMessages": "Customize follow-up messages and call scripts",
    "scriptType": "Script Type",
    "selectScriptType": "Select script type",
    "smsTemplate": "SMS Template",
    "voiceCallScript": "Voice Call Script",
    "emailTemplate": "Email Template",
    "treatmentCategory": "Treatment Category",
    "selectTreatment": "Select treatment",
    "dental": "Dental",
    "cosmetic": "Cosmetic",
    "fertility": "Fertility",
    "general": "General",
    "scriptContent": "Script Content",
    "availableVariables": "Available variables",
    "resetToDefault": "Reset to Default",
    "saveScript": "Save Script",
    
    // Common
    "loading": "Loading...",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "search": "Search",
    "filter": "Filter",
    "selectDate": "Select date",
    "from": "From",
    "to": "To",
    "submit": "Submit",
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "info": "Info",
  },
  ar: {
    // Dashboard
    "dashboard": "لوحة التحكم",
    "totalPatients": "إجمالي المرضى",
    "bookedAppointments": "المواعيد المحجوزة",
    "callFollowUps": "متابعات الاتصال",
    "messageFollowUps": "متابعات الرسائل",
    "patientStatus": "حالة المريض",
    "recentFollowUps": "المتابعات الأخيرة",
    
    // Patients
    "patients": "المرضى",
    "addPatient": "إضافة مريض",
    "searchByNameOrPhone": "البحث بالاسم أو رقم الهاتف",
    "statusAll": "جميع الحالات",
    "name": "الاسم",
    "phone": "الهاتف",
    "treatment": "العلاج",
    "price": "السعر (درهم)",
    "status": "الحالة",
    "clinic": "العيادة",
    "actions": "الإجراءات",
    "viewDetails": "عرض التفاصيل",
    "noPatientsFound": "لم يتم العثور على مرضى",
    "tryChangingSearchOrFilter": "حاول تغيير معايير البحث أو التصفية",
    "startByAddingNewPatient": "ابدأ بإضافة مريض جديد",
    
    // Patient Status
    "pending": "قيد الانتظار",
    "contacted": "تم الاتصال",
    "interested": "مهتم",
    "booked": "محجوز",
    "cold": "بارد",
    "optOut": "انسحاب",
    
    // Add Patient
    "addNewPatient": "إضافة مريض جديد",
    "patientInformation": "معلومات المريض",
    "enterPatientDetails": "أدخل تفاصيل المريض من الاستشارة",
    "personalInformation": "المعلومات الشخصية",
    "patientName": "اسم المريض",
    "phoneNumber": "رقم الهاتف",
    "age": "العمر",
    "gender": "الجنس",
    "male": "ذكر",
    "female": "أنثى",
    "other": "آخر",
    "treatmentInformation": "معلومات العلاج",
    "price": "السعر (درهم)",
    "thisPatientNeedsFollowUp": "هذا المريض يحتاج إلى متابعة",
    "clinicInformation": "معلومات العيادة",
    "assignedDoctor": "الطبيب المعين",
    "selectDoctor": "اختر الطبيب",
    "clinicName": "اسم العيادة",
    "cancel": "إلغاء",
    
    // Follow-ups
    "followUps": "المتابعات",
    "type": "النوع",
    "allTypes": "جميع الأنواع",
    "calls": "المكالمات",
    "messages": "الرسائل",
    "response": "الاستجابة",
    "allResponses": "جميع الاستجابات",
    "yes": "نعم",
    "no": "لا",
    "maybe": "ربما",
    "callAgain": "اتصل مرة أخرى",
    "noResponse": "لا توجد استجابة",
    "recent": "حديث",
    "pendingResponses": "الردود المعلقة",
    "latestCommunications": "أحدث الاتصالات مع المرضى",
    "followUpsNeedFurtherAction": "المتابعات التي تحتاج إلى إجراء إضافي",
    "noFollowUpsFound": "لم يتم العثور على متابعات",
    "noFollowUpsMessage": "حاول تغيير عوامل التصفية أو إضافة متابعات جديدة",
    "noPendingFollowUps": "لا توجد متابعات معلقة",
    "allFollowUpsHaveResponses": "جميع المتابعات لديها استجابات",
    "updateStatus": "تحديث الحالة",
    
    // Settings
    "settings": "الإعدادات",
    "outreachTime": "وقت التواصل",
    "import": "استيراد",
    "language": "اللغة",
    "scripts": "النصوص",
    "compliance": "الامتثال",
    
    // Time Settings
    "outreachTimeSettings": "إعدادات وقت التواصل",
    "setTimeRangeForPatient": "تعيين النطاق الزمني لمتابعات المرضى والأيام المستبعدة",
    "startTime": "وقت البدء",
    "earliestTimeToContact": "أقرب وقت للاتصال بالمرضى",
    "endTime": "وقت الانتهاء",
    "latestTimeToContact": "آخر وقت للاتصال بالمرضى",
    "excludedDays": "الأيام المستبعدة",
    "systemWillNotSendFollowUps": "لن يرسل النظام متابعات في هذه الأيام",
    "saveSettings": "حفظ الإعدادات",
    
    // Import
    "importPatients": "استيراد المرضى",
    "uploadCSVorExcel": "تحميل ملفات CSV أو Excel لاستيراد سجلات المرضى بالجملة",
    "fileRequirements": "متطلبات الملف",
    "fileFormatRequirement": "يجب أن يكون الملف بتنسيق .csv أو .xlsx أو .xls",
    "requiredColumns": "الأعمدة المطلوبة: الاسم، الهاتف، العلاج، السعر",
    "phoneNumberFormat": "يجب أن تكون أرقام الهواتف بتنسيق الإمارات (+971...)",
    "maxRecords": "الحد الأقصى 1000 سجل لكل ملف",
    "needTemplate": "هل تحتاج إلى قالب؟",
    "downloadSampleFile": "تنزيل ملف عينة",
    
    // Scripts
    "communicationScripts": "نصوص التواصل",
    "customizeFollowUpMessages": "تخصيص رسائل المتابعة ونصوص المكالمات",
    "scriptType": "نوع النص",
    "selectScriptType": "اختر نوع النص",
    "smsTemplate": "قالب الرسائل القصيرة",
    "voiceCallScript": "نص المكالمة الصوتية",
    "emailTemplate": "قالب البريد الإلكتروني",
    "treatmentCategory": "فئة العلاج",
    "selectTreatment": "اختر العلاج",
    "dental": "الأسنان",
    "cosmetic": "التجميل",
    "fertility": "الخصوبة",
    "general": "عام",
    "scriptContent": "محتوى النص",
    "availableVariables": "المتغيرات المتاحة",
    "resetToDefault": "إعادة إلى الإعدادات الافتراضية",
    "saveScript": "حفظ النص",
    
    // Common
    "loading": "جاري التحميل...",
    "save": "حفظ",
    "edit": "تعديل",
    "delete": "حذف",
    "search": "بحث",
    "filter": "تصفية",
    "selectDate": "اختر التاريخ",
    "from": "من",
    "to": "إلى",
    "submit": "إرسال",
    "success": "نجاح",
    "error": "خطأ",
    "warning": "تحذير",
    "info": "معلومات",
  }
};

// Interface for the Language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'ar' ? 'ar' : 'en') as Language;
  });

  // Effect to update document properties when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
