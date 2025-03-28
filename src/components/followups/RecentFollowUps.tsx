
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowUpItem } from "./FollowUpItem";
import { FollowUp } from "@/types";

interface RecentFollowUpsProps {
  followUps: Array<FollowUp & {
    patientName: string;
    clinicName: string;
    doctorId?: string;
  }>;
}

export const RecentFollowUps = ({ followUps }: RecentFollowUpsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Follow-ups</CardTitle>
        <CardDescription>Latest communications with patients</CardDescription>
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
            <p className="text-gray-500">No follow-ups found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try changing your filters or add new follow-ups
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
