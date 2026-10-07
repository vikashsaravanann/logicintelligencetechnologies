"use client";

import { useState } from "react";
import { Loader2, Sparkles, Check, ShieldAlert, Copy } from "lucide-react";
import { generateDraft, approveDraft, type StudioGenerateResult } from "./actions";

export function StudioPanel({
  businessId,
  companyName,
  compliance,
  evidenceCount,
  hasOpportunity,
}: {
  businessId: string;
  companyName: string;
  compliance: { cleared: boolean; reason: string; jurisdictionStatus: string; suppressed: boolean };
  evidenceCount: number;
  hasOpportunity: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudioGenerateResult | null>(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = hasOpportunity && evidenceCount > 0;

  async function onGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setApproved(false);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("businessId", businessId);
      setResult(await generateDraft(fd));
    } catch {
      setResult({ ok: false, message: "Something went wrong generating the draft." });
    } finally {
      setLoading(false);
    }
  }

  async function onApprove() {
    if (!result?.savedId) return;
    setApproving(true);
    try {
      const r = await approveDraft(result.savedId);
      setApproved(r.ok);
      if (!r.ok) setResult({ ...result, message: r.message });
    } finally {
      setApproving(false);
    }
  }

  const draft = result?.draft;
  const gates = result?.gates ?? [];

  return (
    <div className="space-y-4">
      {/* Compliance banner */}
      <div
        className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
          compliance.cleared
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
        }`}
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>{compliance.cleared ? "Compliance cleared" : "Not cleared to send"}:</strong> {compliance.reason}{" "}
          Jurisdiction + suppression are enforced by the database on every send.
        </span>
      </div>

      <form onSubmit={onGenerate} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-300">Message settings</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-[11px] text-neutral-400">
            Channel
            <select name="channel" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-white">
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="text-[11px] text-neutral-400">
            Tone
            <select name="tone" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-sm text-white">
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !canGenerate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-primary/90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
        {!canGenerate ? (
          <p className="mt-2 text-[11px] text-amber-300">
            {hasOpportunity ? "No verified evidence on this lead yet." : "This lead has no classified opportunity."} Enrich the lead before drafting.
          </p>
        ) : null}
      </form>

      {result && !result.ok ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">{result.message}</div>
      ) : null}

      {draft ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Draft for {companyName}</h3>
            {typeof result?.score?.total === "number" ? (
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                QA {result.score.total}/60
              </span>
            ) : null}
          </div>
          {draft.subject ? <p className="text-sm font-semibold text-white">{draft.subject}</p> : null}
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[13px] leading-relaxed text-neutral-200">{draft.body}</pre>

          {draft.claims_requiring_review.length ? (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
              <strong>Claims needing review:</strong> {draft.claims_requiring_review.join("; ")}
            </div>
          ) : null}

          {/* QA gates */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {gates.map((g) => (
              <span
                key={g.key}
                title={g.detail}
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  g.pass
                    ? "bg-emerald-500/10 text-emerald-300"
                    : g.blocker
                      ? "bg-rose-500/15 text-rose-300"
                      : "bg-amber-500/10 text-amber-300"
                }`}
              >
                {g.pass ? "✓" : "✗"} {g.key}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(`${draft.subject ? draft.subject + "\n\n" : ""}${draft.body}`).then(() => setCopied(true)).catch(() => {});
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={approving || approved || !result?.blockersPass || !result?.savedId}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-40"
            >
              {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              {approved ? "Approved" : "Approve"}
            </button>
            {!result?.blockersPass ? (
              <span className="text-[11px] text-rose-300">Blocked by a QA gate — cannot be approved.</span>
            ) : approved ? (
              <span className="text-[11px] text-emerald-300">Approved. Sending stays a separate, controlled step.</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
