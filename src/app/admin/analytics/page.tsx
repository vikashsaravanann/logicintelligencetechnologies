import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  Users,
  FileText,
  DollarSign,
  Calendar,
  Ticket,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Operations Analytics | Logic Intelligence Technologies",
  description: "Deterministic operational metrics across leads, proposals, invoices, consultations, and support pipelines.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function tally(rows: Array<Record<string, unknown>> | null, key: string): Array<[string, number]> {
  const counts: Record<string, number> = {};
  for (const r of rows ?? []) {
    const v = String(r[key] ?? "unknown");
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default async function AnalyticsPage() {
  await requireCapabilityPage("analytics.read", "/admin/analytics");

  const [leadsRes, proposalsRes, invoicesRes, bookingsRes, ticketsRes] = await Promise.all([
    supabaseAdmin.from("contact_leads").select("lifecycle_stage"),
    supabaseAdmin.from("proposals").select("status"),
    supabaseAdmin.from("invoices").select("status"),
    supabaseAdmin.from("bookings").select("status"),
    supabaseAdmin.from("support_tickets").select("status"),
  ]);

  const anyError = Boolean(
    leadsRes.error || proposalsRes.error || invoicesRes.error || bookingsRes.error || ticketsRes.error,
  );

  const totalLeads = leadsRes.data?.length ?? 0;
  const totalProposals = proposalsRes.data?.length ?? 0;
  const totalInvoices = invoicesRes.data?.length ?? 0;
  const totalBookings = bookingsRes.data?.length ?? 0;
  const totalTickets = ticketsRes.data?.length ?? 0;

  const tiles = [
    {
      label: "Leads",
      total: totalLeads,
      err: Boolean(leadsRes.error),
      icon: Users,
      tone: "text-teal-700 bg-teal-50 border-teal-200",
      description: "Inbound CRM prospects",
    },
    {
      label: "Proposals",
      total: totalProposals,
      err: Boolean(proposalsRes.error),
      icon: FileText,
      tone: "text-blue-700 bg-blue-50 border-blue-200",
      description: "Digital SOW agreements",
    },
    {
      label: "Invoices",
      total: totalInvoices,
      err: Boolean(invoicesRes.error),
      icon: DollarSign,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      description: "Billing & settlement ledger",
    },
    {
      label: "Bookings",
      total: totalBookings,
      err: Boolean(bookingsRes.error),
      icon: Calendar,
      tone: "text-purple-700 bg-purple-50 border-purple-200",
      description: "Consultation schedule",
    },
    {
      label: "Tickets",
      total: totalTickets,
      err: Boolean(ticketsRes.error),
      icon: Ticket,
      tone: "text-rose-700 bg-rose-50 border-rose-200",
      description: "Enterprise client requests",
    },
  ];

  const breakdowns: Array<{
    title: string;
    total: number;
    rows: Array<[string, number]>;
    err: boolean;
    barColor: string;
    icon: typeof Users;
  }> = [
    {
      title: "Leads by Lifecycle Stage",
      total: totalLeads,
      rows: tally(leadsRes.data, "lifecycle_stage"),
      err: Boolean(leadsRes.error),
      barColor: "bg-[var(--lit-teal,#1FA9A2)]",
      icon: Users,
    },
    {
      title: "Proposals by Contract Status",
      total: totalProposals,
      rows: tally(proposalsRes.data, "status"),
      err: Boolean(proposalsRes.error),
      barColor: "bg-blue-600",
      icon: FileText,
    },
    {
      title: "Invoices by Settlement Status",
      total: totalInvoices,
      rows: tally(invoicesRes.data, "status"),
      err: Boolean(invoicesRes.error),
      barColor: "bg-emerald-600",
      icon: DollarSign,
    },
    {
      title: "Support Tickets by Resolution Status",
      total: totalTickets,
      rows: tally(ticketsRes.data, "status"),
      err: Boolean(ticketsRes.error),
      barColor: "bg-rose-600",
      icon: Ticket,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            <BarChart3 className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
            Deterministic Operations · Live Database Aggregations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] mb-1">
            Enterprise Operations Analytics
          </h1>
          <p className="text-[var(--lit-text-muted,#52677C)] text-sm">
            Real counts directly aggregated from operational tables. Zero projection or synthetic models.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-mono font-medium text-[var(--lit-navy,#0B2545)] shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Aggregations</span>
          </div>
        </div>
      </div>

      {anyError ? (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-800 flex items-center gap-2.5 shadow-2xs"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Some figures could not be loaded and show as error states below. Remaining metrics are live.</span>
        </div>
      ) : null}

      {/* Aggregate Volume KPI Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/30"
          >
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                {t.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${t.tone}`}>
                <t.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
              {t.err ? "—" : t.total}
            </div>
            <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1 truncate">
              {t.description}
            </p>
          </div>
        ))}
      </div>

      {/* Distribution Breakdowns Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {breakdowns.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)]">
                  <b.icon className="w-3.5 h-3.5" />
                </span>
                <span>{b.title}</span>
              </h2>
              <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] bg-[var(--lit-cloud,#F7F9FC)] px-2.5 py-0.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)]">
                {b.total} Total
              </span>
            </div>

            {b.err ? (
              <p className="text-xs text-rose-600 py-6 text-center font-medium">Could not load breakdown data.</p>
            ) : b.rows.length === 0 ? (
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-6 text-center font-medium">No records recorded yet.</p>
            ) : (
              <ul className="space-y-3.5">
                {b.rows.map(([statusKey, count]) => {
                  const percentage = b.total > 0 ? Math.round((count / b.total) * 100) : 0;
                  return (
                    <li key={statusKey} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--lit-navy,#0B2545)] capitalize">
                          {statusKey}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[var(--lit-text-muted,#52677C)] font-medium">
                            {percentage}%
                          </span>
                          <span className="font-bold text-[var(--lit-navy,#0B2545)] bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] px-2 py-0.5 rounded-md text-[11px]">
                            {count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--lit-cloud,#F7F9FC)] overflow-hidden border border-[var(--lit-border-light,#DFE7EF)]/50">
                        <div
                          className={`h-full rounded-full ${b.barColor} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Operational Compliance Footer Notice */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              Operational Data Integrity Standard
            </h4>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              All metrics query authoritative PostgreSQL tables directly with row counts. Zero third-party web tracking, pixel telemetry, or synthetic conversion projections.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] bg-[var(--lit-cloud,#F7F9FC)] px-2.5 py-1 rounded-md border border-[var(--lit-border-light,#DFE7EF)]">
            SOC-2 Type II Compatible
          </span>
        </div>
      </div>
    </div>
  );
}
