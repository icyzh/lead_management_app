import type { Lead, LeadStatus, ApiResponse } from "../types";
import { apiFetch } from "./client";

const BASE = import.meta.env.VITE_API_URL;

export const leadsApi = {
  list: async (params?: { search?: string; status?: string }, signal?: AbortSignal): Promise<ApiResponse<Lead[]>> => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
      ) as Record<string, string>
    );
    return apiFetch(`${BASE}/api/leads?${query}`, { signal });
  },

  get: async (id: string, signal?: AbortSignal): Promise<ApiResponse<Lead>> => {
    return apiFetch(`${BASE}/api/leads/${id}`, { signal });
  },

  create: async (data: {
    name: string;
    email: string;
    company?: string;
    status?: LeadStatus;
  }): Promise<ApiResponse<Lead>> => {
    return apiFetch(`${BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<{ name: string; email: string; company: string | null; status: LeadStatus }>
  ): Promise<ApiResponse<Lead>> => {
    return apiFetch(`${BASE}/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiFetch(`${BASE}/api/leads/${id}`, { method: "DELETE" });
  },
};
