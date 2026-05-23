import { useState, useEffect, useCallback } from "react";
import type { Note } from "../types";
import { notesApi } from "../api/notes";

export function useNotes(leadId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notesApi.list(leadId);
      setNotes(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) fetchNotes();
  }, [fetchNotes, leadId]);

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
    try {
      await notesApi.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      throw err;
    }
  };

  return { notes, loading, error, submitting, addNote, deleteNote, refetch: fetchNotes };
}
