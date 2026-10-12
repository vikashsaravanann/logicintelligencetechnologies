import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import { Clock, Calendar, CheckCircle2, AlertCircle, Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Automation Schedule Registry | Admin | Logic Intelligence Technologies",
  description: "Inspect cron expressions, timezone anchors, next due time, and drift state across pipelines.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ScheduleItem {
  id: string;
  name: string;
  cronExpr: string;
  frequency: string;
  targetEndpoint: string;
  siteKey: string;
  siteName: string;
  timezone: string;
  lockStatus: "Acquired" | "Idle" | "Staged";
  status: "Active" | "Staged" | "Paused";
}

const SCHEDULE_REGISTRY: ScheduleItem[] = [
  {
    id: "cron-automation-retry",
    name: "Automation Event Dispatcher & Retry Daemon",
    cronExpr: "*/15 * * * *",
    frequency: "Every 15 minutes",
    targetEndpoint: "/api/cron/automation-retry",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-lead-scoring",
    name: "Lead Intent Auto-Scoring Engine",
    cronExpr: "0 */2 * * *",
    frequency: "Every 2 hours",
    targetEndpoint: "/api/crm/scoring",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-invoice-reminders",
    name: "Accounts Receivable & Dunning Watchdog",
    cronExpr: "0 10 * * *",
    frequency: "Daily at 10:00 IST",
    targetEndpoint: "/api/invoices/reminders",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-outreach-followups",
    name: "Client Outreach Follow-Up Sequencer",
    cronExpr: "0 9-18 * * 1-5",
    frequency: "Hourly during business hours",
    targetEndpoint: "/api/cron/outreach-followups",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-document-render",
    name: "Cryptographic Document Renderer",
    cronExpr: "*/5 * * * *",
    frequency: "Every 5 minutes",
    targetEndpoint: "/api/cron/document-render",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-email-outbox",
    name: "Transactional SMTP Relay Daemon",
    cronExpr: "* * * * *",
    frequency: "Every 1 minute",
    targetEndpoint: "/api/cron/email-outbox",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-seo-72h-corp",
    name: "72-Hour Search Console Recrawl & Audit (Corporate)",
    cronExpr: "0 2 */3 * *",
    frequency: "Every 72 hours (Slot-Locked)",
    targetEndpoint: "/api/cron/seo-audit?site=corporate",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "UTC / IST Anchored",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-seo-72h-hc",
    name: "72-Hour Healthcare Clinical Index Audit",
    cronExpr: "0 2 */3 * *",
    frequency: "Every 72 hours (Slot-Locked)",
    targetEndpoint: "/api/cron/seo-audit?site=healthcare",
    siteKey: "healthcare",
    siteName: "Healthcare Platform",
    timezone: "UTC / IST Anchored",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-seo-72h-lv",
    name: "72-Hour Logic Voice SEO & Sitemap Refresh",
    cronExpr: "0 2 */3 * *",
    frequency: "Every 72 hours (Slot-Locked)",
    targetEndpoint: "/api/cron/seo-audit?site=logic_voice",
    siteKey: "logic_voice",
    siteName: "Logic Voice",
    timezone: "UTC / IST Anchored",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-seo-72h-vs",
    name: "72-Hour VoiceShield Security Telemetry Audit",
    cronExpr: "0 2 */3 * *",
    frequency: "Every 72 hours (Slot-Locked)",
    targetEndpoint: "/api/cron/seo-audit?site=voice_shield",
    siteKey: "voice_shield",
    siteName: "VoiceShield",
    timezone: "UTC / IST Anchored",
    lockStatus: "Idle",
    status: "Active",
  },
  {
    id: "cron-weekly-digest",
    name: "Weekly Engineering Velocity Synthesis",
    cronExpr: "0 9 * * 1",
    frequency: "Mondays at 09:00 IST",
    targetEndpoint: "/api/cron/weekly-recognition",
    siteKey: "corporate",
    siteName: "Corporate LIT",
    timezone: "Asia/Kolkata (IST)",
    lockStatus: "Idle",
    status: "Active",
  },
];

export default async function SchedulesPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/schedules");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  const filteredSchedules = currentSite === "all"
    ? SCHEDULE_REGISTRY
    : SCHEDULE_REGISTRY.filter((s) => s.siteKey === currentSite);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Clock className="w-3 h-3" />
              Cron Engine
            </span>
            <span className="text-xs font-mono text-slate-500">Asia/Kolkata (IST) Canonical Timezone</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Automation Schedule Registry
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Deterministic cron expressions, slot-lock states, and execution windows across all background workers.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/schedules" counts={siteCounts} />

      {/* Schedules Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--lit-navy,#0B2545)]">{filteredSchedules.length}</span>
            <span className="text-[var(--lit-text-muted,#52677C)]">registered cron pipelines</span>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">Enforces slot concurrency locks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Daemon / Schedule</th>
                <th className="px-5 py-3 font-semibold">Cron Expression</th>
                <th className="px-5 py-3 font-semibold">Cadence</th>
                <th className="px-5 py-3 font-semibold">Entity</th>
                <th className="px-5 py-3 font-semibold">Slot Lock</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filteredSchedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{s.name}</div>
                    <span className="font-mono text-[10px] text-slate-400">{s.targetEndpoint}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-[var(--lit-blue,#1565C0)]">
                    {s.cronExpr}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {s.frequency}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {s.siteName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      <ShieldCheck className="w-3 h-3 text-slate-500" />
                      {s.lockStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <TruthfulStatusBadge status={s.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
