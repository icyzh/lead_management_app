const BASE = import.meta.env.VITE_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export interface SummarizeResult {
  data: {
    summary: string;
    model: string;
    notesCount: number;
    leadName: string;
  };
}

export const aiApi = {
  summarize: async (leadId: string): Promise<SummarizeResult> => {
    const res = await fetch(`${BASE}/api/ai/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    return handleResponse(res);
  },
};
