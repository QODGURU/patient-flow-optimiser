
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

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
    tryAgainOrContactSupport: "Please try again or contact support.",
    databaseConnectionError: "Database Connection Error",
    unableToConnectToDatabase: "Unable to connect to the database. Please try again later.",
    retryConnection: "Retry Connection",
    checkingDatabaseConnection: "Checking database connection...",
    manualEntry: "Manual Entry",
    bulkUpload: "Bulk Upload",
    uploadCsvOrExcel: "Upload CSV or Excel files to bulk import patient records",
    bulkImportPatients: "Bulk Import Patients",
    
    // Auth related
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    invalidCredentials: "Invalid email or password",
    
    // Patient related
    addPatient: "Add Patient",
    addNewPatient: "Add New Patient",
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

// Local storage key for caching translations
const TRANSLATION_CACHE_KEY = 'medical-crm-translations';

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
  const [translationCache, setTranslationCache] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  });

  // Effect to update HTML dir attribute and save language preference
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
  }, [language]);

  // Save translation cache to localStorage
  useEffect(() => {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
  }, [translationCache]);

  // Function to change the language
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Function to get a translation with memoization
  const t = useCallback((key: string, params?: Record<string, string>): string => {
    const translation = translations[language][key] || key;
    
    if (!params) return translation;
    
    // Replace parameters in the translation
    return Object.entries(params).reduce(
      (acc, [paramKey, paramValue]) => 
        acc.replace(new RegExp(`{{${paramKey}}}`, "g"), paramValue),
      translation
    );
  }, [language]);

  // Translation API function with caching
  const translateText = useCallback(async (text: string, targetLang?: Language): Promise<string> => {
    const target = targetLang || language;
    if (target === 'en') return text; // No need to translate if target is English
    
    // Generate cache key
    const cacheKey = `${text}_${target}`;
    
    // Check cache first
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    setIsTranslating(true);
    try {
      // Use Google Translate API via RapidAPI which has a free tier
      // Note: This is a better free alternative to LibreTranslate
      const response = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'application/gzip',
          'X-RapidAPI-Key': '12345678901234567890123456789012', // Replace with actual key in production
          'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
        },
        body: new URLSearchParams({
          q: text,
          source: 'en',
          target: target === 'ar' ? 'ar' : 'en',
          format: 'text'
        })
      });
      
      if (!response.ok) {
        // Fallback to LibreTranslate if RapidAPI fails
        return fallbackTranslate(text, target);
      }
      
      const data = await response.json();
      const translatedText = data?.data?.translations?.[0]?.translatedText || text;
      
      // Cache the result
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return fallbackTranslate(text, target);
    } finally {
      setIsTranslating(false);
    }
  }, [language, translationCache]);
  
  // Fallback translation function using LibreTranslate
  const fallbackTranslate = async (text: string, targetLang: Language): Promise<string> => {
    try {
      const response = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang === 'ar' ? 'ar' : 'en',
          format: 'text',
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return text;
      }
      
      const data = await response.json();
      const translatedText = data.translatedText || text;
      
      // Cache the result
      const cacheKey = `${text}_${targetLang}`;
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));
      
      return translatedText;
    } catch (error) {
      console.error('Fallback translation error:', error);
      return text;
    }
  };

  // Context value
  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t,
    translateText,
    isTranslating
  }), [language, setLanguage, t, translateText, isTranslating]);

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
