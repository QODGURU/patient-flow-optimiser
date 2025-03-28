
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  Users,
  PhoneCall,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  UserPlus,
  Snowflake
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Update collapsed state when screen size changes
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const isAdmin = user?.role === "admin";

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group border-r bg-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-screen flex-col">
        <div className="flex h-14 items-center border-b px-3 py-4">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 font-semibold",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            {isCollapsed ? (
              <img src="/logo-small.svg" alt="Logo" className="h-8 w-8" />
            ) : (
              <div className="flex items-center gap-2">
                <img src="/logo-small.svg" alt="Logo" className="h-8 w-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                  Patient Flow
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className={cn(
              "absolute right-[-12px] top-7 rounded-full border border-border p-1 bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out",
              isCollapsed ? "rotate-180" : ""
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-auto">
          <nav className="grid gap-1 px-2 py-3">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                location.pathname === "/dashboard" ? "bg-accent" : "transparent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              {!isCollapsed && <span>{t("dashboard")}</span>}
            </Link>
            <Link
              to="/patients"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                location.pathname === "/patients" ? "bg-accent" : "transparent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Users className="h-5 w-5" />
              {!isCollapsed && <span>{t("patients")}</span>}
            </Link>
            <Link
              to="/add-patient"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                location.pathname === "/add-patient" ? "bg-accent" : "transparent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <UserPlus className="h-5 w-5" />
              {!isCollapsed && <span>{t("addPatient")}</span>}
            </Link>
            <Link
              to="/cold-leads"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                location.pathname === "/cold-leads" ? "bg-accent" : "transparent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Snowflake className="h-5 w-5" />
              {!isCollapsed && <span>Cold Leads</span>}
            </Link>
            <Link
              to="/follow-ups"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                location.pathname === "/follow-ups" ? "bg-accent" : "transparent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <PhoneCall className="h-5 w-5" />
              {!isCollapsed && <span>{t("followUps")}</span>}
            </Link>
            {isAdmin && (
              <Link
                to="/doctors"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                  location.pathname === "/doctors" ? "bg-accent" : "transparent",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <BarChart3 className="h-5 w-5" />
                {!isCollapsed && <span>Doctors</span>}
              </Link>
            )}
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
                location.pathname === "/settings" ? "bg-accent" : "transparent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Settings className="h-5 w-5" />
              {!isCollapsed && <span>{t("settings")}</span>}
            </Link>
          </nav>
          <div className="mt-auto">
            <div className="px-3 py-2">
              <div className="mb-4">
                <div
                  className={cn(
                    "border-t my-2",
                    isCollapsed ? "mx-2" : "mx-0"
                  )}
                ></div>
                <button
                  onClick={logout}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition-all hover:bg-red-50",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span>Logout</span>}
                </button>
              </div>
              {!isCollapsed && (
                <div className="px-3 text-xs text-gray-500 mb-4">
                  <p>Patient Flow v1.0</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
