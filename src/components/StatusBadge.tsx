
import { PatientStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PatientStatus;
  className?: string;
}

const statusMap = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300"
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-medical-midnight-navy border-blue-300"
  },
  interested: {
    label: "Interested",
    className: "bg-purple-100 text-purple-800 border-purple-300"
  },
  booked: {
    label: "Interested",
    className: "bg-medical-radiant-aqua/20 text-medical-midnight-navy border-medical-radiant-aqua/40"
  },
  cold: {
    label: "Cold",
    className: "bg-gray-100 text-medical-graphite-grey border-gray-300"
  },
  "opt-out": {
    label: "Opt-out",
    className: "bg-medical-luxe-crimson/10 text-medical-luxe-crimson border-medical-luxe-crimson/30"
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { label, className: badgeClassName } = statusMap[status] || {
    label: status,
    className: "bg-gray-100 text-medical-graphite-grey border-gray-300"
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
