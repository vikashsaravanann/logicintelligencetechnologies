"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import {
  FileSignature,
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  User,
  DollarSign,
  Layers,
  PackageCheck,
  FileText,
} from "lucide-react";

export default function NewProposalForm() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [title, setTitle] = useState("");
  const [timeline, setTimeline] = useState("4-6 Weeks");
  const [pricing, setPricing] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [scope, setScope] = useState<string[]>([
    "Custom Next.js & React 19 front-end application",
    "PostgreSQL database schema design and Supabase migration",
    "Role-Based Access Control (RBAC) and client dashboard",
  ]);
  const [newScopeItem, setNewScopeItem] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([
    "Production application deployed to Vercel",
    "Source code transfer & GitHub repository handover",
    "API documentation & technical handoff call",
  ]);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [terms, setTerms] = useState(
    "50% upfront upon proposal acceptance; 50% upon final acceptance testing. Source code and IP transferred on final receipt. Includes 30 days post-launch warranty."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddScope = () => {
    if (!newScopeItem.trim()) return;
    setScope([...scope, newScopeItem.trim()]);
    setNewScopeItem("");
  };

  const handleRemoveScope = (index: number) => {
    setScope(scope.filter((_, i) => i !== index));
  };

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setDeliverables([...deliverables, newDeliverable.trim()]);
    setNewDeliverable("");
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !title || !pricing) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientCompany,
          title,
          timeline,
          pricing: Number(pricing),
          currency,
          scope,
          deliverables,
          terms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create proposal.");
      }

      router.push("/admin/proposals");
    } catch (err: any) {
      setError(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Navigation & Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <AdminBackLink href="/admin/proposals" label="Proposal Registry" />
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
            <FileSignature className="w-3 h-3" />
            New Proposal
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
            Commercial SOW Creator
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
          Digital Proposal Creator
        </h1>
        <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
          Define client deliverables, commercial pricing, scope milestones, and generate a tamper-evident proposal link.
        </p>
      </div>

      {error && (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 shadow-2xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Client Information */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
              <User className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              1. Client Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Client Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. sarah@cyberdyne.com"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. Cyberdyne Systems"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Scope Title & Commercials */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              2. Scope Title & Commercials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Proposal Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Portal & AI Architecture"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Estimated Timeline
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 6 Weeks"
                className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
                Currency & Price <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-2.5 py-2.5 text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] focus:outline-none focus:border-blue-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <input
                  type="number"
                  required
                  min={0}
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder="150000"
                  className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Scope Items */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                3. Technical Scope Items
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
              {scope.length} items included
            </span>
          </div>

          <div className="space-y-2.5">
            {scope.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-mono font-bold text-[var(--lit-text-muted,#52677C)]">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveScope(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newScopeItem}
              onChange={(e) => setNewScopeItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddScope();
                }
              }}
              placeholder="Add scope specification..."
              className="flex-1 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddScope}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Section 4: Key Deliverables */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
                <PackageCheck className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                4. Key Deliverables & Artifacts
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
              {deliverables.length} deliverables
            </span>
          </div>

          <div className="space-y-2.5">
            {deliverables.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-mono font-bold text-[var(--lit-text-muted,#52677C)]">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDeliverable(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove deliverable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDeliverable();
                }
              }}
              placeholder="Add key deliverable milestone..."
              className="flex-1 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddDeliverable}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Section 5: Terms & Conditions */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
            <span className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
              <FileText className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              5. Commercial Terms & Warranty
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
              Payment Schedule & Legal Warranty Clause
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Specify payment milestones, intellectual property transfer terms, and warranty period..."
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-3.5 text-xs text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-bold text-sm tracking-wide transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Proposal & Link...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Create Proposal & Generate Client Link</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
