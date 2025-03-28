
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // We'll still use the auth context, but we'll ignore its actual state
  const { isLoading } = useAuth();

  // Simply render the children without any authentication checks
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Always render the children, bypassing all authentication checks
  return <>{children}</>;
};

export default ProtectedRoute;
