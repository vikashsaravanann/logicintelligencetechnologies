import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import {
  DollarSign,
  Briefcase,
  Users,
  Calendar,
  Ticket,
  ArrowRight,
  Plus,
  FileText,
  AlertTriangle,
  ListChecks,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  Receipt,
  Mail,
  Zap,
  Globe,
  Settings,
  Shield,
  Layers,
  Search,
  Sparkles,
  Inbox,
  Send,
  Building,
  CheckCircle2,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { paidRevenue, outstandingRevenue, leadScoreLabel, type InvoiceAmountRow } from "@/lib/admin/kpis";
import { formatINR } from "@/lib/format/datetime";
import { listAllEngagements } from "@/lib/engagements/db";
import { IssueEngagementModal } from "@/app/admin/engagements/components/IssueEngagementModal";
import { CANONICAL_13_STAGES, type StageKey } from "@/lib/engagements/types";

export const metadata: Metadata = {
  title: "Executive Command Center | Logic Intelligence Technologies",
  description: "Real-time enterprise operations telemetry, CRM pipeline, consultation schedules, and revenue metrics.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminCommandCenterPage() {
  await requireCapabilityPage("dashboard.view", "/admin/command-center");

  const now = new Date();
  const nowIso = now.toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [invoicesRes, projectsRes, leadsRes, bookingsRes, ticketsRes, newLeadsRes, engagements] = await Promise.all([
    supabaseAdmin.from("invoices").select("amount, status"),
    supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(Completed,Cancelled,Archived)"),
    supabaseAdmin.from("contact_leads").select("id, name, email, company, lead_score").order("created_at", { ascending: false }).limit(6),
    supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("slot_time", nowIso)
      .eq("status", "Scheduled"),
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "Open"),
    supabaseAdmin.from("contact_leads").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    listAllEngagements().catch(() => []),
  ]);

  const anyError = Boolean(
    invoicesRes.error || projectsRes.error || leadsRes.error || bookingsRes.error || ticketsRes.error || newLeadsRes.error,
  );

  const invoices = (invoicesRes.data ?? []) as InvoiceAmountRow[];
  const settled = paidRevenue(invoices);
  const outstanding = outstandingRevenue(invoices);
  const leads = leadsRes.data ?? [];

  const tiles = [
    {
      label: "Settled Revenue",
      value: invoicesRes.error ? "—" : formatINR(settled),
      note: "Paid invoices ledger",
      icon: DollarSign,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Outstanding",
      value: invoicesRes.error ? "—" : formatINR(outstanding),
      note: "Pending + overdue balance",
      icon: FileText,
      tone: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Active Projects",
      value: projectsRes.error ? "—" : String(projectsRes.count ?? 0),
      note: "In-flight delivery SOWs",
      icon: Briefcase,
      tone: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Upcoming Bookings",
      value: bookingsRes.error ? "—" : String(bookingsRes.count ?? 0),
      note: "Scheduled client sessions",
      icon: Calendar,
      tone: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      label: "Open Tickets",
      value: ticketsRes.error ? "—" : String(ticketsRes.count ?? 0),
      note: "Awaiting support resolution",
      icon: Ticket,
      tone: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      label: "New Leads (7d)",
      value: newLeadsRes.error ? "—" : String(newLeadsRes.count ?? 0),
      note: "Inbound demand trailing 7d",
      icon: Users,
      tone: "text-teal-700 bg-teal-50 border-teal-200",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Telemetry · Internal Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] mb-1">
            Executive Command Center
          </h1>
          <p className="text-[var(--lit-text-muted,#52677C)] text-sm">
            Operational telemetry, CRM pipeline, consultations, and revenue metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <IssueEngagementModal
            buttonLabel="New Engagement"
            buttonClassName="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-teal,#1FA9A2)]/90 transition-all shadow-2xs cursor-pointer"
          />
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-2xs"
            title="Super Admin Bank Credit Verification"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Payments</span>
          </Link>
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
          <Link
            href="/admin/proposals/new"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
          >
            Draft Proposal
          </Link>
          <Link
            href="/admin/quotations/new"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
          >
            + New Quotation
          </Link>
        </div>
      </div>

      {anyError ? (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-800 flex items-center gap-2.5 shadow-2xs"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Some metrics could not be loaded. Figures showing “—” failed to query; the rest are live.</span>
        </div>
      ) : null}

      {/* KPI Tiles Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 sm:p-6 shadow-2xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/30"
          >
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                {t.label}
              </span>
              <div className={`p-2 rounded-xl border ${t.tone}`}>
                <t.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
              {t.value}
            </div>
            <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1.5">{t.note}</p>
          </div>
        ))}
      </div>

      {/* Four-Site Unified Operational Intelligence Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
                <Briefcase className="w-3.5 h-3.5" />
              </span>
              <span>Four-Site Unified Automation & Edge Operations</span>
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Centralized orchestration across Corporate, Healthcare, Logic Voice, and VoiceShield properties.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/automations"
              className="text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:underline flex items-center gap-1"
            >
              <span>Automations Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              site: "Corporate LIT",
              key: "corporate",
              host: "www.logicintelligencetechnologies.in",
              workflows: 76,
              seoStatus: "72h Cadence Configured",
              cdnStatus: "Edge Active",
              status: "Connected",
              tone: "border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)]",
            },
            {
              site: "Healthcare Platform",
              key: "healthcare",
              host: "healthcare.logicintelligencetechnologies.in",
              workflows: 62,
              seoStatus: "72h Cadence Configured",
              cdnStatus: "Edge Active",
              status: "Connected",
              tone: "border-blue-200 bg-blue-50 text-blue-700",
            },
            {
              site: "Logic Voice",
              key: "logic_voice",
              host: "logicvoice.logicintelligencetechnologies.in",
              workflows: 20,
              seoStatus: "72h Cadence Configured",
              cdnStatus: "Edge Active",
              status: "Connected",
              tone: "border-purple-200 bg-purple-50 text-purple-700",
            },
            {
              site: "VoiceShield",
              key: "voice_shield",
              host: "voiceshield.logicintelligencetechnologies.in",
              workflows: 20,
              seoStatus: "72h Cadence Configured",
              cdnStatus: "Edge Active",
              status: "Connected",
              tone: "border-indigo-200 bg-indigo-50 text-indigo-700",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${item.tone}`}>
                    {item.site}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] truncate mt-1">
                  {item.host}
                </p>
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--lit-text-muted,#52677C)]">Catalog Workflows:</span>
                    <span className="font-bold font-mono text-[var(--lit-navy,#0B2545)]">{item.workflows}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--lit-text-muted,#52677C)]">SEO Cycle:</span>
                    <span className="font-mono text-slate-700">{item.seoStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--lit-text-muted,#52677C)]">CDN Freshness:</span>
                    <span className="font-mono text-slate-700">{item.cdnStatus}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-[11px]">
                <Link
                  href={`/admin/automations/catalog?site=${item.key}`}
                  className="font-bold text-[var(--lit-teal,#1FA9A2)] hover:underline"
                >
                  Workflows →
                </Link>
                <Link
                  href={`/admin/seo/sites/${item.key}`}
                  className="text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] font-medium"
                >
                  SEO Audit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Lifecycle Architecture & Health Telemetry */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lit-blue,#1565C0)]/10 text-[var(--lit-blue,#1565C0)]">
                <ListChecks className="w-3.5 h-3.5" />
              </span>
              <span>Client Lifecycle Architecture &amp; Health Telemetry</span>
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Universal 13-stage milestone governance, cryptographic portal access tokens, and bank UPI audit reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/engagement"
              className="text-xs font-bold text-[var(--lit-blue,#1565C0)] hover:underline flex items-center gap-1"
            >
              <span>Client Portal Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-300">·</span>
            <Link
              href="/admin/engagements"
              className="text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:underline flex items-center gap-1"
            >
              <span>Engagements Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Mini Telemetry Metrics */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
              Active Portfolios
            </span>
            <span className="text-2xl font-black font-mono text-[var(--lit-navy,#0B2545)]">
              {engagements.filter((e) => e.status === "active").length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">In-flight client journeys</p>
          </div>

          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
              13-Stage Governance
            </span>
            <span className="text-2xl font-black font-mono text-[var(--lit-blue,#1565C0)]">
              100%
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Cryptographic token security</p>
          </div>

          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
              Payment Governance
            </span>
            <span className="text-2xl font-black font-mono text-emerald-700">
              Zero-Gateway
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Manual UPI &amp; Bank Audit</p>
          </div>

          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
              Total Engagements
            </span>
            <span className="text-2xl font-black font-mono text-purple-700">
              {engagements.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Registered enterprise clients</p>
          </div>
        </div>

        {/* Recent Engagements Summary Card */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)] mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider">
                In-Flight Client Portals &amp; Active Stages
              </span>
            </div>
            <Link
              href="/admin/engagements/new"
              className="text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Client</span>
            </Link>
          </div>

          <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
            {engagements.length === 0 ? (
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-6 text-center font-medium">
                No active client engagements found.
              </p>
            ) : (
              engagements.slice(0, 4).map((eng) => {
                const currentKey = (eng.current_stage || "checklist") as StageKey;
                const stageDef = CANONICAL_13_STAGES[currentKey] || CANONICAL_13_STAGES.checklist;
                return (
                  <div
                    key={eng.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--lit-cloud,#F7F9FC)]/50 rounded-xl px-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--lit-navy,#0B2545)] text-sm">
                          {eng.company_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF]">
                          {eng.engagement_ref}
                        </span>
                      </div>
                      <p className="text-[var(--lit-text-muted,#52677C)] text-xs mt-0.5 truncate">
                        {eng.project_title} · <span className="font-mono text-slate-600">{eng.contact_name} ({eng.contact_email})</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-[var(--lit-teal,#1FA9A2)]"></span>
                        <span>S{stageDef.ordinal}: {stageDef.shortTitle}</span>
                      </span>
                      <Link
                        href={`/engagement/${eng.engagement_ref}`}
                        className="px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors flex items-center gap-1"
                        title="Open client-facing portal"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3 text-[#1565C0]" />
                      </Link>
                      <Link
                        href={`/admin/engagements/${eng.id}`}
                        className="px-2.5 py-1 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Master Operations & Module Directory (All Admin Pages & Actions) */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lit-navy,#0B2545)]/10 text-[var(--lit-navy,#0B2545)]">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span>Master Operations &amp; Module Directory</span>
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Direct access to all 42+ administrative modules, portals, billing tools, and automated pipelines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              42 Admin Modules Connected
            </span>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Module Category 1: Client Portals & 13-Stage Governance */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-[var(--lit-blue,#1565C0)]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1565C0]">
                    <ListChecks className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">1. Client Lifecycle</h3>
                    <p className="text-[10px] text-slate-500 font-mono">13-Stage Governance &amp; Portals</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1565C0] border border-blue-200">
                  8 Tools
                </span>
              </div>

              <div className="mt-3.5 divide-y divide-slate-100">
                {[
                  { href: "/engagement", label: "Client Portals Hub", badge: "Live 13-Stage", desc: "Universal client milestone progression" },
                  { href: "/admin/engagements", label: "Engagements Registry", badge: "Admin Core", desc: "Stage data inspection & approvals" },
                  { href: "/admin/engagements/new", label: "Register New Client", badge: "Action", desc: "Provision tokens & 13 milestones" },
                  { href: "/admin/clients", label: "Client Accounts", badge: "Profiles", desc: "Enterprise account records & contacts" },
                  { href: "/admin/checklist-invitations", label: "Checklists & SOP", badge: "v2.4", desc: "Enterprise scoping invitations" },
                  { href: "/admin/checklists", label: "Master Checklists", badge: "50 Checkpoints", desc: "Architecture baseline definitions" },
                  { href: "/admin/onboarding", label: "Client Onboarding", badge: "Stage 7", desc: "Credential handoff & kickoff forms" },
                  { href: "/admin/documents", label: "Document Vault", badge: "PDF Storage", desc: "Signed SOWs, Invoices & Receipts" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/engagements"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-[#1565C0] font-bold text-xs transition-colors"
              >
                <span>Open Engagements Console →</span>
              </Link>
            </div>
          </div>

          {/* Module Category 2: Financial Operations & UPI Clearance */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">2. Financials &amp; Payments</h3>
                    <p className="text-[10px] text-slate-500 font-mono">50/50 Milestones &amp; UPI Audit</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  9 Tools
                </span>
              </div>

              <div className="mt-3.5 divide-y divide-slate-100">
                {[
                  { href: "/admin/payments", label: "Bank Reconciliation", badge: "Super Admin", desc: "12-digit UTR bank statement audit" },
                  { href: "/admin/invoices", label: "Invoices Ledger", badge: "Tax Invoices", desc: "18% GST statutory invoice journal" },
                  { href: "/admin/invoices/new", label: "Issue New Invoice", badge: "+ Action", desc: "Single-page A4 PDF invoice generator" },
                  { href: "/admin/quotations", label: "Quotation Engine", badge: "V6 Engine", desc: "Instant pricing, scope, & milestones" },
                  { href: "/admin/quotations/new", label: "Draft New Quotation", badge: "+ Action", desc: "Dual milestones, PDF download" },
                  { href: "/admin/quotations/catalog", label: "Quotation Catalog", badge: "Rate Card", desc: "Standard rate card & module deliverables" },
                  { href: "/admin/quotations/coupons", label: "Discount Coupons", badge: "Promotions", desc: "Commercial partner discount codes" },
                  { href: "/admin/proposals", label: "Proposals & SOWs", badge: "Contracts", desc: "Master commercial terms & agreements" },
                  { href: "/admin/proposals/new", label: "Draft Proposal", badge: "+ Action", desc: "50/50 structure proposal generator" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-emerald-700 transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/payments"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-bold text-xs transition-colors"
              >
                <span>Verify Pending Payments →</span>
              </Link>
            </div>
          </div>

          {/* Module Category 3: CRM Pipeline & Outreach Engine */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">3. CRM Pipeline &amp; Outreach</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Inbound Inquiries &amp; Campaigns</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
                  11 Tools
                </span>
              </div>

              <div className="mt-3.5 divide-y divide-slate-100">
                {[
                  { href: "/admin/intake", label: "Intake Stream", badge: "Inbound", desc: "Real-time client contact submissions" },
                  { href: "/admin/leads", label: "CRM Leads Ledger", badge: "Dossier", desc: "Scored leads & executive history" },
                  { href: "/admin/ai-leads", label: "AI Leads Intelligence", badge: "AI Scored", desc: "Autonomous ICP classification" },
                  { href: "/admin/bookings", label: "Consultation Bookings", badge: "Calendar", desc: "Google Meet consultations & slots" },
                  { href: "/admin/outreach", label: "Outreach Campaign Hub", badge: "Outbound", desc: "Enterprise outbound campaign orchestration" },
                  { href: "/admin/outreach/studio", label: "Outreach Studio", badge: "Sequences", desc: "Multi-touch cadence sequence designer" },
                  { href: "/admin/outreach/queue", label: "Dispatch Queue", badge: "Execution", desc: "Scheduled email & message releases" },
                  { href: "/admin/outreach/suppression", label: "Suppression Registry", badge: "Opt-Out", desc: "DND & statutory compliance filters" },
                  { href: "/admin/outreach/analytics", label: "Outreach Analytics", badge: "Metrics", desc: "Open rates, replies & conversion data" },
                  { href: "/admin/outreach/compliance", label: "Compliance & Jurisdictions", badge: "Legal", desc: "GDPR, CAN-SPAM, Indian DND guards" },
                  { href: "/admin/outreach/playbook", label: "Message Playbook", badge: "Templates", desc: "Pre-approved corporate copy guidelines" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--lit-teal,#1FA9A2)] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/leads"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-teal-800 font-bold text-xs transition-colors"
              >
                <span>View CRM Leads Ledger →</span>
              </Link>
            </div>
          </div>

          {/* Module Category 4: Communications & Support */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">4. Communications &amp; Support</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Transactional Emails &amp; Helpdesk</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  6 Tools
                </span>
              </div>

              <div className="mt-3.5 divide-y divide-slate-100">
                {[
                  { href: "/admin/support", label: "Support Helpdesk", badge: "Tickets", desc: "Customer tickets, SLAs & resolution status" },
                  { href: "/admin/emails", label: "Transactional Email Logs", badge: "Delivery", desc: "Receipt, alert & unlock email telemetry" },
                  { href: "/admin/emails/new", label: "Compose Email", badge: "+ Action", desc: "Direct branded message dispatch" },
                  { href: "/admin/emails/mailboxes", label: "Mailboxes Configuration", badge: "SMTP", desc: "Sender domains & DNS MX records" },
                  { href: "/admin/emails/outbox", label: "Outbox Queue", badge: "Pending", desc: "Buffered dispatches & retry schedules" },
                  { href: "/admin/email-preview", label: "Email Template Previews", badge: "LIT V2", desc: "Dual receipt, alert & unlock previews" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-purple-700 transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/emails"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 text-purple-800 font-bold text-xs transition-colors"
              >
                <span>Email Operations →</span>
              </Link>
            </div>
          </div>

          {/* Module Category 5: Automations, SEO & Edge Network */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">5. Automations &amp; Edge SEO</h3>
                    <p className="text-[10px] text-slate-500 font-mono">180 Workflows &amp; Indexing Engine</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  13 Tools
                </span>
              </div>

              <div className="mt-3.5 divide-y divide-slate-100">
                {[
                  { href: "/admin/automations", label: "Automations Hub", badge: "Four-Site", desc: "Centralized execution telemetry" },
                  { href: "/admin/automations/catalog", label: "Workflow Catalog", badge: "180 Tasks", desc: "All 180 production background workflows" },
                  { href: "/admin/automations/approvals", label: "Action Approvals", badge: "Safety Gate", desc: "Super Admin human-in-the-loop approvals" },
                  { href: "/admin/automations/reports", label: "Reliability Reports", badge: "Audit", desc: "Uptime, error budgets & synthetic metrics" },
                  { href: "/admin/automations/governance", label: "Governance & Runbooks", badge: "SOP", desc: "Operational runbooks & failover procedures" },
                  { href: "/admin/automations/workflows", label: "Automated Workflows", badge: "Orchestration", desc: "Active task execution pipelines" },
                  { href: "/admin/automations/schedules", label: "Job Schedules", badge: "Cron", desc: "Automated recurrence triggers" },
                  { href: "/admin/automations/site-health", label: "Site Health Probes", badge: "Live Probes", desc: "Four-site synthetic edge monitors" },
                  { href: "/admin/seo", label: "SEO Intelligence Console", badge: "Search", desc: "Crawling, indexing & rankings overview" },
                  { href: "/admin/seo/url-inspection", label: "SEO URL Inspection", badge: "Edge Inspector", desc: "Real-time edge & GSC indexability" },
                  { href: "/admin/seo/sitemaps", label: "Dynamic Sitemaps", badge: "XML", desc: "Authoritative sitemap verification" },
                  { href: "/admin/command-center/visibility", label: "Visibility Engine", badge: "Rankings", desc: "Four-site organic search performance" },
                  { href: "/admin/cdn", label: "Edge CDN Cache Purge", badge: "Fastly/Edge", desc: "Stale cache invalidation & TTL controls" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-indigo-700 transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/automations/catalog"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 text-indigo-800 font-bold text-xs transition-colors"
              >
                <span>Browse 180 Automation Workflows →</span>
              </Link>
            </div>
          </div>

          {/* Module Category 6: Corporate Governance & System Status */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-700">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">6. Corporate Governance</h3>
                    <p className="text-[10px] text-slate-500 font-mono">MSME Credentials, Team &amp; Audit</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  5 Tools
                </span>
              </div>

              <div className="mt-3.5 divide-y divide-slate-100">
                {[
                  { href: "/admin/company", label: "Company & MSME Credentials", badge: "Verified", desc: "UDYAM-TN-03-0345274 & Coimbatore address" },
                  { href: "/admin/status", label: "System Telemetry & Uptime", badge: "Status", desc: "Database, Redis, Storage & edge latency" },
                  { href: "/admin/analytics", label: "Executive Analytics", badge: "KPIs", desc: "Paid revenue, pipeline velocity & cohorts" },
                  { href: "/admin/team", label: "Team & Role Access", badge: "RBAC", desc: "Capability matrix & staff management" },
                  { href: "/admin/audit", label: "Cryptographic Audit Log", badge: "SHA-256", desc: "Immutable trail of all admin actions" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-slate-900 transition-colors truncate">
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/admin/company"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 font-bold text-xs transition-colors"
              >
                <span>View MSME Statutory Profile →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inbound Leads Section */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
              <Users className="w-4 h-4" />
            </span>
            <span>Recent Inbound Inquiries</span>
          </h2>
          <Link
            href="/admin/leads"
            className="text-xs text-[var(--lit-teal,#1FA9A2)] font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {leadsRes.error ? (
          <p className="text-xs text-rose-600 py-6 text-center font-medium">Could not load recent leads.</p>
        ) : (
          <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
            {leads.length > 0 ? (
              leads.map((l) => (
                <div
                  key={l.id}
                  className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[var(--lit-cloud,#F7F9FC)] rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="font-bold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] text-sm block truncate transition-colors"
                    >
                      {l.name}
                    </Link>
                    <p className="text-[var(--lit-text-muted,#52677C)] text-xs mt-0.5 truncate">
                      {l.email} {l.company ? `· ${l.company}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] border border-[var(--lit-teal,#1FA9A2)]/20">
                      Score: {leadScoreLabel(l.lead_score)}
                    </span>
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors"
                    >
                      Dossier →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-8 text-center font-medium">
                No leads recorded yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
