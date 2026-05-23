import { useState, useEffect, useCallback } from "react";
import type { Lead } from "../types";
import { leadsApi } from "../api/leads";

export function useLeads(search?: string, status?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadsApi.list({ search, status });
      setLeads(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { leads, loading, error, refetch: fetch };
}
