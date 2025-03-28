
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

type Language = "en" | "ar";

interface LanguageSelectorProps {
  onChange?: (language: Language) => void;
}

const LanguageSelector = ({ onChange }: LanguageSelectorProps) => {
  // Try to get the saved language from localStorage, or default to "en"
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'ar' ? 'ar' : 'en') as Language;
  });

  // Set initial language on component mount
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // Save language preference to localStorage
    localStorage.setItem('language', newLanguage);
    
    // Update document properties
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    
    // Call the onChange callback if provided
    if (onChange) {
      onChange(newLanguage);
    }
    
    // In a real app, we would also update translations context
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("ar")}
          className={language === "ar" ? "bg-accent" : ""}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
