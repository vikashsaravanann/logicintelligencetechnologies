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
import { MasterModuleDirectory } from "./components/MasterModuleDirectory";
import { filterModuleCategoriesForRole } from "@/config/module-directory";

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
  const session = await requireCapabilityPage("dashboard.view", "/admin/command-center");
  const isSuperAdmin = session.role === "super_admin";

  const now = new Date();
  const nowIso = now.toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [invoicesRes, projectsRes, leadsRes, bookingsRes, ticketsRes, newLeadsRes, rawEngagements] = await Promise.all([
    isSuperAdmin ? supabaseAdmin.from("invoices").select("amount, status") : Promise.resolve({ data: [], error: null }),
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

  // AUTH13: Scope engagements for non-superadmin staff to assigned projects
  let engagements = rawEngagements;
  if (!isSuperAdmin) {
    const { data: assignments } = await supabaseAdmin
      .from("staff_client_assignments")
      .select("engagement_id, expires_at")
      .eq("staff_user_id", session.userId)
      .eq("status", "active");

    const validEngagementIds = (assignments || [])
      .filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now())
      .map((a) => a.engagement_id);

    engagements = rawEngagements.filter((e: any) => validEngagementIds.includes(e.id));
  }

  const anyError = Boolean(
    invoicesRes.error || projectsRes.error || leadsRes.error || bookingsRes.error || ticketsRes.error || newLeadsRes.error,
  );

  const invoices = (invoicesRes.data ?? []) as InvoiceAmountRow[];
  const settled = isSuperAdmin ? paidRevenue(invoices) : 0;
  const outstanding = isSuperAdmin ? outstandingRevenue(invoices) : 0;
  const leads = leadsRes.data ?? [];

  const tiles = [
    {
      label: "Settled Revenue",
      value: !isSuperAdmin ? "Restricted" : (invoicesRes.error ? "—" : formatINR(settled)),
      note: !isSuperAdmin ? "Founder / Super Admin only" : "Paid invoices ledger",
      icon: DollarSign,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Outstanding",
      value: !isSuperAdmin ? "Restricted" : (invoicesRes.error ? "—" : formatINR(outstanding)),
      note: !isSuperAdmin ? "Founder / Super Admin only" : "Pending + overdue balance",
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
            href="/admin/engagements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-2xs"
          >
            <ListChecks className="w-4 h-4" />
            <span>Engagements</span>
          </Link>
          <Link
            href="/admin/workspaces/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-teal,#1FA9A2)]/90 transition-all shadow-2xs"
            title="Create Staff Admin Workspace"
          >
            <Plus className="w-4 h-4" />
            <span>New Staff Workspace</span>
          </Link>
          <Link
            href="/admin/workspaces"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
            title="Staff Workspaces Directory"
          >
            <Users className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Workspaces</span>
          </Link>
          <Link
            href="/engagement"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#1565C0] transition-all shadow-2xs"
            title="Client 13-Stage Portal Hub"
          >
            <ExternalLink className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Portals Hub</span>
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
          <Link
            href="/admin/leads"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-teal-800 font-bold text-xs uppercase tracking-wider hover:bg-teal-50 hover:border-teal-300 transition-all shadow-2xs"
          >
            CRM Leads
          </Link>
          <Link
            href="/admin/seo/url-inspection"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-cyan-800 font-bold text-xs uppercase tracking-wider hover:bg-cyan-50 hover:border-cyan-300 transition-all shadow-2xs"
          >
            SEO Inspect
          </Link>
          <Link
            href="/admin/status"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
          >
            Status
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

      {/* Master Operations & Module Directory (Filtered server-side to staff session capabilities) */}
      <MasterModuleDirectory
        role={session.role}
        categories={filterModuleCategoriesForRole(session.role)}
      />

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
