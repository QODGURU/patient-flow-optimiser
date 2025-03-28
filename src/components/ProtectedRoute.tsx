
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
    } else if (!isLoading && isAuthenticated && adminOnly && profile?.role !== "admin") {
      // Redirect to dashboard if not admin but trying to access admin-only route
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, adminOnly, profile, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Allow rendering only if authenticated (and is admin if adminOnly is true)
  if (isAuthenticated && (!adminOnly || (adminOnly && profile?.role === "admin"))) {
    return <>{children}</>;
  }

  // This will briefly show before the redirect happens
  return null;
};

export default ProtectedRoute;
