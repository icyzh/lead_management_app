import type { Note, ApiResponse } from "../types";
import { apiFetch } from "./client";

const BASE = import.meta.env.VITE_API_URL;

export const notesApi = {
  list: async (leadId: string, signal?: AbortSignal): Promise<ApiResponse<Note[]>> => {
    return apiFetch(`${BASE}/api/notes/${leadId}`, { signal });
  },

  create: async (data: { leadId: string; content: string }): Promise<ApiResponse<Note>> => {
    return apiFetch(`${BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiFetch(`${BASE}/api/notes/${id}`, { method: "DELETE" });
  },
};
