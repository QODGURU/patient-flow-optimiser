
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, ReactNode, useEffect } from "react";
import { 
  Users, LogOut, User, Settings, Home, 
  FilePlus, List, BarChart, Menu, X, Bell,
  Snowflake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    // Close sidebar on route change (for mobile)
    closeSidebar();
  }, [location.pathname]);

  if (!user) {
    return <>{children}</>;
  }

  const isAdmin = user.role === "admin";
  const currentPath = location.pathname;

  const isLinkActive = (path: string) => {
    return currentPath.startsWith(path);
  };

  const NavLink = ({ to, icon, label, adminOnly = false }: 
    { to: string; icon: ReactNode; label: string; adminOnly?: boolean }) => {
    if (adminOnly && !isAdmin) return null;
    
    const active = isLinkActive(to);
    
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          active 
            ? "text-white bg-medical-navy" 
            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        )}
        onClick={closeSidebar}
      >
        <div className={cn("mr-3 h-5 w-5", active ? "text-white" : "text-gray-400")}>
          {icon}
        </div>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center">
                <span className="text-medical-navy font-bold text-xl ml-2">Patient Flow Optimiser</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              
              <div className="relative">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{isAdmin ? "Admin" : "Doctor"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile - overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 md:hidden bg-black bg-opacity-50 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={closeSidebar}
        ></div>

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="h-16 flex items-center justify-between px-4 md:hidden border-b">
            <span className="text-medical-navy font-bold">Patient Flow Optimiser</span>
            <button 
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 px-2 space-y-1">
            <NavLink to="/dashboard" icon={<Home />} label="Dashboard" />
            <NavLink to="/patients" icon={<Users />} label="Patients" />
            <NavLink to="/add-patient" icon={<FilePlus />} label="Add Patient" />
            <NavLink to="/cold-leads" icon={<Snowflake />} label="Cold Leads" />
            <NavLink to="/follow-ups" icon={<List />} label="Follow-ups" />
            
            {isAdmin && (
              <>
                <div className="mt-8 pt-2 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                <NavLink to="/doctors" icon={<User />} label="Doctors" adminOnly />
                <NavLink to="/admin" icon={<BarChart />} label="Analytics" adminOnly />
                <NavLink to="/settings" icon={<Settings />} label="Settings" />
              </>
            )}
            
            {!isAdmin && (
              <>
                <div className="mt-8 pt-2 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Settings
                  </h3>
                </div>
                <NavLink to="/settings" icon={<Settings />} label="Settings" />
              </>
            )}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
