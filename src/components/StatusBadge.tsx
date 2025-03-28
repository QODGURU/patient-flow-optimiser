
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "contacted" | "interested" | "booked" | "cold";
  className?: string;
}

const statusMap = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300"
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-800 border-blue-300"
  },
  interested: {
    label: "Interested",
    className: "bg-purple-100 text-purple-800 border-purple-300"
  },
  booked: {
    label: "Booked",
    className: "bg-green-100 text-green-800 border-green-300"
  },
  cold: {
    label: "Cold",
    className: "bg-gray-100 text-gray-700 border-gray-300"
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { label, className: badgeClassName } = statusMap[status];
  
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
