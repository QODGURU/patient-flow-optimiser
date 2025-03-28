
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        navigate("/login");
      } else if (adminOnly && profile?.role !== "admin") {
        console.log('Admin access required, user is not admin. Redirecting to dashboard');
        navigate("/dashboard");
      } else {
        console.log('Authentication verified:', profile?.role);
      }
    }
  }, [isLoading, isAuthenticated, profile, navigate, adminOnly]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (adminOnly && profile?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
