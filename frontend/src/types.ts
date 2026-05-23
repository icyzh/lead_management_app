export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
};

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
  _count?: { notes: number };
}

export interface Note {
  id: string;
  content: string;
  leadId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
}

export interface ApiError {
  error: string;
}
