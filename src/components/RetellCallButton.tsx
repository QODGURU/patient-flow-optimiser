
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { retellClient } from "@/integrations/retell/client";
import { Patient } from "@/types/supabase";

interface RetellCallButtonProps {
  patient: Patient;
  onCallInitiated?: (callId: string) => void;
}

export const RetellCallButton = ({ patient, onCallInitiated }: RetellCallButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInitiateCall = async () => {
    try {
      setIsLoading(true);

      // Validate patient data before making the call
      if (!patient.phone) {
        toast.error("Patient phone number is required to make a call");
        setIsLoading(false);
        return;
      }

      // Generate webhook URL based on current domain
      const domain = window.location.origin;
      const webhookUrl = `${domain}/api/retell-webhook?patient_id=${patient.id}`;

      // Initiate the call
      const callId = await retellClient.setupAndCall(patient, webhookUrl);
      
      // Update patient with call info in localStorage if using demo data
      const demoPatients = localStorage.getItem("demo_patients");
      if (demoPatients) {
        try {
          const parsedPatients = JSON.parse(demoPatients);
          const updatedPatients = parsedPatients.map((p: Patient) => {
            if (String(p.id) === String(patient.id)) {
              return {
                ...p,
                voip_call_id: callId,
                voip_call_status: 'initiated',
                voip_call_timestamp: new Date().toISOString(),
                call_attempts: (p.call_attempts || 0) + 1,
              };
            }
            return p;
          });
          
          localStorage.setItem("demo_patients", JSON.stringify(updatedPatients));
        } catch (error) {
          console.error("Error updating demo patient with call info:", error);
        }
      }

      // Notify parent component
      if (onCallInitiated) {
        onCallInitiated(callId);
      }

      toast.success("AI call initiated successfully");
    } catch (error) {
      console.error("Error initiating AI call:", error);
      toast.error("Failed to initiate AI call. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInitiateCall}
      disabled={isLoading || !patient.phone}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Phone className="mr-2 h-4 w-4" />
      {isLoading ? "Initiating call..." : "Call with AI Assistant"}
    </Button>
  );
};
