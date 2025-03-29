
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AlertCircle, Check, Database, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, bypassAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<{ 
    checked: boolean;
    success: boolean;
    message: string;
    error: any; 
  }>({
    checked: false,
    success: false,
    message: "Checking connection...",
    error: null
  });
  const [testing, setTesting] = useState(false);

  // Check Supabase connection on load
  useEffect(() => {
    checkConnection();
  }, []);

  // Function to test Supabase connection
  const checkConnection = async () => {
    setTesting(true);
    try {
      console.log("Testing Supabase connection...");
      const result = await testSupabaseConnection();
      console.log("Connection test result:", result);
      
      setConnectionStatus({
        checked: true,
        success: result.success,
        message: result.success ? "Connected to Supabase" : "Failed to connect to Supabase",
        error: result.error
      });
      
      if (!result.success) {
        console.error("Connection test failed:", result.error);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionStatus({
        checked: true,
        success: false,
        message: "Error testing connection",
        error
      });
    } finally {
      setTesting(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    if (!connectionStatus.success) {
      setError("Cannot login: Supabase connection is not available");
      return;
    }
    
    try {
      console.log("Attempting login for:", email);
      await login(email, password);
      // Navigation is handled by the useEffect above when isAuthenticated changes
    } catch (error: any) {
      // More specific error handling
      const errorMsg = error.message || "Failed to login";
      if (errorMsg.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else {
        setError(errorMsg);
      }
      console.error("Login error:", error);
    }
  };

  const setDemoCredentials = (type: 'admin' | 'doctor') => {
    if (type === 'admin') {
      setEmail("admin@example.com");
      setPassword("password123");
    } else {
      setEmail("doctor@example.com");
      setPassword("password123");
    }
  };

  const handleBypass = async () => {
    if (!connectionStatus.success) {
      setError("Cannot bypass: Supabase connection is not available");
      toast.error("Connection to Supabase is required for bypass authentication");
      return;
    }
    
    try {
      console.log("Attempting auth bypass");
      await bypassAuth();
      toast.success("Admin bypass successful");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Bypass error:", error);
      setError(`Bypass failed: ${error.message || "Unknown error"}`);
      toast.error(`Admin bypass failed: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#101B4C]">
            Patient Flow Optimiser
          </h1>
          <p className="text-[#2B2E33] mt-2">
            Login to manage your patient follow-ups
          </p>
        </div>

        {/* Connection Status Indicator */}
        <div className={`mb-4 p-3 rounded-md flex items-center gap-3 ${
          connectionStatus.success 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {testing ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : connectionStatus.success ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">
              {testing ? "Testing connection..." : connectionStatus.message}
            </p>
            {!connectionStatus.success && connectionStatus.checked && !testing && (
              <p className="text-xs mt-1">
                Supabase connection is required for authentication
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 px-2" 
            onClick={checkConnection}
            disabled={testing}
          >
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Card className="border-[#101B4C]/10 mb-6">
          <CardHeader>
            <CardTitle className="text-[#101B4C]">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  className="border-[#2B2E33]/20 focus-visible:ring-[#00FFC8]"
                  disabled={!connectionStatus.success && connectionStatus.checked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="border-[#2B2E33]/20 focus-visible:ring-[#00FFC8]"
                  disabled={!connectionStatus.success && connectionStatus.checked}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
                disabled={isLoading || (!connectionStatus.success && connectionStatus.checked)}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="w-full">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-[#101B4C] text-[#101B4C]"
                  onClick={handleBypass}
                  disabled={isLoading || (!connectionStatus.success && connectionStatus.checked)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Admin Bypass (Development)
                </Button>
                
                <div className="text-xs text-center mt-2 text-gray-500">
                  {connectionStatus.success ? 
                    "Use this option to bypass regular authentication" :
                    "Connection required for admin bypass"
                  }
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-[#101B4C]/10">
          <CardHeader>
            <CardTitle className="text-[#101B4C] text-lg">Demo Credentials</CardTitle>
            <CardDescription>
              Use these options to quickly login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="border-[#101B4C] text-[#101B4C] flex justify-between items-center"
                onClick={() => setDemoCredentials('admin')}
                disabled={!connectionStatus.success && connectionStatus.checked}
              >
                <span className="font-semibold">Admin User</span>
                <span className="text-xs">admin@example.com</span>
              </Button>
              <Button 
                variant="outline" 
                className="border-[#101B4C] text-[#101B4C] flex justify-between items-center"
                onClick={() => setDemoCredentials('doctor')}
                disabled={!connectionStatus.success && connectionStatus.checked}
              >
                <span className="font-semibold">Doctor User</span>
                <span className="text-xs">doctor@example.com</span>
              </Button>
            </div>
            <p className="text-xs text-center text-[#2B2E33]/80">
              Password for both accounts: <span className="font-mono bg-[#F0F0F0] px-1 py-0.5 rounded">password123</span>
            </p>
          </CardContent>
        </Card>
        
        {/* Debug Panel */}
        <div className="mt-6">
          <details className="bg-gray-100 rounded-md p-3 text-xs">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Connection Debug Info
            </summary>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="font-medium">Connection Status:</div>
                <div>
                  {connectionStatus.checked ? (
                    connectionStatus.success ? (
                      <Badge variant="default" className="bg-green-500 text-white">Connected</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )
                  ) : (
                    <Badge variant="outline">Checking...</Badge>
                  )}
                </div>
                
                <div className="font-medium">Auth Status:</div>
                <div>
                  {isAuthenticated ? (
                    <Badge variant="default" className="bg-green-500 text-white">Authenticated</Badge>
                  ) : (
                    <Badge variant="secondary">Not Authenticated</Badge>
                  )}
                </div>
                
                <div className="font-medium">Loading:</div>
                <div>{isLoading ? "Yes" : "No"}</div>
              </div>
              
              {connectionStatus.error && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Error Details:</div>
                  <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(connectionStatus.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
