"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ban, ShieldAlert, CheckCircle2, AlertCircle, X } from "lucide-react";
import { addSuppression, deactivateSuppression, type SuppressResult } from "./actions";

export function SuppressForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuppressResult | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const form = e.currentTarget;
      const r = await addSuppression(new FormData(form));
      setResult(r);
      if (r.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setResult({ ok: false, message: "An unexpected error occurred. Please retry." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 shrink-0">
          <Ban className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[var(--lit-navy,#0B2545)]">
            Add DNC / Global Suppression Rule
          </h2>
          <p className="mt-0.5 text-xs text-[var(--lit-text-muted,#52677C)]">
            Blocks outreach to this email address or entire apex domain at the database layer. Enforced immediately
            for every worker, campaign, and agent execution.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1">
            Email Address (Optional)
          </label>
          <input
            name="email"
            type="email"
            placeholder="contact@example.com"
            className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1">
            Domain Name (Optional)
          </label>
          <input
            name="domain"
            placeholder="example.com"
            className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1">
            Suppression Reason
          </label>
          <select
            name="reason"
            className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] transition-all"
            defaultValue="do_not_contact"
          >
            <option value="opt_out">Opt-out Request</option>
            <option value="do_not_contact">Do Not Contact (DNC)</option>
            <option value="complaint">Spam Complaint / Unsubscribe</option>
            <option value="bounce">Hard Bounce / Invalid Mailbox</option>
            <option value="jurisdiction">Restricted Jurisdiction</option>
            <option value="manual">Manual Admin Blacklist</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1">
            Notes / Audit Reference
          </label>
          <input
            name="notes"
            placeholder="e.g., Requested removal via privacy email"
            className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] transition-all"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
        <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
          * At least one valid email or apex domain is required.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-2xs hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5" />
          )}
          <span>Apply Suppression Rule</span>
        </button>
      </div>

      {result ? (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs font-medium flex items-center gap-2 ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
          role="status"
        >
          {result.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{result.message}</span>
        </div>
      ) : null}
    </form>
  );
}

export function DeactivateButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onDeactivate() {
    if (
      !window.confirm(
        "Deactivate this suppression rule? The contact or domain will become eligible for future outreach campaigns."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await deactivateSuppression(id);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch {
      alert("Failed to deactivate suppression rule.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDeactivate}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-[var(--lit-navy,#0B2545)] shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
      title="Lift suppression rule"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
      <span>Lift</span>
    </button>
  );
}
