import Link from "next/link";
import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { outreachStats } from "@/lib/outreach/intelligence/queues";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import {
  BarChart3,
  TrendingUp,
  Send,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Globe,
  Users,
  Layers,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  Percent,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Outreach Conversion Analytics & Funnel | Admin | Logic Intelligence Technologies",
  description: "Real-time funnel conversion metrics, message lifecycle telemetry, and jurisdiction compliance matrix.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const JUR_TONE: Record<string, { label: string; tone: string }> = {
  allowed: { label: "Permitted for verified scenario", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  review_required: { label: "Legal review required", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  blocked: { label: "Restricted — evidence required", tone: "border-rose-200 bg-rose-50 text-rose-800" },
};

export default async function OutreachAnalyticsPage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach/analytics");
  const s = await outreachStats();

  const m = s.messagesByStatus;
  const sent = m.sent ?? 0;
  const approved = (m.approved ?? 0) + (m.scheduled ?? 0);
  const review = m.needs_review ?? 0;
  const drafts = m.draft ?? 0;
  const totalMessages = Object.values(m).reduce((a, b) => a + b, 0);
  const totalLeads = Object.values(s.leadsByStatus).reduce((a, b) => a + b, 0);

  const approvalRate =
    review + approved + sent > 0
      ? Math.round(((approved + sent) / (review + approved + sent)) * 100)
      : 0;

  const dispatchRate =
    approved + sent > 0 ? Math.round((sent / (approved + sent)) * 100) : 0;

  // Conversion funnel steps
  const funnelSteps = [
    {
      id: "leads",
      label: "1. Verified Leads Scored",
      count: totalLeads,
      description: "Enriched target businesses with verified signals",
      color: "bg-[var(--lit-navy,#0B2545)] text-white",
      percent: 100,
    },
    {
      id: "drafted",
      label: "2. Messages Drafted",
      count: totalMessages,
      description: "AI-assisted drafts generated from verified evidence",
      color: "bg-[var(--lit-blue,#1565C0)] text-white",
      percent: totalLeads > 0 ? Math.min(100, Math.round((totalMessages / totalLeads) * 100)) : 0,
    },
    {
      id: "review",
      label: "3. QA Gates Cleared",
      count: review + approved + sent,
      description: "Passed all 10 automated QA blocker gates",
      color: "bg-indigo-600 text-white",
      percent:
        totalMessages > 0
          ? Math.min(100, Math.round(((review + approved + sent) / totalMessages) * 100))
          : 0,
    },
    {
      id: "approved",
      label: "4. Human Authorized",
      count: approved + sent,
      description: "Explicitly approved by admin operator",
      color: "bg-[var(--lit-teal,#1FA9A2)] text-white",
      percent:
        review + approved + sent > 0
          ? Math.min(100, Math.round(((approved + sent) / (review + approved + sent)) * 100))
          : 0,
    },
    {
      id: "sent",
      label: "5. Dispatched to Market",
      count: sent,
      description: "Successfully delivered through controlled dispatch",
      color: "bg-emerald-600 text-white",
      percent:
        approved + sent > 0
          ? Math.min(100, Math.round((sent / (approved + sent)) * 100))
          : 0,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header & Navigation */}
      <div className="space-y-4">
        <div>
          <AdminBackLink href="/admin/outreach" label="Outreach Pipeline" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <TrendingUp className="w-3 h-3" />
              Conversion Funnel &amp; Telemetry
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Zero Synthetic Projections
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Outreach Conversion Analytics
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)] max-w-3xl">
            Verifiable real-time metrics directly from the lead intelligence database and queue ledger.
            Zero estimates, no synthetic projections, and strictly audited transmissions.
          </p>
        </div>

        {/* Global Outreach Navigation */}
        <OutreachNav active="analytics" />

      {s.error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold">Telemetry Data Temporarily Unavailable</h3>
            <p>
              Supabase database query execution failed or timed out. Metric figures may be incomplete.
              Automated compliance triggers remain enforced in fail-closed mode.
            </p>
          </div>
        </div>
      )}
      </div>

      {s.error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-800 shadow-2xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Some metrics could not be loaded due to an intermittent database read timeout.</span>
        </div>
      ) : null}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Scored Leads
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {totalLeads}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Verified businesses</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Awaiting Approval
            </span>
            <span className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-700">
              {review}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Pending human gate</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Authorized / Scheduled
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {approved}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Ready for dispatch window
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Dispatched (Sent)
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Send className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {sent}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              Delivered live communications
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Section */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              End-to-End Pipeline Conversion Funnel
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Tracking lead progression from initial verification through human authorization to dispatch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-xs font-mono font-bold text-[var(--lit-teal,#1FA9A2)]">
              <Percent className="w-3.5 h-3.5" />
              {approvalRate}% Human Authorization Rate
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {funnelSteps.map((step, idx) => (
            <div
              key={step.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between relative"
            >
              <div>
                <span className="font-mono text-[10px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase block">
                  {step.label}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-extrabold text-[var(--lit-navy,#0B2545)]">
                    {step.count}
                  </span>
                  {idx > 0 && (
                    <span className="font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                      ({step.percent}%)
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-600 leading-snug">
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-2">
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${step.color.split(" ")[0]}`}
                    style={{ width: `${Math.max(4, step.percent)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Breakdown: Messages & Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Status */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                Messages by Lifecycle Status
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                State machine distribution of all generated drafts.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              {totalMessages} Total
            </span>
          </div>

          {Object.keys(m).length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
              Database unseeded: No message versions generated yet. Generate drafts in the Message Studio after lead indexing.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(m).map(([k, count]) => {
                const pct = totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0;
                return (
                  <div key={k} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 capitalize">
                        {k.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                        {count} <span className="font-normal text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          k === "sent"
                            ? "bg-emerald-500"
                            : k === "approved" || k === "scheduled"
                            ? "bg-[var(--lit-teal,#1FA9A2)]"
                            : k === "needs_review"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leads by Pipeline Stage */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                Leads by Pipeline Stage
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                CRM qualification stages for target businesses.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              {totalLeads} Total
            </span>
          </div>

          {Object.keys(s.leadsByStatus).length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
              Database unseeded: 0 target businesses indexed in this environment. Run a crawler or discovery batch import to populate.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(s.leadsByStatus).map(([k, count]) => {
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={k} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 capitalize">
                        {k.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                        {count} <span className="font-normal text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--lit-blue,#1565C0)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* International Jurisdictions Compliance Matrix */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                Jurisdiction &amp; Regulatory Compliance Matrix
              </h3>
            </div>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Outreach legality and compliance classification per ISO country code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-800 text-xs font-mono font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              {s.suppressions} Active Global Suppressions
            </span>
            <Link
              href="/admin/outreach/compliance"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] text-xs font-semibold hover:bg-slate-50 transition-colors min-h-[32px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              Review Policy &amp; Rules
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3">Country ISO</th>
                <th className="px-5 py-3">Compliance Status</th>
                <th className="px-5 py-3 text-right">Target Businesses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {s.jurisdictions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                    No jurisdictions configured in database registry.
                  </td>
                </tr>
              ) : (
                s.jurisdictions.map((j) => {
                  const statusInfo = JUR_TONE[j.outreach_status] ?? {
                    label: j.outreach_status.replace(/_/g, " "),
                    tone: "border-slate-200 bg-slate-100 text-slate-700",
                  };
                  return (
                    <tr key={j.country_code} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                        {j.country_code}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusInfo.tone}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-slate-700">
                        {j.businesses}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Regulatory Gate Enforced:</strong> Outreach drafts and dispatches are strictly blocked by
            database row-level triggers unless the target country is explicitly marked{" "}
            <span className="font-mono text-emerald-700 font-bold">allowed</span>. Countries requiring legal review
            or prohibited by regional communications acts are rejected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
