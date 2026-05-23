import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { leadsApi } from "../api/leads";
import { LEAD_STATUSES, STATUS_LABELS } from "../types";
import type { LeadStatus } from "../types";
import { InlineSpinner, LoadingSpinner } from "../components/LoadingSpinner";

interface FormData { name: string; email: string; company: string; status: LeadStatus }

export function LeadForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>({ name: "", email: "", company: "", status: "NEW" });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    leadsApi.get(id)
      .then((res) => {
        const { name, email, company, status } = res.data;
        setForm({ name, email, company: company || "", status: status as LeadStatus });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        status: form.status,
      };
      if (isEdit && id) {
        await leadsApi.update(id, payload);
        navigate(`/leads/${id}`);
      } else {
        const res = await leadsApi.create(payload);
        navigate(`/leads/${res.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-6">
        <Link to="/" className="hover:text-zinc-400 transition-colors no-underline">Leads</Link>
        <span>/</span>
        <span className="text-zinc-400">{isEdit ? "Edit" : "New Lead"}</span>
      </div>

      <div className="card p-6">
        <h1 className="page-title mb-6">{isEdit ? "Edit Lead" : "New Lead"}</h1>

        {error && (
          <p className="text-xs text-red-400 bg-red-950 border border-red-900 rounded-md px-3 py-2 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Name *</label>
            <input id="name" name="name" type="text" value={form.name}
              onChange={handleChange} required placeholder="Jane Smith" className="input" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email *</label>
            <input id="email" name="email" type="email" value={form.email}
              onChange={handleChange} required placeholder="jane@example.com" className="input" />
          </div>
          <div>
            <label htmlFor="company" className="label">
              Company <span className="normal-case tracking-normal text-zinc-700">(optional)</span>
            </label>
            <input id="company" name="company" type="text" value={form.company}
              onChange={handleChange} placeholder="Acme Corp" className="input" />
          </div>
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" value={form.status}
              onChange={handleChange} className="input">
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          <hr className="divider !mt-6" />

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting || !form.name.trim() || !form.email.trim()}
              className="btn-primary flex-1"
            >
              {submitting ? <><InlineSpinner /> {isEdit ? "Saving…" : "Creating…"}</> :
                (isEdit ? "Save Changes" : "Create Lead")}
            </button>
            <Link to={isEdit && id ? `/leads/${id}` : "/"} className="btn-secondary flex-1">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
