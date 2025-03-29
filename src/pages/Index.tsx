
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Check, KeyRound, RefreshCw } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, bypassAuth } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<{ checked: boolean; success: boolean; error?: any }>({
    checked: false,
    success: false
  });
  const [bypassStatus, setBypassStatus] = useState<{ exists: boolean; valid: boolean; data: any | null }>({
    exists: false,
    valid: false,
    data: null
  });
  
  // Check Supabase connection and bypass status
  const checkConnections = async () => {
    // Check Supabase connection
    const result = await testSupabaseConnection();
    setConnectionStatus({
      checked: true,
      success: result.success,
      error: result.error
    });
    
    if (!result.success) {
      toast.error("Failed to connect to Supabase");
    }
    
    // Check bypass status
    const bypassData = localStorage.getItem("admin_bypass");
    if (bypassData) {
      try {
        const parsed = JSON.parse(bypassData);
        setBypassStatus({
          exists: true,
          valid: true,
          data: parsed
        });
      } catch (error) {
        setBypassStatus({
          exists: true,
          valid: false,
          data: null
        });
        localStorage.removeItem("admin_bypass");
        toast.error("Admin bypass data is corrupted and has been reset");
      }
    } else {
      setBypassStatus({
        exists: false,
        valid: false,
        data: null
      });
    }
  };
  
  useEffect(() => {
    checkConnections();
    
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
      await bypassAuth();
      toast.success("Admin bypass activated");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error bypassing auth:", error);
      toast.error("Failed to bypass authentication");
    }
  };

  const handleRefreshStatus = () => {
    checkConnections();
    toast.info("Refreshing connection status...");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Patient Flow Optimiser</h1>
        <p className="text-xl text-gray-600 mb-8">Loading application...</p>
        <div className="w-16 h-16 border-t-4 border-medical-teal border-solid rounded-full animate-spin mx-auto mb-8"></div>
        
        {/* Status panel */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">System Status</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshStatus}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Supabase Connection Status */}
            <div className={`p-4 rounded-md mb-4 ${connectionStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
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
            
            {/* Admin Bypass Status */}
            <div className={`p-4 rounded-md mb-4 ${
              bypassStatus.exists && bypassStatus.valid 
                ? 'bg-yellow-50 text-yellow-800' 
                : 'bg-gray-50 text-gray-800'
            }`}>
              <div className="flex items-start gap-3">
                <KeyRound className={`h-6 w-6 flex-shrink-0 ${
                  bypassStatus.exists && bypassStatus.valid 
                    ? 'text-yellow-500' 
                    : 'text-gray-500'
                }`} />
                <div>
                  <h3 className="font-semibold">
                    {bypassStatus.exists && bypassStatus.valid 
                      ? 'Admin Bypass Active' 
                      : 'Admin Bypass Inactive'}
                  </h3>
                  <p className="text-sm mt-1">
                    {bypassStatus.exists && bypassStatus.valid 
                      ? 'Admin bypass mode is currently active.'
                      : 'Admin bypass mode is not active. You can activate it for development.'}
                  </p>
                  {bypassStatus.exists && bypassStatus.valid && bypassStatus.data && (
                    <pre className="text-xs mt-2 p-2 bg-yellow-100 rounded overflow-auto max-h-32">
                      {JSON.stringify(bypassStatus.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
            
            {/* Authentication Status */}
            <div className={`p-4 rounded-md mb-4 ${
              isAuthenticated 
                ? 'bg-green-50 text-green-800' 
                : isLoading 
                  ? 'bg-blue-50 text-blue-800'
                  : 'bg-gray-50 text-gray-800'
            }`}>
              <div className="flex items-start gap-3">
                {isLoading ? (
                  <RefreshCw className="h-6 w-6 text-blue-500 flex-shrink-0 animate-spin" />
                ) : isAuthenticated ? (
                  <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {isLoading ? 'Checking Authentication' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </h3>
                  <p className="text-sm mt-1">
                    {isLoading 
                      ? 'Verifying authentication status...'
                      : isAuthenticated 
                        ? 'You are currently authenticated. Redirecting to dashboard...' 
                        : 'You are not authenticated. Redirecting to login...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="text-gray-700 w-full"
            onClick={handleBypassAuth}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Bypass Auth (Development)
          </Button>
          
          <Button 
            variant="default"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
