import { useState } from "react";
import { useAI } from "../hooks/useAI";
import { useNotes } from "../hooks/useNotes";
import { InlineSpinner } from "./LoadingSpinner";

interface Props { leadId: string }

/**
 * AIEditor Component
 * Allows generating a notes summary draft, editing it, and explicitly saving it as a note.
 */
export function AIEditor({ leadId }: Props) {
  const { draft, setDraft, loading, error, generate, clearDraft } = useAI(leadId);
  const { notes, addNote } = useNotes(leadId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Saves the edited draft to the database as a note prefixing it with [AI Summary]
  const handleSave = async () => {
    if (!draft?.trim()) return;
    setSaving(true); setSaveError(null);
    try {
      await addNote(`[AI Summary]\n${draft.trim()}`);
      setSaved(true);
      // Wait for success animation state then clear the draft
      setTimeout(() => { setSaved(false); clearDraft(); }, 1800);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-zinc-100">note summary</p>
          <p className="text-xs text-zinc-600 mt-0.5">summarize notes</p>
        </div>
        {!draft && !loading && (
          <button
            onClick={generate}
            disabled={loading || notes.length === 0}
            title={notes.length === 0 ? "Add notes first" : ""}
            className="btn-secondary"
          >
            Generate
          </button>
        )}
      </div>

      {notes.length === 0 && !draft && !loading && (
        <p className="text-xs text-zinc-600 bg-zinc-800 rounded-md px-3 py-2">
          Add notes to this lead first before generating a summary.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin shrink-0" />
          <span className="text-sm text-zinc-500">Generating summary…</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-red-400 bg-red-950 border border-red-900 rounded-md px-3 py-2">{error}</p>
      )}

      {draft !== null && !loading && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label !mb-0">Edit before saving</label>
            <button onClick={clearDraft} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Discard
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={7}
            className="input block resize-y mb-2 text-sm leading-relaxed"
          />
          <p className="text-xs text-zinc-700 mb-3">
            Review and edit this draft. It will be saved as a note — not auto-saved.
          </p>
          {saveError && <p className="text-xs text-red-400 mb-2">{saveError}</p>}
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving || saved || !draft.trim()} className="btn-primary">
              {saving ? <><InlineSpinner /> Saving…</> : saved ? "Saved!" : "Save as Note"}
            </button>
            <button onClick={generate} disabled={loading} className="btn-secondary">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
