
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";
import AddPatientPage from "./pages/AddPatientPage";
import FollowUpsPage from "./pages/FollowUpsPage";
import DoctorsPage from "./pages/DoctorsPage";
import AdminOnlyPage from "./pages/AdminOnlyPage";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PatientsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PatientDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/add-patient"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddPatientPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/follow-ups"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FollowUpsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/doctors"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <DoctorsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminOnlyPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
