"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectOpt = {
  id: string;
  label: string;
  clientId: string | null;
  companyName: string;
  contactName: string;
  contactEmail: string;
  projectTitle: string;
};

export function NewTechnicalDraftForm({ projects }: { projects: ProjectOpt[] }) {
  const router = useRouter();
  const [engagementId, setEngagementId] = useState(projects[0]?.id || "");
  const [scope, setScope] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [timeline, setTimeline] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!engagementId) {
      setError("Select an assigned project.");
      return;
    }
    setBusy(true);
    setError(null);
    const project = projects.find((p) => p.id === engagementId);
    try {
      const res = await fetch("/api/staff/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementId,
          clientId: project?.clientId || undefined,
          scope_summary: scope,
          architecture_notes: architecture,
          timeline_notes: timeline,
          assumptions,
          exclusions,
          client_snapshot: {
            company_name: project?.companyName || "",
            contact_name: project?.contactName || "",
            contact_email: project?.contactEmail || "",
            project_title: project?.projectTitle || "",
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || "Could not save draft");
        return;
      }
      router.push(`/staff/quotations/${data.draft?.id || ""}`);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (projects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-600">
        No eligible assigned projects. Request Super Admin to enable technical quotation on an assignment.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <label className="block text-xs font-medium text-slate-700">
        Assigned project
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
      {[
        ["Scope summary", scope, setScope],
        ["Architecture notes", architecture, setArchitecture],
        ["Timeline notes", timeline, setTimeline],
        ["Assumptions", assumptions, setAssumptions],
        ["Exclusions", exclusions, setExclusions],
      ].map(([label, value, set]) => (
        <label key={label as string} className="block text-xs font-medium text-slate-700">
          {label as string}
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={value as string}
            onChange={(e) => (set as (v: string) => void)(e.target.value)}
            required={label === "Scope summary"}
          />
        </label>
      ))}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save technical draft"}
      </button>
    </form>
  );
}
