
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard or login
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Patient Flow Optimiser</h1>
        <p className="text-xl text-gray-600 mb-8">Loading application...</p>
        <div className="w-16 h-16 border-t-4 border-medical-teal border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
