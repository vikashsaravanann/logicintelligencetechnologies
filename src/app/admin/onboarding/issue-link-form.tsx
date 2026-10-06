"use client";

import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
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
      setResult({ ok: false, message: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-zinc-300">Issue onboarding link</h2>
      <p className="mb-4 text-xs text-neutral-500">
        Generates a single-use link valid for 14 days. The token is shown once — copy it and send it to the client.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="contractId" placeholder="Contract ID (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
          <input name="clientId" placeholder="Client ID (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
          <input name="projectId" placeholder="Project ID (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Creating…" : "Create link"}
        </button>
      </form>

      {result ? (
        <div className={`mt-4 rounded-xl border p-3 text-sm ${result.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
          <p>{result.message}</p>
          {result.url ? (
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-black/40 px-2 py-1 text-[11px] text-emerald-200">{result.url}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(result.url as string).then(() => setCopied(true)).catch(() => {});
                }}
                className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
