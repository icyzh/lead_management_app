import { useState, useRef, useEffect } from "react";
import type { Note } from "../types";
import { LoadingSpinner, InlineSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

interface Props {
  notes: Note[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addNote: (content: string) => Promise<boolean>;
  deleteNote: (id: string) => Promise<void>;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NoteItem({ note, onDelete }: { note: Note; onDelete: (id: string) => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try { await onDelete(note.id); } catch { setDeleteError("Failed to delete note"); } finally { setDeleting(false); }
  };

  return (
    <div className="group flex gap-4 pb-5">
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-0.5" />
        <div className="w-px flex-1 bg-zinc-800 mt-1.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-600">{formatDate(note.createdAt)}</span>
          {deleteError && <span className="text-xs text-red-400 mr-2">{deleteError}</span>}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            {deleting ? <InlineSpinner /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesList({ notes, loading, error, submitting, addNote, deleteNote }: Props) {
  const [content, setContent] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleAdd = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setAddError(null);
    try { await addNote(trimmed); setContent(""); }
    catch (err) { setAddError(err instanceof Error ? err.message : "Failed to add note"); }
  };

  return (
    <div>
      <div className="card p-4 mb-6">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleAdd(); } }}
          placeholder="Add a note… (Ctrl+Enter to submit)"
          rows={3}
          className="input resize-none mb-3 block overflow-hidden"
        />
        {addError && <p className="text-xs text-red-400 mb-2">{addError}</p>}
        <div className="flex justify-end">
          <button onClick={handleAdd} disabled={!content.trim() || submitting} className="btn-primary">
            {submitting ? <InlineSpinner /> : null}
            Add Note
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner size="sm" /> :
        error ? <p className="text-sm text-red-400">{error}</p> :
        notes.length === 0 ? (
          <EmptyState message="No notes yet" description="Add notes to track activity for this lead." />
        ) : (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wide mb-4">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </p>
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} onDelete={deleteNote} />
            ))}
          </div>
        )
      }
    </div>
  );
}
