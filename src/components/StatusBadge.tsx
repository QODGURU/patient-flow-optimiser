
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  Pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300"
  },
  Contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-800 border-blue-300"
  },
  Interested: {
    label: "Interested",
    className: "bg-purple-100 text-purple-800 border-purple-300"
  },
  Booked: {
    label: "Booked",
    className: "bg-green-100 text-green-800 border-green-300"
  },
  Cold: {
    label: "Cold",
    className: "bg-gray-100 text-gray-700 border-gray-300"
  },
  "Not Interested": {
    label: "Not Interested",
    className: "bg-red-100 text-red-800 border-red-300"
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { label, className: badgeClassName } = statusMap[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-300"
  };
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 text-xs font-medium rounded-full border",
      badgeClassName,
      className
    )}>
      {label}
    </span>
  );
};

export default StatusBadge;
