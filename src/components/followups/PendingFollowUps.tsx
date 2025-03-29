
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowUpItem } from "./FollowUpItem";
import { Loader2 } from "lucide-react";

interface PendingFollowUpsProps {
  followUps: Array<{
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
  }>;
  isLoading?: boolean;
}

export const PendingFollowUps = ({ followUps, isLoading = false }: PendingFollowUpsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Responses</CardTitle>
        <CardDescription>
          Follow-ups that need further action
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : followUps.length > 0 ? (
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <FollowUpItem key={followUp.id} followUp={followUp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending follow-ups</p>
            <p className="text-sm text-gray-400 mt-1">
              All follow-ups have responses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
