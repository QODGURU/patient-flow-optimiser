
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserRole } from "@/types";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<UserRole>("doctor");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password, activeTab);
      toast.success(`Welcome back!`);
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-light-blue p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-medical-navy">
            Patient Flow Optimiser
          </h1>
          <p className="text-gray-600 mt-2">
            Login to manage your patient follow-ups
          </p>
        </div>

        <Tabs defaultValue="doctor" className="w-full" onValueChange={(value) => setActiveTab(value as UserRole)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="doctor">Doctor</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader>
              <CardTitle>{activeTab === "doctor" ? "Doctor Login" : "Admin Login"}</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === "doctor" ? "doctor@example.com" : "admin@example.com"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-medical-teal hover:bg-teal-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </Tabs>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo credentials:</p>
          <p>Doctor: doctor@example.com / password123</p>
          <p>Admin: admin@example.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
