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
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";

// Admin bypass button component for development purposes only
const AdminBypass = () => {
  const { bypassAuth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if admin state is stored in local storage
    const storedAdminState = localStorage.getItem('adminBypass');
    if (storedAdminState === 'true') {
      handleBypassImplementation();
    }
  }, []);
  
  const handleBypassImplementation = async () => {
    setIsLoading(true);
    try {
      await bypassAuth();
      setIsAdmin(true);
      localStorage.setItem('adminBypass', 'true');
      // Don't redirect here - let the normal routing handle it
      toast.success("Admin access granted (DEVELOPMENT ONLY)");
    } catch (error) {
      console.error("Bypass error:", error);
      toast.error("Admin bypass failed");
      localStorage.removeItem('adminBypass');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBypass = () => {
    handleBypassImplementation();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminBypass');
    setIsAdmin(false);
    window.location.href = '/login';
  };
  
  if (isLoading) {
    return (
      <Button
        disabled
        className="fixed bottom-4 right-4 bg-yellow-600 text-white p-2 rounded-full shadow-lg z-50 flex items-center justify-center"
        title="Activating Admin mode..."
      >
        <KeyRound size={20} />
      </Button>
    );
  }
  
  if (isAdmin) {
    return (
      <Button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 z-50 flex items-center justify-center"
        title="Log out of Admin mode"
      >
        <KeyRound size={20} />
      </Button>
    );
  }
  
  return (
    <Button
      onClick={handleBypass}
      className="fixed bottom-4 right-4 bg-red-50 text-red-800 p-2 rounded-full shadow-lg hover:bg-red-100 z-50 flex items-center justify-center"
      title="Bypass Authentication (ADMIN MODE)"
    >
      <KeyRound size={20} />
    </Button>
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
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
