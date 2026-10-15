import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getAutomationsSnapshot, type AutomationsState } from "@/lib/automations/n8n-client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../components/AdminBackLink";
import ImportButton from "./import-button";
import ConfigureN8nDialog from "./configure-dialog";
import {
  retryProvisioningStep,
  retryAutomationEvent,
  triggerAutomationDispatcher,
  triggerLeadScoringBatch,
  triggerInvoiceReminders,
  triggerOutreachFollowups,
} from "./actions";
import {
  Zap,
  Activity,
  Cpu,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Layers,
  Mail,
  Calculator,
  Receipt,
  Send,
  FileCheck2,
  RefreshCw,
  Server,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  CheckSquare,
  ShieldAlert,
  Settings,
  Radio,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Automations & Scheduled Pipelines | Admin | Logic Intelligence Technologies",
  description:
    "Clinical dashboard for managing background cron workers, lead auto-scoring engines, invoice reminders, and recovery queues.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface FailedEventRow {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
}

interface FailedStepRow {
  id: string;
  step: string;
  status: string;
  created_at: string;
}

async function getFailureQueue(): Promise<{ events: FailedEventRow[]; steps: FailedStepRow[] }> {
  const [eventsRes, stepsRes] = await Promise.all([
    supabaseAdmin
      .from("automation_events")
      .select("id, event_type, status, created_at")
      .in("status", ["failed", "dead_letter"])
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("provisioning_steps")
      .select("id, step, status, created_at")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return {
    events: (eventsRes.data as FailedEventRow[] | null) ?? [],
    steps: (stepsRes.data as FailedStepRow[] | null) ?? [],
  };
}

const STATE_CONFIG: Record<
  AutomationsState,
  { label: string; badge: string; dot: string }
> = {
  CONNECTED: {
    label: "Engine Active",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
  ERROR: {
    label: "Engine Degraded",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
  },
  "NOT CONFIGURED": {
    label: "Unconfigured",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-400",
  },
};

interface ScheduledAutomation {
  id: string;
  name: string;
  description: string;
  category: "Cron Worker" | "Scoring Engine" | "Billing Dunning" | "Outreach Pipeline" | "Document Worker";
  schedule: string;
  humanSchedule: string;
  route: string;
  status: "Active" | "Paused" | "Error";
  icon: typeof Zap;
  triggerAction?: () => Promise<void>;
  actionLabel?: string;
}

import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  getWorkflowCountsByStatus,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import { FourSiteTabs } from "../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../components/RiskTierBadge";

export default async function AutomationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const currentSite = (resolvedParams?.site || "all") as SiteFilter;
  const session = await requireCapabilityPage("automations.read", "/admin/automations");
  const snap = await getAutomationsSnapshot();
  const { events: failedEvents, steps: failedSteps } = await getFailureQueue();

  const allWorkflows = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allWorkflows);
  const statusCounts = getWorkflowCountsByStatus(allWorkflows);

  // Filter workflows for site view
  const siteFilteredWorkflows = currentSite === "all"
    ? allWorkflows
    : allWorkflows.filter((w) => w.siteKey === currentSite);

  // High-Risk Queue (R3, R4 items requiring human sign-off)
  const highRiskQueue = siteFilteredWorkflows
    .filter((w) => w.riskClass === "R3" || w.riskClass === "R4")
    .slice(0, 6);

  const [pendingRes, totalRes] = await Promise.all([
    supabaseAdmin
      .from("automation_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("automation_events")
      .select("*", { count: "exact", head: true }),
  ]);

  const pendingEventsCount = pendingRes.count ?? 0;
  const totalEventsCount = totalRes.count ?? 0;
  const failureCount = failedEvents.length + failedSteps.length;

  const stateUi = STATE_CONFIG[snap.state];

  // Defined Catalog of Platform Automations
  const automationsList: ScheduledAutomation[] = [
    {
      id: "automation_dispatcher",
      name: "Automation Event Dispatcher",
      description:
        "Dispatches pending contract signings, onboarding session triggers, and client provisioning jobs to n8n webhook targets with HMAC v1 signing.",
      category: "Cron Worker",
      schedule: "*/15 * * * *",
      humanSchedule: "every 15m",
      route: "/api/cron/automation-retry",
      status: snap.state === "CONNECTED" ? "Active" : snap.state === "ERROR" ? "Error" : "Paused",
      icon: Zap,
      triggerAction: triggerAutomationDispatcher,
      actionLabel: "Run Dispatcher",
    },
    {
      id: "lead_scoring",
      name: "Lead Auto-Scoring & Intent Engine",
      description:
        "Deterministic intent scoring (0–100) evaluating corporate domains, business scale, budget indicators, and behavioral telemetry for CRM pipeline routing.",
      category: "Scoring Engine",
      schedule: "0 */2 * * *",
      humanSchedule: "every 2h + event-driven",
      route: "/api/crm/scoring",
      status: "Active",
      icon: Calculator,
      triggerAction: triggerLeadScoringBatch,
      actionLabel: "Evaluate Leads",
    },
    {
      id: "invoice_reminders",
      name: "Invoice Due & Overdue Dunning",
      description:
        "Monitors open accounts receivable against net-30 terms, formats payment links, and sends escalating payment notifications to verified client billing contacts.",
      category: "Billing Dunning",
      schedule: "0 10 * * *",
      humanSchedule: "daily 10:00 IST",
      route: "/api/invoices/reminders",
      status: "Active",
      icon: Receipt,
      triggerAction: triggerInvoiceReminders,
      actionLabel: "Check Receivables",
    },
    {
      id: "outreach_followups",
      name: "Client Outreach & Follow-Up Sequencer",
      description:
        "Executes multi-step outreach follow-ups across active campaigns, enforcing frequency capping, unsubscribe suppression, and instant reply pause guards.",
      category: "Outreach Pipeline",
      schedule: "0 9-18 * * 1-5",
      humanSchedule: "hourly business hours",
      route: "/api/cron/outreach-followups",
      status: "Active",
      icon: Send,
      triggerAction: triggerOutreachFollowups,
      actionLabel: "Run Outreach Pass",
    },
    {
      id: "document_render",
      name: "Cryptographic Document Render Pipeline",
      description:
        "Compiles client agreements and statements to PDF, mints cryptographic SHA-256 hashes, and commits immutable audit trails to the document vault.",
      category: "Document Worker",
      schedule: "*/5 * * * *",
      humanSchedule: "every 5m",
      route: "/api/cron/document-render",
      status: "Active",
      icon: FileCheck2,
    },
    {
      id: "email_outbox",
      name: "Transactional SMTP Relay Daemon",
      description:
        "Asynchronous email outbox delivery daemon with sender rotation, circuit breaking, bounce handling, and anti-stuck watchdog safeguards.",
      category: "Cron Worker",
      schedule: "* * * * *",
      humanSchedule: "every 1m",
      route: "/api/cron/email-outbox",
      status: "Active",
      icon: Mail,
    },
    {
      id: "weekly_recognition",
      name: "Weekly Recognition & Executive Synthesis",
      description:
        "Aggregates engineering sprint velocity, milestone accomplishments, and staff peer recognition into weekly executive digest summaries.",
      category: "Cron Worker",
      schedule: "0 9 * * 1",
      humanSchedule: "Mondays 09:00 IST",
      route: "/api/cron/weekly-recognition",
      status: "Active",
      icon: Sparkles,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Zap className="w-3 h-3" />
              Automation Engine
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${stateUi.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stateUi.dot}`} />
              {stateUi.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Automations &amp; Scheduled Pipelines
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Centralized orchestration ledger for background cron daemons, intent auto-scoring triggers, invoice reminders, and error recovery queues.
          </p>
        </div>

        {session.role === "super_admin" && (
          <div className="sm:self-end flex items-center gap-2">
            <ConfigureN8nDialog />
            <ImportButton />
          </div>
        )}
      </div>

      {/* Sub-Navigation Ribbon to All 13 Automation Sub-Modules */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Automation Operations Console
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              13 Modules
            </span>
          </div>
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] hidden sm:inline">
            Direct navigation across pipelines, dead-letter recovery &amp; governance
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/automations/catalog"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Catalog</span>
          </Link>
          <Link
            href="/admin/automations/approvals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approvals</span>
          </Link>
          <Link
            href="/admin/automations/workflows"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Workflows</span>
          </Link>
          <Link
            href="/admin/automations/executions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Executions</span>
          </Link>
          <Link
            href="/admin/automations/schedules"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Schedules</span>
          </Link>
          <Link
            href="/admin/automations/dead-letter"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50/60 text-rose-800 shadow-2xs hover:bg-rose-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Dead Letter DLQ</span>
          </Link>
          <Link
            href="/admin/automations/site-health"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-600" />
            <span>Site Health</span>
          </Link>
          <Link
            href="/admin/automations/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Reports</span>
          </Link>
          <Link
            href="/admin/automations/connectors"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-sky-600" />
            <span>Connectors</span>
          </Link>
          <Link
            href="/admin/automations/deployments"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>Deployments</span>
          </Link>
          <Link
            href="/admin/automations/events"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Events Ledger</span>
          </Link>
          <Link
            href="/admin/automations/n8n"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>n8n Flow</span>
          </Link>
          <Link
            href="/admin/automations/governance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Governance</span>
          </Link>
        </div>
      </div>

      {/* 4-Site Scope Filter */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations" counts={siteCounts} />

      {/* 4-Site Automation Portfolio Overview */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Canonical 4-Site Automation Portfolio
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Synchronized registry of canonical workflow definitions spanning all production digital entities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)]">
              {siteFilteredWorkflows.length} Workflows ({currentSite === "all" ? "All Sites" : currentSite})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Corporate LIT</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">{siteCounts.corporate}</span>
              <TruthfulStatusBadge status="Active" size="sm" />
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Healthcare AI</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">{siteCounts.healthcare}</span>
              <TruthfulStatusBadge status="Active" size="sm" />
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Logic Voice</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">{siteCounts.logic_voice}</span>
              <TruthfulStatusBadge status="Active" size="sm" />
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">VoiceShield (Active)</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">{siteCounts.voice_shield}</span>
              <TruthfulStatusBadge status="Active" size="sm" />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
            <span>Active: <strong className="text-emerald-700">{statusCounts.Active}</strong></span>
            <span>Staged: <strong className="text-blue-700">{statusCounts.Staged}</strong></span>
            <span>Paused: <strong className="text-amber-700">{statusCounts.Paused}</strong></span>
            <span>Deprecated: <strong className="text-slate-500">{statusCounts.Deprecated}</strong></span>
          </div>
          <a
            href="/admin/automations/catalog"
            className="inline-flex items-center gap-1 font-semibold text-[var(--lit-blue,#1565C0)] hover:underline"
          >
            <span>Explore Full 178-Workflow Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Managed Automations */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Scheduled Pipelines
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Cpu className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {automationsList.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Active cron daemons &amp; triggers</p>
          </div>
        </div>

        {/* n8n Workflows */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Blueprint Instances
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {snap.workflows.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {snap.state === "CONNECTED" ? "Synchronized on engine" : "Engine unconfigured"}
            </p>
          </div>
        </div>

        {/* Total Events */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Dispatched Events
            </span>
            <span className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {totalEventsCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              <span className="font-mono font-semibold text-amber-700">{pendingEventsCount} pending</span> in queue
            </p>
          </div>
        </div>

        {/* Failure Queue */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Failure Queue
            </span>
            <span
              className={`p-1.5 rounded-lg border ${
                failureCount > 0
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {failureCount > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
            </span>
          </div>
          <div className="mt-4">
            <span
              className={`text-3xl font-extrabold font-mono tracking-tight ${
                failureCount > 0 ? "text-rose-600" : "text-[var(--lit-navy,#0B2545)]"
              }`}
            >
              {failureCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {failureCount > 0 ? "Items require attention" : "All pipelines healthy"}
            </p>
          </div>
        </div>
      </div>

      {/* Engine Status & Diagnostic Banner */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)] mt-0.5">
            <Server className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                n8n Workflow Execution Runtime
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-mono font-bold uppercase border ${stateUi.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${stateUi.dot}`} />
                {snap.state}
              </span>
            </div>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              {snap.detail}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                Liveness:{" "}
                {snap.healthy === null ? (
                  <span className="text-slate-400 font-semibold">Not Evaluated</span>
                ) : snap.healthy ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Healthy
                  </span>
                ) : (
                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> Unreachable
                  </span>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Zero-Payload Privacy Guard Active
              </span>
            </div>
          </div>
        </div>

        {snap.state !== "CONNECTED" && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 text-xs text-amber-950 max-w-md shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {snap.state === "ERROR" ? "Authentication Required" : "Setup Required"}
              </span>
              {session.role === "super_admin" && (
                <ConfigureN8nDialog
                  triggerButtonText="Connect Key"
                  triggerButtonClass="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-2xs transition-colors"
                />
              )}
            </div>
            <p className="text-[11px] text-amber-900 mt-1">
              {snap.state === "ERROR"
                ? "The n8n instance is reachable but the API key responded 401. Click 'Connect Key' to link your Public API Key."
                : "Set N8N_BASE_URL and N8N_API_KEY or click Connect Key to configure this engine."}
            </p>
          </div>
        )}
      </div>

      {/* Main Section: Automations Grid / Catalog */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
              Automated Pipelines &amp; Background Daemons
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Scheduled cron workers, deterministic scoring matrices, billing dunning engines, and outreach sequencers.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            Total configured: {automationsList.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automationsList.map((auto) => {
            const Icon = auto.icon;
            return (
              <div
                key={auto.id}
                className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)]">
                        <Icon className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-blue,#1565C0)]">
                          {auto.category}
                        </span>
                        <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                          {auto.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${
                        auto.status === "Active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : auto.status === "Paused"
                            ? "border-slate-200 bg-slate-50 text-slate-700"
                            : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          auto.status === "Active"
                            ? "bg-emerald-500"
                            : auto.status === "Paused"
                              ? "bg-slate-400"
                              : "bg-rose-500"
                        }`}
                      />
                      {auto.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                    {auto.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                        {auto.schedule}
                      </span>
                      <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                        ({auto.humanSchedule})
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Target: {auto.route}
                    </div>
                  </div>

                  {auto.triggerAction && (
                    <form action={auto.triggerAction}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-white hover:border-[var(--lit-border-light,#DFE7EF)] shadow-2xs transition-all"
                      >
                        <Play className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                        <span>{auto.actionLabel ?? "Run Now"}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* n8n Active Workflows Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            n8n Registered Workflow Blueprints
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Active workflows provisioned on the connected n8n automation runtime.
          </p>
        </div>

        {snap.state === "CONNECTED" ? (
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Workflow Blueprint</th>
                    <th className="px-5 py-3 font-semibold">Runtime Identifier</th>
                    <th className="px-5 py-3 font-semibold">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                  {snap.workflows.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[var(--lit-navy,#0B2545)]">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{w.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">{w.id}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            w.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              w.active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {w.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {snap.workflows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-slate-500">
                        No workflow blueprints found on the connected instance.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs text-center space-y-2">
            <Server className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
              Workflow Engine Offline or Not Configured
            </p>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
              {snap.state === "NOT CONFIGURED"
                ? "Set N8N_BASE_URL and N8N_API_KEY environment variables to inspect registered workflows."
                : "The n8n instance could not be reached. Ensure the service is healthy and the API token has administrative permissions."}
            </p>
          </div>
        )}
      </section>

      {/* High-Risk Governance Queue */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                Dual-Control &amp; High-Risk Operations
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                R3 / R4 Gatekeeper
              </span>
            </div>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              High-consequence automations requiring explicit dual-control authorization before deployment or invocation.
            </p>
          </div>
          <a
            href="/admin/automations/approvals"
            className="text-xs font-semibold text-[var(--lit-blue,#1565C0)] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Approvals Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Workflow ID</th>
                  <th className="px-5 py-3 font-semibold">Name &amp; Category</th>
                  <th className="px-5 py-3 font-semibold">Entity</th>
                  <th className="px-5 py-3 font-semibold">Risk Class</th>
                  <th className="px-5 py-3 font-semibold">Gate Control</th>
                  <th className="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {highRiskQueue.map((w) => (
                  <tr key={w.workflowId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                      <a href={`/admin/automations/workflows/${w.workflowId}`} className="text-[var(--lit-blue,#1565C0)] hover:underline">
                        {w.workflowId}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--lit-navy,#0B2545)]">
                      <div className="font-semibold">{w.name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{w.category}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {w.siteName}
                    </td>
                    <td className="px-5 py-3.5">
                      <RiskTierBadge riskClass={w.riskClass} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-[11px]">
                      {w.requiresApproval ? (
                        <span className="font-semibold text-amber-800">Dual-Signoff Required</span>
                      ) : (
                        <span className="text-slate-500">Automated Guarded</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <TruthfulStatusBadge status={w.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Failure Recovery Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
              Failure Recovery Queue
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Automation events and provisioning pipeline steps marked failed or dead-lettered. Retrying re-queues them into pending state.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[var(--lit-navy,#0B2545)] shadow-2xs">
            {failureCount} items
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Entity / Type</th>
                  <th className="px-5 py-3 font-semibold">Identifier / Action</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Failed At</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {failedEvents.map((e) => (
                  <tr key={`event-${e.id}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                        Event
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[var(--lit-navy,#0B2545)]">
                      {e.event_type}
                      <span className="block font-mono text-[10px] text-slate-400 font-normal mt-0.5">
                        {e.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          e.status === "dead_letter"
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.status === "dead_letter" ? "bg-rose-500" : "bg-amber-500"
                          }`}
                        />
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {formatIST(e.created_at, "datetime")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={retryAutomationEvent}>
                        <input type="hidden" name="eventId" value={e.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-white hover:border-[var(--lit-border-light,#DFE7EF)] shadow-2xs transition-all"
                        >
                          <RefreshCw className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                          <span>Retry Event</span>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {failedSteps.map((s) => (
                  <tr key={`step-${s.id}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        Step
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[var(--lit-navy,#0B2545)]">
                      {s.step}
                      <span className="block font-mono text-[10px] text-slate-400 font-normal mt-0.5">
                        {s.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-rose-200 bg-rose-50 text-rose-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {formatIST(s.created_at, "datetime")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={retryProvisioningStep}>
                        <input type="hidden" name="stepId" value={s.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-white hover:border-[var(--lit-border-light,#DFE7EF)] shadow-2xs transition-all"
                        >
                          <RefreshCw className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                          <span>Retry Step</span>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {failedEvents.length === 0 && failedSteps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="p-3 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="w-6 h-6" />
                        </span>
                        <p className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                          Failure Queue is Clear
                        </p>
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm">
                          All background events, provisioning steps, and cron pipeline triggers are executing nominally without unhandled exceptions.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Super Admin Blueprint Import Callout */}
      {session.role === "super_admin" && (
        <section className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                Blueprint Synchronization &amp; Deployment
              </h3>
            </div>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-2xl">
              Sync repository automation definitions (<code className="font-mono text-slate-800">contract-signed.json</code>, <code className="font-mono text-slate-800">onboarding-submitted.json</code>) into your active n8n instance. Existing active instances remain untouched.
            </p>
          </div>
          <ImportButton />
        </section>
      )}
    </div>
  );
}
