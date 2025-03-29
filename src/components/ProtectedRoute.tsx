
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        console.log("User not authenticated, redirecting to login");
        navigate("/login");
        return;
      }
      
      if (isAuthenticated && adminOnly && profile?.role !== "admin") {
        // Redirect to dashboard if not admin but trying to access admin-only route
        console.log("User is not admin, redirecting to dashboard");
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
        return;
      }
      
      console.log("Protected route access granted", { 
        isAuthenticated, 
        role: profile?.role, 
        adminOnly 
      });
    }
  }, [isAuthenticated, isLoading, adminOnly, profile, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-teal"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // Allow rendering only if authenticated (and is admin if adminOnly is true)
  if (isAuthenticated && (!adminOnly || (adminOnly && profile?.role === "admin"))) {
    return <>{children}</>;
  }

  // This will briefly show before the redirect happens
  return null;
};

export default ProtectedRoute;
