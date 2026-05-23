import { useState, useEffect, useCallback, useRef } from "react";
import type { Note } from "../types";
import { notesApi } from "../api/notes";

export function useNotes(leadId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNotes = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await notesApi.list(leadId, controller.signal);
      if (!controller.signal.aborted) setNotes(res.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) fetchNotes();
    return () => abortRef.current?.abort();
  }, [fetchNotes]);

  const addNote = async (content: string) => {
    setSubmitting(true);
    try {
      const res = await notesApi.create({ leadId, content });
      setNotes((prev) => [...prev, res.data]);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    await notesApi.delete(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return { notes, loading, error, submitting, addNote, deleteNote, refetch: fetchNotes };
}
