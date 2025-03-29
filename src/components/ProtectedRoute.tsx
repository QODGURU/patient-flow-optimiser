
import { useEffect, useState } from "react";
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
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Simplified auth check that uses the context directly
    const verifyAuth = async () => {
      if (!isLoading) {
        // Check if user is authenticated via context
        if (!isAuthenticated) {
          console.log("User not authenticated, redirecting to login");
          navigate("/login");
          return;
        }

        // If this is an admin-only route, check if user is admin
        if (isAuthenticated && adminOnly && profile?.role !== "admin") {
          console.log("User is not admin, redirecting to dashboard");
          toast.error("You don't have permission to access this page");
          navigate("/dashboard");
          return;
        }

        setVerifying(false);
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, adminOnly, navigate, profile]);

  // Show loading state during verification
  if (isLoading || verifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-teal"></div>
        <span className="ml-3">Verifying access...</span>
      </div>
    );
  }

  // If we've completed verification, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
