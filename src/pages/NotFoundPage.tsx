
import { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPatientRoute = location.pathname.startsWith('/patients/');

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {isPatientRoute ? (
          <div>
            <div className="mb-6">
              <Button variant="ghost" onClick={() => navigate("/patients")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
              </Button>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Patient Not Found</h1>
                <p className="text-gray-600 mb-8">
                  The patient you're looking for could not be found. It may have been deleted or you may have an incorrect link.
                </p>
                <Button 
                  onClick={() => navigate("/patients")}
                  className="bg-medical-teal hover:bg-teal-600">
                  Return to Patient List
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <h1 className="text-6xl font-bold text-medical-navy mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
              <Button className="bg-medical-teal hover:bg-teal-600">
                <Home className="mr-2 h-4 w-4" /> Return to Dashboard
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
