
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Phone, MessageSquare } from "lucide-react";

interface FollowUpItemProps {
  followUp: {
    id: string;
    patientName: string;
    clinicName: string;
    doctorId?: string;
    type: string;
    date: string;
    time: string;
    notes?: string;
    response: string | null;
    // For compatibility with both data structures
    patient_id?: string;
    patientId?: string;
  };
}

export const FollowUpItem = ({ followUp }: FollowUpItemProps) => {
  // Determine which ID to use for patient routing
  const patientRouteId = followUp.patientId || followUp.patient_id;

  return (
    <div
      key={followUp.id}
      className="border rounded-lg p-4 bg-gray-50"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <Link to={`/patients/${patientRouteId}`}>
            <h3 className="font-medium text-medical-navy hover:underline">
              {followUp.patientName}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">
            {followUp.clinicName}
          </p>
        </div>
        <div className="flex items-center">
          {followUp.type.toLowerCase().includes("call") ? (
            <div className="bg-yellow-100 p-2 rounded-full">
              <Phone className="h-4 w-4 text-yellow-700" />
            </div>
          ) : (
            <div className="bg-purple-100 p-2 rounded-full">
              <MessageSquare className="h-4 w-4 text-purple-700" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {followUp.date}
          <Clock className="h-3 w-3 ml-2 mr-1" />
          {followUp.time}
        </div>
        
        {followUp.response ? (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              followUp.response === "yes"
                ? "bg-green-100 text-green-800"
                : followUp.response === "no"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {followUp.response === "call_again"
              ? "Call Again"
              : followUp.response.charAt(0).toUpperCase() +
                followUp.response.slice(1)}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            No Response
          </span>
        )}
      </div>
      
      {followUp.notes && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm">{followUp.notes}</p>
        </div>
      )}
      
      <div className="mt-3 flex justify-end">
        <Link to={`/patients/${patientRouteId}`}>
          <Button variant="outline" size="sm">
            View Patient
          </Button>
        </Link>
      </div>
    </div>
  );
};
