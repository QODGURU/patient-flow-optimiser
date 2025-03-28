
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowUpItem } from "./FollowUpItem";
import { FollowUp } from "@/types";

interface PendingFollowUpsProps {
  followUps: Array<FollowUp & {
    patientName: string;
    clinicName: string;
    doctorId?: string;
  }>;
}

export const PendingFollowUps = ({ followUps }: PendingFollowUpsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Responses</CardTitle>
        <CardDescription>
          Follow-ups that need further action
        </CardDescription>
      </CardHeader>
      <CardContent>
        {followUps.length > 0 ? (
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
