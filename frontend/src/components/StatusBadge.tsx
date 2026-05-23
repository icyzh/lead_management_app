import { STATUS_LABELS } from "../types";
import type { LeadStatus } from "../types";

const styles: Record<LeadStatus, string> = {
  NEW:       "bg-amber-950 text-amber-400 border-amber-900",
  CONTACTED: "bg-blue-950 text-blue-400 border-blue-900",
  QUALIFIED: "bg-emerald-950 text-emerald-400 border-emerald-900",
  CLOSED:    "bg-purple-950 text-purple-400 border-purple-900",
};

interface Props {
  status: LeadStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
