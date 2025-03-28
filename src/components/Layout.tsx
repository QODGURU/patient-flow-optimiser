
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState, ReactNode } from "react";
import { 
  Users, LogOut, User, Settings, Home, 
  FilePlus, List, BarChart, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  if (!user) {
    return <>{children}</>;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
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
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">
                {user.name} ({isAdmin ? "Admin" : "Doctor"})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile */}
        <div
          className={cn(
            "fixed inset-0 z-40 md:hidden bg-black bg-opacity-50 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={closeSidebar}
        ></div>

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="h-16 flex items-center justify-between px-4 md:hidden">
            <span className="text-medical-navy font-bold">Patient Flow Optimiser</span>
            <button 
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 px-2 space-y-1">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-medical-light-blue"
              onClick={closeSidebar}
            >
              <Home className="mr-3 h-5 w-5 text-medical-navy" />
              Dashboard
            </Link>
            <Link
              to="/patients"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={closeSidebar}
            >
              <Users className="mr-3 h-5 w-5 text-gray-400" />
              Patients
            </Link>
            <Link
              to="/add-patient"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={closeSidebar}
            >
              <FilePlus className="mr-3 h-5 w-5 text-gray-400" />
              Add Patient
            </Link>
            <Link
              to="/follow-ups"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              onClick={closeSidebar}
            >
              <List className="mr-3 h-5 w-5 text-gray-400" />
              Follow-ups
            </Link>
            
            {isAdmin && (
              <>
                <div className="mt-8 pt-2 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                <Link
                  to="/doctors"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeSidebar}
                >
                  <User className="mr-3 h-5 w-5 text-gray-400" />
                  Doctors
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeSidebar}
                >
                  <BarChart className="mr-3 h-5 w-5 text-gray-400" />
                  Analytics
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeSidebar}
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
