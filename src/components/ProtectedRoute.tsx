
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isUserAuthenticated, getCurrentUserProfile } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile, checkAuth } = useAuth();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Verify authentication with the server directly
    const verifyAuth = async () => {
      if (!isLoading) {
        // Double-check with Supabase directly
        const { isAuthenticated: isDirectlyAuthenticated, error } = await isUserAuthenticated();
        console.log("Direct auth check:", { isDirectlyAuthenticated, error });

        if (error) {
          console.error("Auth verification error:", error);
          toast.error("Authentication error. Please log in again.");
          navigate("/login");
          return;
        }

        if (!isDirectlyAuthenticated) {
          console.log("User not authenticated via direct check, redirecting to login");
          navigate("/login");
          return;
        }

        if (isDirectlyAuthenticated && adminOnly) {
          // Verify admin status
          const { profile: directProfile, error: profileError } = await getCurrentUserProfile();
          console.log("Direct profile check:", { directProfile, profileError });

          if (profileError || !directProfile) {
            console.error("Profile verification error:", profileError);
            toast.error("Profile verification error. Please log in again.");
            navigate("/login");
            return;
          }

          if (directProfile.role !== "admin") {
            console.log("User is not admin, redirecting to dashboard");
            toast.error("You don't have permission to access this page");
            navigate("/dashboard");
            return;
          }
        }

        setVerifying(false);
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, adminOnly, navigate, checkAuth]);

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
