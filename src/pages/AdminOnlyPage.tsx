
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const AdminOnlyPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-medical-navy p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl">Admin Only Area</CardTitle>
          <CardDescription>
            This page is restricted to administrators only
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Welcome, <span className="font-bold">{user?.name}</span>
          </p>
          <p className="text-gray-600">
            As an administrator, you have access to all areas of the system including
            doctor management, analytics, and system settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOnlyPage;
