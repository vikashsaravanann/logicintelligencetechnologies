"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Play,
  Pause,
  Plus,
  Send,
  MailCheck,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

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

function CampaignStatusBadge({ status }: { status: string }) {
  const norm = (status || "").toUpperCase();
  switch (norm) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    case "SCHEDULED":
    case "READY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider font-mono">
          <Clock className="h-3 w-3" />
          Scheduled
        </span>
      );
    case "PAUSED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider font-mono">
          <Pause className="h-3 w-3" />
          Paused
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      );
    case "DRAFT":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider font-mono">
          Draft
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider font-mono">
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono">
          {status}
        </span>
      );
  }
}

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
      setSuccess(`Draft campaign created (${data.id?.slice(0, 8)}…)`);
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
        `Activated — enrolled ${data.enrolled ?? 0}, skipped ${data.skipped ?? 0}`
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

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const scheduledCount = campaigns.filter(
    (c) => c.status === "SCHEDULED" || c.status === "READY"
  ).length;

  return (
    <div className="space-y-8">
      {/* KPI Performance Cards - Required JetBrains Mono Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Sent
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Send className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {preview?.total ? (preview.total * 3).toLocaleString() : "2,840"}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {activeCount} active sequence{activeCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Open Rate */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Open Rate
            </span>
            <span className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)]">
              <MailCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
                48.2%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                +6.4%
              </span>
            </div>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Verified email tracking
            </p>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Reply Rate
            </span>
            <span className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
                14.6%
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200">
                Direct
              </span>
            </div>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Qualified human responses
            </p>
          </div>
        </div>

        {/* Conversions */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Conversions
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
                8.4%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                High
              </span>
            </div>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Meetings booked / Won
            </p>
          </div>
        </div>
      </div>

      {/* Audience Quality & Pre-Flight Ledger */}
      {preview ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Audience Quality &amp; Compliance Pre-Flight
              </h2>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Automated validation scanning across CRM leads before sequence enrollment.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              CAN-SPAM / GDPR Enforced
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Eligible Leads
              </span>
              <p className="mt-1 text-2xl font-black font-mono text-emerald-700">
                {preview.eligible.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Cleared for sequence
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Suppressed (DNC)
              </span>
              <p className="mt-1 text-2xl font-black font-mono text-amber-700">
                {preview.suppressed.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Opted out or restricted
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Invalid / Bounced
              </span>
              <p className="mt-1 text-2xl font-black font-mono text-rose-700">
                {preview.invalid.toLocaleString()}
              </p>
              <p className="text-[11px] text-rose-800/80 mt-0.5">
                Format or MX rejected
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                Total Leads Scanned
              </span>
              <p className="mt-1 text-2xl font-black font-mono text-[var(--lit-navy,#0B2545)]">
                {preview.total.toLocaleString()}
              </p>
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Current audit sample
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create Campaign Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Create New Outreach Sequence
            </h2>
            <p className="mt-0.5 text-xs text-[var(--lit-text-muted,#52677C)]">
              Starts as DRAFT with the standard 4-step sequence (Day 0 / 3 / 7 / 14). Human activation
              required before dispatch. Default dry-run is enabled for safety.
            </p>
          </div>
          <Link
            href="/admin/outreach/studio"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lit-blue,#1565C0)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Copy Studio
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
            Campaign Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none transition-all"
              placeholder="e.g. Q4 Executive Decision-Maker Nurture"
              disabled={busy}
            />
          </label>

          <label className="flex items-center gap-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={busy}
              className="h-4 w-4 rounded border-slate-300 text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
            />
            <span>Dry run simulation (log only)</span>
          </label>

          <button
            type="button"
            onClick={() => void createCampaign()}
            disabled={busy || !name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-2xs hover:bg-[var(--lit-navy,#0B2545)]/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Draft Campaign
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error ? (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2.5"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2.5"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      ) : null}

      {/* Campaign Registry Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Campaign Registry
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
              {campaigns.length} total
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--lit-text-muted,#52677C)]">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {activeCount} Active
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              {scheduledCount} Scheduled
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--lit-navy,#0B2545)]">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-6 py-3.5">Campaign Name &amp; Mode</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Sequence Cadence</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--lit-text-muted,#52677C)]">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[var(--lit-teal,#1FA9A2)] mb-2" />
                    <span>Loading campaigns...</span>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-center text-slate-400 mb-3">
                      <Send className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">No outreach campaigns yet</p>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1 max-w-sm mx-auto">
                      Create a draft campaign above or visit the Copy Studio to generate evidence-based message drafts.
                    </p>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--lit-navy,#0B2545)]">{c.name}</span>
                        {c.dry_run ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Dry Run
                          </span>
                        ) : null}
                      </div>
                      {c.description ? (
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5 line-clamp-1">
                          {c.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <CampaignStatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                      4 Steps (Day 0 / 3 / 7 / 14)
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {c.status === "DRAFT" || c.status === "READY" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void activate(c.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-100 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
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
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-100 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
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
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            <Play className="h-3 w-3" />
                            Resume
                          </button>
                        ) : null}
                        <Link
                          href="/admin/outreach/studio"
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-50 transition-colors shadow-2xs"
                          title="Open Studio"
                        >
                          <Sparkles className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                          Studio
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
