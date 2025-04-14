
import React, { useState, useEffect } from "react";
import { FollowUp } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSupabaseQuery, useMutateSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const FollowUpTable = ({ patientId }: { patientId: string | undefined }) => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("call");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [demoFollowUps, setDemoFollowUps] = useState<FollowUp[]>([]);
  
  // Debug the patientId prop
  useEffect(() => {
    console.log("FollowUpTable - patientId prop:", patientId, typeof patientId);
    if (!patientId) {
      console.error("FollowUpTable: No patientId provided");
    }
  }, [patientId]);

  useEffect(() => {
    // Only try to fetch follow-ups if we have a patientId
    if (!patientId) return;
    
    const storedFollowUps = localStorage.getItem("demo_follow_ups");
    if (storedFollowUps) {
      try {
        const parsedFollowUps = JSON.parse(storedFollowUps);
        
        // Debug the demo follow-ups and patient ID matching
        console.log("Available follow-ups in demo data:", parsedFollowUps);
        console.log("Looking for patient with ID:", patientId, "type:", typeof patientId);
        
        // Ensure consistent string comparison
        const patientFollowUps = parsedFollowUps.filter((f: FollowUp) => 
          String(f.patient_id) === String(patientId)
        );
        
        console.log(`Filtered follow-ups for patient ${patientId}:`, patientFollowUps);
        setDemoFollowUps(patientFollowUps);
      } catch (error) {
        console.error("Error parsing demo follow-ups:", error);
      }
    }
  }, [patientId]);

  // Get follow-ups from Supabase only if we have a patientId and no demo data
  const { data: followUps, loading, error, refetch } = useSupabaseQuery<FollowUp>(
    "follow_ups",
    {
      filters: { patient_id: patientId },
      enabled: !!patientId && demoFollowUps.length === 0,
    }
  );

  const { insert } = useMutateSupabase();

  const handleAddFollowUp = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!patientId) {
      toast.error("Patient ID is required");
      return;
    }

    try {
      // Format date as ISO string for the date part
      const formattedDate = format(date, "yyyy-MM-dd");
      
      const newFollowUp = {
        patient_id: patientId,
        type,
        date: formattedDate,
        time,
        notes,
        created_by: profile?.id,
      };

      console.log("Adding new follow-up:", newFollowUp);

      // If we have demo data, add to localStorage
      const storedFollowUps = localStorage.getItem("demo_follow_ups");
      if (storedFollowUps) {
        try {
          const parsedFollowUps = JSON.parse(storedFollowUps);
          const newId = `demo-${Math.random().toString(36).substring(2, 9)}`;
          const newDemoFollowUp = {
            ...newFollowUp,
            id: newId,
            created_at: new Date().toISOString()
          };
          
          const updatedFollowUps = [...parsedFollowUps, newDemoFollowUp];
          localStorage.setItem("demo_follow_ups", JSON.stringify(updatedFollowUps));
          
          // Update state
          setDemoFollowUps([...demoFollowUps, newDemoFollowUp]);
          toast.success("Follow-up added successfully");
          setOpen(false);
          resetForm();
          return;
        } catch (error) {
          console.error("Error adding demo follow-up:", error);
        }
      }
      
      // If no demo data or error, try Supabase
      await insert("follow_ups", newFollowUp);
      toast.success("Follow-up added successfully");
      refetch();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding follow-up:", error);
      toast.error("Error adding follow-up");
    }
  };

  const resetForm = () => {
    setType("call");
    setDate(new Date());
    setTime("09:00");
    setNotes("");
  };

  const displayedFollowUps = demoFollowUps.length > 0 ? demoFollowUps : followUps || [];

  if (!patientId) {
    return null; // Don't render anything if there's no patientId
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Follow-ups</CardTitle>
            <CardDescription>Schedule and track follow-ups for this patient</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-teal hover:bg-teal-600">Add Follow-up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Follow-up</DialogTitle>
                <DialogDescription>
                  Schedule a new follow-up for this patient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this follow-up"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-medical-teal hover:bg-teal-600"
                  onClick={handleAddFollowUp}
                >
                  Add Follow-up
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-4">Loading follow-ups...</div>
          ) : displayedFollowUps.length > 0 ? (
            <div className="space-y-4">
              {displayedFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="border rounded-md p-4 hover:bg-slate-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {followUp.type.charAt(0).toUpperCase() + followUp.type.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(followUp.date).toLocaleDateString()} at {followUp.time}
                      </div>
                      {followUp.notes && (
                        <div className="mt-2 text-sm">{followUp.notes}</div>
                      )}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          followUp.response
                            ? followUp.response === "yes"
                              ? "bg-green-100 text-green-800"
                              : followUp.response === "no"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {followUp.response
                          ? followUp.response.charAt(0).toUpperCase() +
                            followUp.response.slice(1)
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No follow-ups scheduled yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
