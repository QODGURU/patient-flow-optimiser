
import { useEffect } from "react";
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
import { AuthProvider } from "./hooks/use-auth";
import Index from "./pages/Index";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <Router>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
