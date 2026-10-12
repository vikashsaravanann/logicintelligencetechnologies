import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import { DollarSign, Briefcase, Users, Calendar, Ticket, ArrowRight, Plus, FileText, AlertTriangle } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { paidRevenue, outstandingRevenue, leadScoreLabel, type InvoiceAmountRow } from "@/lib/admin/kpis";
import { formatINR } from "@/lib/format/datetime";

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

  const [invoicesRes, projectsRes, leadsRes, bookingsRes, ticketsRes, newLeadsRes] = await Promise.all([
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
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
        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
          <Link
            href="/admin/proposals/new"
            className="px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
          >
            Draft Proposal
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

      {/* Quick Launchpad Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/admin/leads", label: "CRM Leads Ledger" },
          { href: "/admin/invoices", label: "Invoices" },
          { href: "/admin/bookings", label: "Calendar Bookings" },
          { href: "/admin/proposals", label: "Proposals & SOWs" },
          { href: "/admin/automations/catalog", label: "Workflow Catalog (180)" },
          { href: "/admin/seo", label: "SEO Intelligence" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="p-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-[var(--lit-teal,#1FA9A2)]/50 transition-all flex items-center justify-between text-xs font-bold text-[var(--lit-navy,#0B2545)] shadow-2xs group"
          >
            <span>{q.label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
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
