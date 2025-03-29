
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";
import AddPatientPage from "./pages/AddPatientPage";
import DoctorsPage from "./pages/DoctorsPage";
import FollowUpsPage from "./pages/FollowUpsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminOnlyPage from "./pages/AdminOnlyPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ColdLeadsPage from "./pages/ColdLeadsPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import { KeyRound, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import { Badge } from "./components/ui/badge";

// Admin bypass button component for development purposes only
const AdminBypass = () => {
  const { bypassAuth, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem("admin_bypass"));
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // Update debug info
    const updateDebugInfo = () => {
      const bypassData = localStorage.getItem("admin_bypass");
      setDebugInfo({
        isAdmin,
        isAuthenticated,
        bypassExists: !!bypassData,
        bypassData: bypassData ? JSON.parse(bypassData) : null,
        timestamp: new Date().toISOString()
      });
    };
    
    updateDebugInfo();
    
    // Update admin state based on localStorage
    const handleStorageChange = () => {
      const hasAdminBypass = !!localStorage.getItem("admin_bypass");
      setIsAdmin(hasAdminBypass);
      updateDebugInfo();
    };
    
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("bypass-changed", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("bypass-changed", handleStorageChange);
    };
  }, [isAdmin, isAuthenticated]);
  
  const handleBypassImplementation = async () => {
    setIsLoading(true);
    try {
      // Test connection before bypass
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        toast.error("Cannot bypass auth: Supabase connection failed");
        setIsLoading(false);
        return;
      }
      
      await bypassAuth();
      const bypassData = localStorage.getItem("admin_bypass");
      if (!bypassData) {
        throw new Error("Bypass data not created");
      }
      
      setIsAdmin(true);
      // Dispatch a custom event to notify other components
      document.dispatchEvent(new Event("bypass-changed"));
      toast.success("Admin access granted (DEVELOPMENT ONLY)");
      
      // Force page reload to ensure auth context is updated
      window.location.reload();
    } catch (error) {
      console.error("Bypass error:", error);
      toast.error(`Admin bypass failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      localStorage.removeItem("admin_bypass");
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("admin_bypass");
    setIsAdmin(false);
    // Dispatch a custom event to notify other components
    document.dispatchEvent(new Event("bypass-changed"));
    toast.success("Logged out of admin mode");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };
  
  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <Button
          disabled
          className="bg-yellow-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center"
          title="Activating Admin mode..."
        >
          <KeyRound size={20} />
        </Button>
      </div>
    );
  }
  
  // Debug panel that shows state
  const DebugPanel = () => (
    <div className="fixed bottom-16 right-4 bg-white border shadow-lg p-3 rounded-md max-w-xs w-full z-50 text-xs">
      <h3 className="font-bold text-sm mb-2 flex items-center gap-1">
        <Shield size={14} /> Admin Bypass Debug
      </h3>
      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-48">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <p className="mt-2 text-gray-600 italic">
        Click the button again to hide debug info
      </p>
    </div>
  );
  
  if (isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {showDebug && <DebugPanel />}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Admin Mode Active
          </Badge>
          <Button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 flex items-center justify-center"
            title="Toggle debug info"
          >
            <AlertTriangle size={18} />
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 flex items-center justify-center"
            title="Log out of Admin mode"
          >
            <KeyRound size={20} />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {showDebug && <DebugPanel />}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-gray-200 text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-300 flex items-center justify-center"
          title="Toggle debug info"
        >
          <AlertTriangle size={18} />
        </Button>
        <Button
          onClick={handleBypassImplementation}
          className="bg-red-50 text-red-800 p-2 rounded-full shadow-lg hover:bg-red-100 flex items-center justify-center"
          title="Bypass Authentication (ADMIN MODE)"
        >
          <KeyRound size={20} />
        </Button>
      </div>
    </div>
  );
};

// AppRoutes component with admin bypass button
const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/patients" element={
          <ProtectedRoute>
            <Layout>
              <PatientsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            <Layout>
              <PatientDetailsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/add-patient" element={
          <ProtectedRoute>
            <Layout>
              <AddPatientPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/cold-leads" element={
          <ProtectedRoute>
            <Layout>
              <ColdLeadsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/doctors" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <DoctorsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/follow-ups" element={
          <ProtectedRoute>
            <Layout>
              <FollowUpsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminOnlyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Add admin bypass button */}
      <AdminBypass />
    </>
  );
};

function App() {
  const [connectionStatus, setConnectionStatus] = useState({ 
    checked: false, 
    success: false, 
    error: null 
  });

  // Check for connection on startup
  useEffect(() => {
    testSupabaseConnection().then(result => {
      setConnectionStatus({
        checked: true,
        success: result.success,
        error: result.error
      });
      
      if (!result.success) {
        console.error("⚠️ Supabase connection test failed", result.error);
        toast.error("Failed to connect to Supabase");
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
      {!connectionStatus.success && connectionStatus.checked && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center z-50">
          Supabase connection failed. Check console for details.
        </div>
      )}
    </AuthProvider>
  );
}

export default App;
