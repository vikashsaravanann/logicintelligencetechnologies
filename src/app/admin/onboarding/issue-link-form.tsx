"use client";

import { useState } from "react";
import { Loader2, Copy, Check, Link2, ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import { issueOnboardingLink, type IssueResult } from "./actions";

export function IssueLinkForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IssueResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setCopied(false);
    try {
      setResult(await issueOnboardingLink(new FormData(e.currentTarget)));
    } catch {
      setResult({ ok: false, message: "Something went wrong while generating the token." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
              <KeyRound className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Issue Activation Token
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)]">
            Generates a cryptographically secure, single-use client onboarding URL valid for 14 days. The raw token is displayed exactly once.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider font-mono self-start sm:self-auto">
          <ShieldCheck className="w-3 h-3" />
          <span>SHA-256 Hashed at Rest</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1.5">
              Contract UUID (Optional)
            </label>
            <input
              name="contractId"
              placeholder="e.g. 550e8400-e29b..."
              className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 px-3.5 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] font-mono placeholder:text-[var(--lit-text-muted,#52677C)]/50 focus:outline-hidden focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1.5">
              Client UUID (Optional)
            </label>
            <input
              name="clientId"
              placeholder="e.g. 7c9e6679-7425..."
              className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 px-3.5 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] font-mono placeholder:text-[var(--lit-text-muted,#52677C)]/50 focus:outline-hidden focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1.5">
              Project UUID (Optional)
            </label>
            <input
              name="projectId"
              placeholder="e.g. 9b1deb4d-3b7d..."
              className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 px-3.5 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] font-mono placeholder:text-[var(--lit-text-muted,#52677C)]/50 focus:outline-hidden focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Associate IDs to automatically link the onboarding intake to existing CRM entities.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 disabled:opacity-50 transition-all shadow-2xs"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
            <span>{loading ? "Generating…" : "Generate Activation Link"}</span>
          </button>
        </div>
      </form>

      {result ? (
        <div
          className={`rounded-xl border p-4 text-xs ${
            result.ok
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              : "border-rose-200 bg-rose-50/70 text-rose-900"
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1">
            {result.ok ? <Check className="w-4 h-4 text-emerald-600" /> : null}
            {result.message}
          </div>
          {result.url ? (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-mono text-emerald-950 select-all">
                {result.url}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(result.url as string).then(() => setCopied(true)).catch(() => {});
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shrink-0 shadow-2xs"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
