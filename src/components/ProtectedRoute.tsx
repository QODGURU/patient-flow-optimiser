
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
        // Check if we're using admin bypass (for development)
        const adminBypass = localStorage.getItem("admin_bypass");
        if (adminBypass) {
          try {
            const mockProfile = JSON.parse(adminBypass);
            if (adminOnly && mockProfile.role !== "admin") {
              console.log("Admin bypass user is not admin, redirecting to dashboard");
              toast.error("You don't have permission to access this page");
              navigate("/dashboard");
              return;
            }
            setVerifying(false);
            return;
          } catch (error) {
            console.error("Error parsing admin bypass:", error);
            localStorage.removeItem("admin_bypass");
          }
        }

        // Check if user is authenticated via context
        if (!isAuthenticated) {
          console.log("User not authenticated, redirecting to login");
          toast.error("Please log in to access this page");
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
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-medical-teal" />
        <span className="mt-4 text-gray-700">Verifying access...</span>
      </div>
    );
  }

  // If we've completed verification, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
