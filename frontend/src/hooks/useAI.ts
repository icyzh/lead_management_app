import { useState } from "react";
import { aiApi } from "../api/ai";

/**
 * Custom React Hook to manage AI note summarization state flow.
 */
export function useAI(leadId: string) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  // Calls the backend AI endpoint to fetch a summary draft
  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.summarize(leadId);
      setDraft(res.data.summary);
      setModel(res.data.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  // Resets state back to initial values
  const clearDraft = () => {
    setDraft(null);
    setError(null);
    setModel(null);
  };

  return { draft, setDraft, loading, error, model, generate, clearDraft };
}
