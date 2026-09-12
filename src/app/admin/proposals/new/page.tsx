"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Check } from "lucide-react";

export default function NewProposalPage() {
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
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <Link
        href="/admin/proposals"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Proposals</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Create Client Proposal
        </h1>
        <p className="text-zinc-400 text-sm">
          Define client deliverables, commercial pricing, and generate a secure client link.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Details */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Client Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Client Email *
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="sarah@cyberdyne.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Cyberdyne Systems"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Project & Investment */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Scope Title & Financials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Proposal Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enterprise Portal & CRM Architecture"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Estimated Timeline
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="6 Weeks"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Price ({currency}) *
              </label>
              <input
                type="number"
                required
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                placeholder="150000"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Scope Items */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Technical Scope Items
          </h2>

          <div className="space-y-2">
            {scope.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-zinc-200"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveScope(idx)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newScopeItem}
              onChange={(e) => setNewScopeItem(e.target.value)}
              placeholder="Add scope item..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={handleAddScope}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase"
            >
              Add
            </button>
          </div>
        </div>

        {/* Deliverables */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            4. Key Deliverables
          </h2>

          <div className="space-y-2">
            {deliverables.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-zinc-200"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDeliverable(idx)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              placeholder="Add deliverable..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            />
            <button
              type="button"
              onClick={handleAddDeliverable}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Secure Proposal...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Create Proposal & Generate Link</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
