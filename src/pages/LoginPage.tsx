
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
      toast.success(`Welcome back!`);
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Failed to login");
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
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#101B4C] to-[#00FFC8] hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
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
              >
                <span className="font-semibold">Admin User</span>
                <span className="text-xs">admin@example.com</span>
              </Button>
              <Button 
                variant="outline" 
                className="border-[#101B4C] text-[#101B4C] flex justify-between items-center"
                onClick={() => setDemoCredentials('doctor')}
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
      </div>
    </div>
  );
};

export default LoginPage;
