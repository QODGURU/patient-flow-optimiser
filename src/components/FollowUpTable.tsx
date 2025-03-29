
import React from "react";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { FollowUp } from "@/types/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const FollowUpTable: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedFollowUpId, setSelectedFollowUpId] = React.useState<string | null>(null);
  const { profile } = useAuth();

  const { data: followUps, loading, error, refetch } = useSupabaseQuery<FollowUp>(
    "follow_ups",
    {
      filters: { patient_id: patientId },
      orderBy: { column: "date", ascending: false },
      enabled: !!patientId,
    }
  );

  const { remove, loading: removeLoading } = useMutateSupabase();

  const handleDeleteClick = (id: string) => {
    setSelectedFollowUpId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFollowUpId) return;

    try {
      await remove("follow_ups", selectedFollowUpId);
      toast.success("Follow-up deleted successfully");
      refetch();
    } catch (error) {
      // Error handling is done in the mutation hook
    } finally {
      setDeleteDialogOpen(false);
      setSelectedFollowUpId(null);
    }
  };

  if (loading) {
    return <div>Loading follow-ups...</div>;
  }

  if (error) {
    return <div>Error loading follow-ups: {error.message}</div>;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Follow-Ups</CardTitle>
        <CardDescription>Past and scheduled follow-ups for this patient</CardDescription>
      </CardHeader>
      <CardContent>
        {followUps && followUps.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.map((followUp) => (
                <TableRow key={followUp.id}>
                  <TableCell className="font-medium">{followUp.type}</TableCell>
                  <TableCell>{format(new Date(followUp.date), "PPP")}</TableCell>
                  <TableCell>{followUp.time}</TableCell>
                  <TableCell>{followUp.notes || "N/A"}</TableCell>
                  <TableCell>{followUp.response || "No response yet"}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(followUp.id)}
                      className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/90"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">No follow-ups found for this patient</div>
        )}
      </CardContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#101B4C]">Delete Follow-Up</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this follow-up? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={removeLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={removeLoading}
              className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/90"
            >
              {removeLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
