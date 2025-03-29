
import React, { createContext, useContext, useState, useEffect } from "react";

// Define available languages
const languages = ["en", "ar"] as const;
type Language = typeof languages[number];

// Define translation keys structure
interface TranslationMap {
  [key: string]: string;
}

// Define context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  translateText: (text: string, targetLang?: Language) => Promise<string>;
  isTranslating: boolean;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations storage
const translations: Record<Language, TranslationMap> = {
  en: {
    // General
    appName: "Medical CRM",
    dashboard: "Dashboard",
    patients: "Patients",
    doctors: "Doctors",
    coldLeads: "Cold Leads",
    followUps: "Follow-ups",
    settings: "Settings",
    admin: "Admin",
    login: "Login",
    logout: "Logout",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    noResults: "No results found",
    loading: "Loading...",
    adding: "Adding",
    yes: "Yes",
    no: "No",
    error: "Error",
    success: "Success",
    
    // Auth related
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    invalidCredentials: "Invalid email or password",
    
    // Patient related
    addPatient: "Add Patient",
    patientDetails: "Patient Details",
    patientName: "Patient Name",
    phoneNumber: "Phone Number",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    patientStatus: "Status",
    patientAdded: "Patient added successfully",
    patientUpdated: "Patient updated successfully",
    patientDeleted: "Patient deleted successfully",
    errorAddingPatient: "Error adding patient",
    patientAddedSuccessfully: "Patient added successfully",
    patientInformation: "Patient Information",
    personalInformation: "Personal Information",
    enterPatientDetails: "Enter patient details below",
    
    // Treatment
    treatmentInformation: "Treatment Information",
    treatmentCategory: "Treatment Category",
    treatmentType: "Treatment Type",
    price: "Price",
    thisPatientNeedsFollowUp: "This patient needs follow-up",
    
    // Follow-up
    followUpInfo: "Follow-up Information",
    preferredTime: "Preferred Time",
    preferredChannel: "Preferred Channel",
    
    // Clinic
    clinicInformation: "Clinic Information",
    clinicName: "Clinic Name",
    assignedDoctor: "Assigned Doctor",
    selectDoctor: "Select Doctor",
    
    // Import/Export
    importPatients: "Import Patients",
    exportPatients: "Export Patients",
    downloadTemplate: "Download Template",
    uploadFile: "Upload File",
    fileFormat: "File Format",
    
    // Analytics
    totalPatients: "Total Patients",
    newPatients: "New Patients",
    conversionRate: "Conversion Rate",
    pendingFollowUps: "Pending Follow-ups",
  },
  ar: {
    // General
    appName: "نظام إدارة العملاء الطبي",
    dashboard: "لوحة التحكم",
    patients: "المرضى",
    doctors: "الأطباء",
    coldLeads: "العملاء المحتملين",
    followUps: "المتابعات",
    settings: "الإعدادات",
    admin: "المشرف",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    search: "بحث",
    filter: "تصفية",
    noResults: "لا توجد نتائج",
    loading: "جاري التحميل...",
    adding: "جاري الإضافة",
    yes: "نعم",
    no: "لا",
    error: "خطأ",
    success: "نجاح",
    
    // Auth related
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    signIn: "تسجيل الدخول",
    invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صالحة",
    
    // Patient related
    addPatient: "إضافة مريض",
    patientDetails: "تفاصيل المريض",
    patientName: "اسم المريض",
    phoneNumber: "رقم الهاتف",
    age: "العمر",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    other: "آخر",
    patientStatus: "الحالة",
    patientAdded: "تمت إضافة المريض بنجاح",
    patientUpdated: "تم تحديث بيانات المريض بنجاح",
    patientDeleted: "تم حذف المريض بنجاح",
    errorAddingPatient: "خطأ في إضافة المريض",
    patientAddedSuccessfully: "تمت إضافة المريض بنجاح",
    patientInformation: "معلومات المريض",
    personalInformation: "المعلومات الشخصية",
    enterPatientDetails: "أدخل تفاصيل المريض أدناه",
    
    // Treatment
    treatmentInformation: "معلومات العلاج",
    treatmentCategory: "فئة العلاج",
    treatmentType: "نوع العلاج",
    price: "السعر",
    thisPatientNeedsFollowUp: "هذا المريض يحتاج إلى متابعة",
    
    // Follow-up
    followUpInfo: "معلومات المتابعة",
    preferredTime: "الوقت المفضل",
    preferredChannel: "قناة الاتصال المفضلة",
    
    // Clinic
    clinicInformation: "معلومات العيادة",
    clinicName: "اسم العيادة",
    assignedDoctor: "الطبيب المعين",
    selectDoctor: "اختر الطبيب",
    
    // Import/Export
    importPatients: "استيراد المرضى",
    exportPatients: "تصدير المرضى",
    downloadTemplate: "تنزيل القالب",
    uploadFile: "رفع ملف",
    fileFormat: "صيغة الملف",
    
    // Analytics
    totalPatients: "إجمالي المرضى",
    newPatients: "مرضى جدد",
    conversionRate: "معدل التحويل",
    pendingFollowUps: "متابعات معلقة",
  }
};

// Define the provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for the current language
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem("language");
    return (savedLang && (languages as readonly string[]).includes(savedLang)) 
      ? savedLang as Language 
      : "en";
  });
  
  const [isTranslating, setIsTranslating] = useState(false);

  // Effect to update HTML dir attribute and save language preference
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
  }, [language]);

  // Function to change the language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Function to get a translation
  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[language][key] || key;
    
    if (!params) return translation;
    
    // Replace parameters in the translation
    return Object.entries(params).reduce(
      (acc, [paramKey, paramValue]) => 
        acc.replace(new RegExp(`{{${paramKey}}}`, "g"), paramValue),
      translation
    );
  };

  // Translation API function
  const translateText = async (text: string, targetLang?: Language): Promise<string> => {
    const target = targetLang || language;
    if (target === 'en') return text; // No need to translate if target is English
    
    setIsTranslating(true);
    try {
      // Use LibreTranslate API for translation
      const response = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: target === 'ar' ? 'ar' : 'en',
          format: 'text',
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    } finally {
      setIsTranslating(false);
    }
  };

  // Context value
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    translateText,
    isTranslating
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
