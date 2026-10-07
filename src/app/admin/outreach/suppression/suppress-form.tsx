"use client";

import { useState } from "react";
import { Loader2, Ban } from "lucide-react";
import { addSuppression, type SuppressResult } from "./actions";

export function SuppressForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuppressResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const r = await addSuppression(new FormData(e.currentTarget));
      setResult(r);
      if (r.ok) e.currentTarget.reset();
    } catch {
      setResult({ ok: false, message: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
        <Ban className="h-4 w-4 text-rose-400" /> Add suppression
      </h2>
      <p className="mb-3 text-[11px] text-neutral-500">
        Blocks outreach to this email or domain at the database layer. Takes effect immediately for every worker and agent.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="email" type="email" placeholder="email@example.com" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <input name="domain" placeholder="example.com" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
        <select name="reason" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white">
          <option value="opt_out">Opt-out</option>
          <option value="do_not_contact">Do not contact</option>
          <option value="complaint">Complaint</option>
          <option value="bounce">Bounce</option>
          <option value="manual">Manual</option>
        </select>
        <input name="notes" placeholder="Note (optional)" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-500/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-rose-400 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Suppress
      </button>
      {result ? (
        <p className={`mt-2 text-xs ${result.ok ? "text-emerald-300" : "text-rose-300"}`}>{result.message}</p>
      ) : null}
    </form>
  );
}
