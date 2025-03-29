
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MergedFollowUp } from "@/types/followUp";

interface FollowUpItemProps {
  followUp: MergedFollowUp;
}

export const FollowUpItem = ({ followUp }: FollowUpItemProps) => {
  const { profile } = useAuth();
  
  // Format the date to relative time
  const timeAgo = followUp.created_at 
    ? formatDistanceToNow(new Date(followUp.created_at), { addSuffix: true })
    : "recently";
  
  // Check if the follow-up was created by the current user
  const isCreatedByCurrentUser = followUp.created_by === profile?.id;
  
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{followUp.patientName}</h4>
            <Badge variant={followUp.type === "call" ? "default" : "secondary"} className="text-xs">
              {followUp.type === "call" ? (
                <Phone className="h-3 w-3 mr-1" />
              ) : (
                <MessageCircle className="h-3 w-3 mr-1" />
              )}
              {followUp.type}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">{followUp.clinicName}</p>
          {followUp.notes && (
            <p className="mt-2 text-sm text-gray-600">{followUp.notes}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{timeAgo}</p>
          {followUp.response ? (
            <Badge 
              variant={
                followUp.response === "interested" ? "success" : 
                followUp.response === "not_interested" ? "destructive" : 
                "outline"
              }
              className="mt-1"
            >
              {followUp.response}
            </Badge>
          ) : (
            <Badge variant="outline" className="mt-1">pending</Badge>
          )}
        </div>
      </div>
    </div>
  );
};
