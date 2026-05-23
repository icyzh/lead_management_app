import type { Note, ApiResponse } from "../types";

const BASE = import.meta.env.VITE_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const notesApi = {
  list: async (leadId: string): Promise<ApiResponse<Note[]>> => {
    const res = await fetch(`${BASE}/api/notes/${leadId}`);
    return handleResponse(res);
  },

  create: async (data: { leadId: string; content: string }): Promise<ApiResponse<Note>> => {
    const res = await fetch(`${BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${BASE}/api/notes/${id}`, { method: "DELETE" });
    return handleResponse(res);
  },
};
