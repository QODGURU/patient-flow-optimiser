
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FollowUpFiltersProps {
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  responseFilter: string;
  setResponseFilter: (value: string) => void;
}

export const FollowUpFilters = ({
  typeFilter,
  setTypeFilter,
  responseFilter,
  setResponseFilter,
}: FollowUpFiltersProps) => {
  return (
    <div className="flex gap-2">
      <Select
        value={typeFilter}
        onValueChange={setTypeFilter}
      >
        <SelectTrigger className="w-40">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <span>Type</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="call">Calls</SelectItem>
          <SelectItem value="message">Messages</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={responseFilter}
        onValueChange={setResponseFilter}
      >
        <SelectTrigger className="w-40">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <span>Response</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Responses</SelectItem>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
          <SelectItem value="maybe">Maybe</SelectItem>
          <SelectItem value="call_again">Call Again</SelectItem>
          <SelectItem value={null}>No Response</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
