"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Play, Pause, Plus } from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  dry_run?: boolean;
  created_at: string;
  started_at?: string | null;
};

type Preview = {
  eligible: number;
  suppressed: number;
  invalid: number;
  total: number;
};

export function OutreachClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [dryRun, setDryRun] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/outreach/campaigns", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setCampaigns(data.campaigns || []);
      setPreview(data.preview || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCampaign() {
    if (!name.trim()) {
      setError("Campaign name required");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/outreach/campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: name.trim(),
          dryRun,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Create failed");
      setSuccess(`Draft campaign created (${data.id?.slice(0, 8)}\u2026)`);
      setName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function activate(id: string) {
    if (
      !window.confirm(
        "Activate this campaign? Eligible leads will be enrolled and scheduled. Dry-run campaigns record activity only."
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/outreach/campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Activate failed");
      setSuccess(
        `Activated \u2014 enrolled ${data.enrolled ?? 0}, skipped ${data.skipped ?? 0}`
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activate failed");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, action: "pause" | "resume") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/outreach/campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSuccess(action === "pause" ? "Campaign paused" : "Campaign resumed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {preview ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Eligible", value: preview.eligible },
            { label: "Suppressed", value: preview.suppressed },
            { label: "Invalid", value: preview.invalid },
            { label: "Leads scanned", value: preview.total },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {k.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{k.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Create campaign
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Starts as DRAFT with the standard 4-step sequence (day 0 / 3 / 7 / 14).
          Activate only after review. Default dry-run is on for safety.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs text-neutral-400">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
              placeholder="Q3 discovery nurture"
              disabled={busy}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={busy}
            />
            Dry run (no provider send)
          </label>
          <button
            type="button"
            onClick={() => void createCampaign()}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create draft
          </button>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="border-b border-neutral-800 bg-neutral-950 text-[10px] uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-3">Campaign</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500">
                  Loading\u2026
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500">
                  No outreach campaigns yet.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="p-3">
                    <div className="font-semibold text-white">{c.name}</div>
                    {c.dry_run ? (
                      <span className="text-[10px] font-bold uppercase text-amber-400">
                        Dry run
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-neutral-500">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      {c.status === "DRAFT" || c.status === "READY" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void activate(c.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-300 hover:bg-emerald-600/30 disabled:opacity-50"
                        >
                          <Play className="h-3 w-3" />
                          Activate
                        </button>
                      ) : null}
                      {c.status === "ACTIVE" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void setStatus(c.id, "pause")}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600/20 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-300 disabled:opacity-50"
                        >
                          <Pause className="h-3 w-3" />
                          Pause
                        </button>
                      ) : null}
                      {c.status === "PAUSED" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void setStatus(c.id, "resume")}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/20 px-2.5 py-1 text-[11px] font-bold uppercase text-indigo-300 disabled:opacity-50"
                        >
                          <Play className="h-3 w-3" />
                          Resume
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
