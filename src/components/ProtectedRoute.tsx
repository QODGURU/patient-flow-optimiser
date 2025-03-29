
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, AlertCircle, Check, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [bypassStatus, setBypassStatus] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"pending" | "success" | "failed">("pending");
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    // Simplified auth check that uses the context directly
    const verifyAuth = async () => {
      if (!isLoading) {
        setDebugInfo({
          isAuthenticated,
          isLoading,
          adminOnly,
          profileRole: profile?.role,
          hasLocalBypass: !!localStorage.getItem("admin_bypass"),
          bypassData: localStorage.getItem("admin_bypass")
        });

        // Check if we're using admin bypass (for development)
        const adminBypass = localStorage.getItem("admin_bypass");
        if (adminBypass) {
          try {
            const mockProfile = JSON.parse(adminBypass);
            setBypassStatus("active");
            
            if (adminOnly && mockProfile.role !== "admin") {
              console.log("Admin bypass user is not admin, redirecting to dashboard");
              toast.error("You don't have permission to access this page");
              setAuthStatus("failed");
              navigate("/dashboard");
              return;
            }
            
            setAuthStatus("success");
            setVerifying(false);
            return;
          } catch (error) {
            console.error("Error parsing admin bypass:", error);
            setBypassStatus("error");
            localStorage.removeItem("admin_bypass");
            toast.error("Admin bypass data is invalid, it has been reset");
          }
        } else {
          setBypassStatus("inactive");
        }

        // Check if user is authenticated via context
        if (!isAuthenticated) {
          console.log("User not authenticated, redirecting to login");
          toast.error("Please log in to access this page");
          setAuthStatus("failed");
          navigate("/login");
          return;
        }

        // If this is an admin-only route, check if user is admin
        if (isAuthenticated && adminOnly && profile?.role !== "admin") {
          console.log("User is not admin, redirecting to dashboard");
          toast.error("You don't have permission to access this page");
          setAuthStatus("failed");
          navigate("/dashboard");
          return;
        }

        setAuthStatus("success");
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
        
        {/* Authentication Status Indicators */}
        <div className="mt-8 flex flex-col gap-2 p-4 border rounded-md bg-gray-50 max-w-md w-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Authentication Status:</span>
            {authStatus === "pending" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking
              </Badge>
            )}
            {authStatus === "success" && (
              <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Authenticated
              </Badge>
            )}
            {authStatus === "failed" && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Failed
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bypass Status:</span>
            {bypassStatus === "active" && (
              <Badge variant="default" className="bg-yellow-500 flex items-center gap-1">
                <KeyRound className="h-3 w-3" />
                Active
              </Badge>
            )}
            {bypassStatus === "inactive" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <KeyRound className="h-3 w-3" />
                Inactive
              </Badge>
            )}
            {bypassStatus === "error" && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            )}
          </div>
        </div>
        
        {/* Debug Information */}
        <div className="mt-4 max-w-md w-full">
          <details className="bg-gray-100 rounded-md p-3 text-xs">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Debug Information
            </summary>
            <pre className="mt-2 overflow-auto max-h-60 p-2 bg-gray-800 text-gray-100 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // If we've completed verification, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
