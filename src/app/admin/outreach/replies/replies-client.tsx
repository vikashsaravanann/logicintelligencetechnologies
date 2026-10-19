"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Ban, Check, RotateCcw, MessageSquarePlus } from "lucide-react";
import { logReply, reclassifyReply, toggleReplyHandled, suppressFromReply, type ReplyActionResult } from "./actions";
import { REPLY_CATEGORIES, type ReplyCategory } from "@/lib/outreach/intelligence/reply-schema";
import type { ReplyRow } from "@/lib/outreach/intelligence/replies";

type Meta = Record<ReplyCategory, { label: string; hint: string; tone: string }>;

const TONE_CLASS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  sky: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  neutral: "bg-neutral-700/30 text-neutral-300 border-neutral-600/40",
};

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function RepliesClient({
  replies,
  counts,
  activeFilter,
  leadOptions,
  categoryMeta,
}: {
  replies: ReplyRow[];
  counts: Record<string, number>;
  activeFilter: string | null;
  leadOptions: Array<{ id: string; label: string }>;
  categoryMeta: Meta;
}) {
  const router = useRouter();
  const [logging, setLogging] = useState(false);
  const [logResult, setLogResult] = useState<ReplyActionResult | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLogging(true);
    setLogResult(null);
    try {
      const r = await logReply(new FormData(e.currentTarget));
      setLogResult(r);
      if (r.ok) {
        e.currentTarget.reset();
        router.refresh();
      }
    } catch {
      setLogResult({ ok: false, message: "Something went wrong." });
    } finally {
      setLogging(false);
    }
  }

  async function run(id: string, fn: () => Promise<ReplyActionResult>) {
    setBusyId(id);
    try {
      const r = await fn();
      if (r.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Record a reply */}
      <form onSubmit={onLog} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
          <MessageSquarePlus className="h-4 w-4 text-indigo-400" /> Record a reply
        </h2>
        <p className="mb-3 text-[11px] text-neutral-500">
          Paste an inbound reply. It is classified server-side and linked to the lead. Recording a reply automatically
          cancels any scheduled follow-up for that business.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="businessId" required className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white">
            <option value="">Select the lead…</option>
            {leadOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <input name="fromEmail" type="email" placeholder="sender@example.com (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
          <input name="subject" placeholder="Subject (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white sm:col-span-2" />
          <textarea name="body" required rows={4} placeholder="Paste the reply text…" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white sm:col-span-2" />
        </div>
        <button type="submit" disabled={logging} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-500/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-indigo-400 disabled:opacity-50">
          {logging ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Record &amp; classify
        </button>
        {logResult ? <p className={`mt-2 text-xs ${logResult.ok ? "text-emerald-300" : "text-rose-300"}`}>{logResult.message}</p> : null}
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/outreach/replies" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${!activeFilter ? "bg-indigo-500/15 text-indigo-200" : "text-neutral-400 hover:bg-neutral-900"}`}>
          All <span className="text-neutral-500">({total})</span>
        </Link>
        {REPLY_CATEGORIES.filter((c) => (counts[c] ?? 0) > 0).map((c) => (
          <Link key={c} href={`/admin/outreach/replies?filter=${c}`} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${activeFilter === c ? "bg-indigo-500/15 text-indigo-200" : "text-neutral-400 hover:bg-neutral-900"}`}>
            {categoryMeta[c].label} <span className="text-neutral-500">({counts[c]})</span>
          </Link>
        ))}
      </div>

      {/* List */}
      {replies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">No replies{activeFilter ? ` in ${categoryMeta[activeFilter as ReplyCategory].label}` : " yet"}.</div>
      ) : (
        <ul className="space-y-3">
          {replies.map((r) => {
            const meta = categoryMeta[r.category];
            const canSuppress = (r.category === "opt_out" || r.category === "bounce") && r.from_email;
            const busy = busyId === r.id;
            return (
              <li key={r.id} className={`rounded-2xl border bg-neutral-900/50 p-4 ${r.handled ? "border-neutral-800 opacity-70" : "border-neutral-700"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/outreach/studio?lead=${r.business_id}`} className="font-semibold text-white hover:underline">{r.company_name}</Link>
                    <p className="text-[11px] text-neutral-500">
                      {r.from_email ?? "unknown sender"} · {r.channel} · {fmt(r.received_at)}
                      {r.classified_by ? ` · classified by ${r.classified_by}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TONE_CLASS[meta.tone] ?? TONE_CLASS.neutral}`}>{meta.label}</span>
                </div>

                {r.subject ? <p className="mt-2 text-sm font-semibold text-neutral-200">{r.subject}</p> : null}
                <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[12px] text-neutral-300">{r.body}</pre>

                <p className="mt-2 text-[11px] text-neutral-500">
                  {meta.hint}
                  {r.category_rationale ? ` — ${r.category_rationale}` : ""}
                  {typeof r.category_confidence === "number" ? ` (confidence ${(r.category_confidence * 100).toFixed(0)}%)` : ""}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    defaultValue={r.category}
                    disabled={busy}
                    onChange={(e) => run(r.id, () => reclassifyReply(r.id, e.target.value))}
                    className="rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] text-white"
                    aria-label="Re-classify reply"
                  >
                    {REPLY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{categoryMeta[c].label}</option>
                    ))}
                  </select>

                  {canSuppress ? (
                    <button type="button" disabled={busy} onClick={() => run(r.id, () => suppressFromReply(r.id))} className="inline-flex items-center gap-1 rounded-lg bg-rose-500/90 px-3 py-1 text-[11px] font-bold text-black hover:bg-rose-400 disabled:opacity-40">
                      <Ban className="h-3 w-3" /> Suppress sender
                    </button>
                  ) : null}

                  <button type="button" disabled={busy} onClick={() => run(r.id, () => toggleReplyHandled(r.id, !r.handled))} className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1 text-[11px] font-semibold text-neutral-300 hover:bg-neutral-900 disabled:opacity-40">
                    {r.handled ? <><RotateCcw className="h-3 w-3" /> Reopen</> : <><Check className="h-3 w-3" /> Mark handled</>}
                  </button>

                  {busy ? <Loader2 className="h-3 w-3 animate-spin text-neutral-500" /> : null}
                  {r.handled && r.handled_by ? <span className="text-[10px] text-neutral-500">handled by {r.handled_by}</span> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
