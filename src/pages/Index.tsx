
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Check } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<{ checked: boolean; success: boolean; error?: any }>({
    checked: false,
    success: false
  });
  
  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      const result = await testSupabaseConnection();
      setConnectionStatus({
        checked: true,
        success: result.success,
        error: result.error
      });
      
      if (!result.success) {
        toast.error("Failed to connect to Supabase");
      }
    };
    
    checkConnection();
    
    // Only redirect after auth check is complete
    if (!isLoading) {
      console.log("Index page - Auth state:", { isAuthenticated, isLoading });
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [navigate, isAuthenticated, isLoading]);

  const handleBypassAuth = async () => {
    try {
      // For development only
      console.log("Bypassing authentication");
      // Create a mock admin user
      const mockUser = {
        id: "mock-admin-id",
        email: "admin@example.com",
        role: "admin"
      };
      localStorage.setItem("admin_bypass", JSON.stringify(mockUser));
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error bypassing auth:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Patient Flow Optimiser</h1>
        <p className="text-xl text-gray-600 mb-8">Loading application...</p>
        <div className="w-16 h-16 border-t-4 border-medical-teal border-solid rounded-full animate-spin mx-auto mb-8"></div>
        
        {connectionStatus.checked && (
          <div className={`p-4 rounded-md mb-6 ${connectionStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-start gap-3">
              {connectionStatus.success ? (
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-semibold">
                  {connectionStatus.success ? 'Connected to Supabase' : 'Connection Error'}
                </h3>
                <p className="text-sm mt-1">
                  {connectionStatus.success 
                    ? 'Successfully connected to the Supabase backend.'
                    : 'Failed to connect to Supabase. Please check your configuration.'}
                </p>
                {connectionStatus.error && (
                  <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                    {JSON.stringify(connectionStatus.error, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button 
            variant="outline" 
            className="text-gray-700"
            onClick={handleBypassAuth}
          >
            Bypass Auth (Development)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
