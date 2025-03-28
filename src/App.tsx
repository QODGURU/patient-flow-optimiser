
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
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="patients" element={<PatientsPage />} />
                  <Route path="patients/:id" element={<PatientDetailsPage />} />
                  <Route path="add-patient" element={<AddPatientPage />} />
                  <Route path="cold-leads" element={<ColdLeadsPage />} />
                  <Route path="doctors" element={<DoctorsPage />} />
                  <Route path="follow-ups" element={<FollowUpsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="admin" element={<ProtectedRoute adminOnly><AdminOnlyPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
