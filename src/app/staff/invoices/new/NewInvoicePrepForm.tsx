"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectOpt = { id: string; label: string; clientId: string | null };

export function NewInvoicePrepForm({ projects }: { projects: ProjectOpt[] }) {
  const router = useRouter();
  const [engagementId, setEngagementId] = useState(projects[0]?.id || "");
  const [milestoneKey, setMilestoneKey] = useState("stage_10_delivery");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const project = projects.find((p) => p.id === engagementId);
    try {
      const res = await fetch("/api/staff/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementId,
          clientId: project?.clientId || undefined,
          milestone_key: milestoneKey,
          deliverable_summary: summary,
          stage_verification_notes: notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || "Save failed");
        return;
      }
      router.push("/staff/invoices");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (!projects.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-600">
        No assigned projects allow invoice preparation.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <label className="block text-xs font-medium text-slate-700">
        Project
        <select
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={engagementId}
          onChange={(e) => setEngagementId(e.target.value)}
          required
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-slate-700">
        Milestone key
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={milestoneKey}
          onChange={(e) => setMilestoneKey(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs font-medium text-slate-700">
        Deliverable summary
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs font-medium text-slate-700">
        Stage verification notes
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save preparation request"}
      </button>
    </form>
  );
}
