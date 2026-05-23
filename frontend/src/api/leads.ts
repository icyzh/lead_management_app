import type { Lead, LeadStatus, ApiResponse } from "../types";

const BASE = import.meta.env.VITE_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const leadsApi = {
  list: async (params?: { search?: string; status?: string }): Promise<ApiResponse<Lead[]>> => {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
      ) as Record<string, string>
    );
    const res = await fetch(`${BASE}/api/leads?${query}`);
    return handleResponse(res);
  },

  get: async (id: string): Promise<ApiResponse<Lead>> => {
    const res = await fetch(`${BASE}/api/leads/${id}`);
    return handleResponse(res);
  },

  create: async (data: {
    name: string;
    email: string;
    company?: string;
    status?: LeadStatus;
  }): Promise<ApiResponse<Lead>> => {
    const res = await fetch(`${BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (
    id: string,
    data: Partial<{ name: string; email: string; company: string | null; status: LeadStatus }>
  ): Promise<ApiResponse<Lead>> => {
    const res = await fetch(`${BASE}/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${BASE}/api/leads/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
};
