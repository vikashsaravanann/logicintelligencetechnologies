"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CalendarClock, X, Check } from "lucide-react";
import { createFollowup, cancelFollowupAction, markFollowupSentAction, type FollowupActionResult } from "./actions";
import type { FollowupRow } from "@/lib/outreach/intelligence/followups";

const STATUS_TABS = [
  { key: "scheduled", label: "Scheduled" },
  { key: "sent", label: "Sent" },
  { key: "cancelled", label: "Cancelled" },
  { key: "skipped", label: "Skipped" },
];

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function dueLabel(iso: string): { text: string; overdue: boolean } {
  const due = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.round((due - now) / (24 * 3600 * 1000));
  if (due < now) return { text: `overdue by ${Math.abs(days)}d`, overdue: true };
  if (days === 0) return { text: "due today", overdue: false };
  return { text: `in ${days}d`, overdue: false };
}

export function FollowupsClient({
  rows,
  stats,
  statusFilter,
  leadOptions,
}: {
  rows: FollowupRow[];
  stats: { byStatus: Record<string, number>; overdue: number };
  statusFilter: string;
  leadOptions: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<FollowupActionResult | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateResult(null);
    try {
      const r = await createFollowup(new FormData(e.currentTarget));
      setCreateResult(r);
      if (r.ok) {
        e.currentTarget.reset();
        router.refresh();
      }
    } catch {
      setCreateResult({ ok: false, message: "Something went wrong." });
    } finally {
      setCreating(false);
    }
  }

  async function run(id: string, fn: () => Promise<FollowupActionResult>) {
    setBusyId(id);
    try {
      const r = await fn();
      if (r.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Schedule a follow-up */}
      <form onSubmit={onCreate} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
          <CalendarClock className="h-4 w-4 text-amber-400" /> Schedule a follow-up
        </h2>
        <p className="mb-3 text-[11px] text-neutral-500">
          One active follow-up per lead. Scheduling again reschedules the existing one rather than duplicating it.
        </p>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <select name="businessId" required className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white">
            <option value="">Select the lead…</option>
            {leadOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <select name="days" defaultValue="4" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white">
            <option value="2">in 2 days</option>
            <option value="4">in 4 days</option>
            <option value="7">in 1 week</option>
            <option value="14">in 2 weeks</option>
            <option value="30">in 1 month</option>
          </select>
          <input name="reason" placeholder="Reason / context (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white sm:col-span-2" />
        </div>
        <button type="submit" disabled={creating} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 disabled:opacity-50">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Schedule
        </button>
        {createResult ? <p className={`mt-2 text-xs ${createResult.ok ? "text-emerald-300" : "text-rose-300"}`}>{createResult.message}</p> : null}
      </form>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {STATUS_TABS.map((t) => (
          <Link key={t.key} href={`/admin/outreach/followups?status=${t.key}`} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${t.key === statusFilter ? "bg-amber-500/15 text-amber-200" : "text-neutral-400 hover:bg-neutral-900"}`}>
            {t.label} <span className="text-neutral-500">({stats.byStatus[t.key] ?? 0})</span>
          </Link>
        ))}
        {stats.overdue > 0 ? <span className="ml-auto self-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300">{stats.overdue} overdue</span> : null}
      </div>

      {/* List */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">No {statusFilter} follow-ups.</div>
      ) : (
        <ul className="space-y-3">
          {rows.map((f) => {
            const due = dueLabel(f.due_at);
            const busy = busyId === f.id;
            return (
              <li key={f.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/outreach/studio?lead=${f.business_id}`} className="font-semibold text-white hover:underline">{f.company_name}</Link>
                    <p className="text-[11px] text-neutral-500">
                      step {f.sequence_step} · due {fmtDate(f.due_at)}
                      {f.created_by ? ` · by ${f.created_by}` : ""}
                    </p>
                    {f.reason ? <p className="mt-1 text-sm text-neutral-300">{f.reason}</p> : null}
                    {f.resolution ? <p className="mt-1 text-[11px] text-neutral-500">{f.resolution}</p> : null}
                  </div>
                  {f.status === "scheduled" ? (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${due.overdue ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/10 text-amber-300"}`}>{due.text}</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-neutral-700/30 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-400">{f.status}</span>
                  )}
                </div>

                {f.status === "scheduled" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" disabled={busy} onClick={() => run(f.id, () => markFollowupSentAction(f.id))} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-black hover:bg-emerald-400 disabled:opacity-40">
                      <Check className="h-3 w-3" /> Mark sent
                    </button>
                    <button type="button" disabled={busy} onClick={() => run(f.id, () => cancelFollowupAction(f.id))} className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1 text-[11px] font-semibold text-neutral-300 hover:bg-neutral-900 disabled:opacity-40">
                      <X className="h-3 w-3" /> Cancel
                    </button>
                    {busy ? <Loader2 className="h-3 w-3 animate-spin text-neutral-500" /> : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
