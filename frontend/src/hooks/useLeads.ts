import { useState, useEffect, useCallback, useRef } from "react";
import type { Lead } from "../types";
import { leadsApi } from "../api/leads";

export function useLeads(search?: string, status?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await leadsApi.list({ search, status }, controller.signal);
      if (!controller.signal.aborted) setLeads(res.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { leads, loading, error, refetch: fetch };
}
