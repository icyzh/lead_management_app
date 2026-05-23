import { useState, useRef } from "react";
import { aiApi } from "../api/ai";

export function useAI(leadId: string) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.summarize(leadId, controller.signal);
      if (!controller.signal.aborted) {
        setDraft(res.data.summary);
        setModel(res.data.model);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const clearDraft = () => {
    setDraft(null);
    setError(null);
    setModel(null);
  };

  return { draft, setDraft, loading, error, model, generate, clearDraft };
}
