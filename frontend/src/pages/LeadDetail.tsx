import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Lead, LeadStatus } from "../types";
import { leadsApi } from "../api/leads";
import { StatusBadge } from "../components/StatusBadge";
import { NotesList } from "../components/NotesList";
import { AIEditor } from "../components/AIEditor";
import { LoadingSpinner } from "../components/LoadingSpinner";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "ai">("notes");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    leadsApi.get(id)
      .then((res) => setLead(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error || !lead) {
    return (
      <div className="max-w-sm">
        <p className="text-sm text-red-400 mb-4">{error || "Lead not found"}</p>
        <Link to="/" className="btn-secondary">Back to Leads</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-6">
        <Link to="/" className="hover:text-zinc-400 transition-colors no-underline">Leads</Link>
        <span>/</span>
        <span className="text-zinc-400">{lead.name}</span>
      </div>

      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">{lead.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{lead.email}</p>
            {lead.company && <p className="text-xs text-zinc-600 mt-0.5">{lead.company}</p>}
            <div className="mt-3">
              <StatusBadge status={lead.status as LeadStatus} />
            </div>
          </div>
          <Link to={`/leads/${lead.id}/edit`} className="btn-secondary shrink-0">
            Edit
          </Link>
        </div>

        <hr className="divider mt-4 mb-4" />

        <div className="flex gap-6 text-xs">
          <div>
            <p className="text-zinc-600 mb-0.5">Created</p>
            <p className="text-zinc-400">{formatDate(lead.createdAt)}</p>
          </div>
          <div>
            <p className="text-zinc-600 mb-0.5">Updated</p>
            <p className="text-zinc-400">{formatDate(lead.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-zinc-800 mb-5">
        {(["notes", "ai"] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 -mb-px border-b-2 ${
              activeTab === tab
                ? "text-zinc-100 border-indigo-500"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            {tab === "notes" ? "Notes" : "AI Summary"}
          </button>
        ))}
      </div>

      {activeTab === "notes" ? <NotesList leadId={lead.id} /> : <AIEditor leadId={lead.id} notesCount={lead.notes?.length ?? 0} />}
    </div>
  );
}
