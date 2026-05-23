import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLeads } from "../hooks/useLeads";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { LEAD_STATUSES, STATUS_LABELS } from "../types";
import type { Lead, LeadStatus } from "../types";
import { leadsApi } from "../api/leads";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LeadsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { leads, loading, error, refetch } = useLeads(debouncedSearch, status);

  const handleDelete = async (e: React.MouseEvent, lead: Lead) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Delete "${lead.name}"?`)) return;
    setDeletingId(lead.id);
    try { await leadsApi.delete(lead.id); refetch(); }
    catch { alert("Failed to delete lead"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Leads</h1>
          {!loading && (
            <p className="text-xs text-zinc-600 mt-0.5">
              {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link to="/leads/new" className="btn-primary">New Lead</Link>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          id="search-leads"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input"
        />
        <select
          id="filter-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input w-44 shrink-0"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-900 rounded-md px-4 py-2 mb-4">{error}</p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : leads.length === 0 ? (
        <EmptyState
          message={debouncedSearch || status ? "No leads match your search" : "No leads yet"}
          description={debouncedSearch || status ? "Try a different filter" : "Create your first lead to get started"}
          action={!debouncedSearch && !status ? (
            <Link to="/leads/new" className="btn-primary">Create lead</Link>
          ) : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="cursor-pointer hover:bg-zinc-800/40 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-zinc-200">{lead.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 hidden sm:table-cell">
                    {lead.company || <span className="text-zinc-700">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status as LeadStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 hidden md:table-cell">
                    {lead._count?.notes ?? 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-700 hidden lg:table-cell">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/leads/${lead.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-ghost text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, lead)}
                        disabled={deletingId === lead.id}
                        className="btn-danger text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
