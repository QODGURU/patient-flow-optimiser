
import { Button } from "@/components/ui/button";
import { Database, Trash2 } from "lucide-react";
import { useState } from "react";
import { generateDemoData, clearDemoData } from "@/utils/demoDataGenerator";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { Patient } from "@/types/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DemoDataButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Check if we already have data
  const { data: patients } = useSupabaseQuery<Patient>("patients", {
    limit: 1,
  });
  
  const hasData = patients.length > 0;
  
  const handleGenerateData = async () => {
    setIsGenerating(true);
    try {
      await generateDemoData();
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearDemoData();
    } finally {
      setIsClearing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleGenerateData}
              disabled={isGenerating || hasData}
            >
              <Database className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Demo Data"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasData 
              ? "Demo data already exists" 
              : "Generate 30+ patients and follow-ups"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {hasData && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? "Clearing..." : "Clear Data"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all patients and follow-ups in the database. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                Delete All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
