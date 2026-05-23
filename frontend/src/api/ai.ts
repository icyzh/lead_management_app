import type { SummarizeResult } from "../types";
import { apiFetch } from "./client";

const BASE = import.meta.env.VITE_API_URL;

export const aiApi = {
  summarize: async (leadId: string, signal?: AbortSignal): Promise<SummarizeResult> => {
    return apiFetch(`${BASE}/api/ai/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
      signal,
    });
  },
};
