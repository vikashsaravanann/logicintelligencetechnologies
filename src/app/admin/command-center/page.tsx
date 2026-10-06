import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import { DollarSign, Briefcase, Users, Calendar, Ticket, ArrowRight, Plus, FileText, AlertTriangle } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { paidRevenue, outstandingRevenue, leadScoreLabel, type InvoiceAmountRow } from "@/lib/admin/kpis";
import { formatINR } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Executive Command Center | Logic Intelligence Technologies",
};

export const revalidate = 0;

export default async function AdminCommandCenterPage() {
  await requireCapabilityPage("dashboard.view", "/admin/command-center");

  const nowIso = new Date().toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

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
    { label: "Settled Revenue", value: invoicesRes.error ? "—" : formatINR(settled), note: "Paid invoices", icon: DollarSign, tone: "text-emerald-400" },
    { label: "Outstanding", value: invoicesRes.error ? "—" : formatINR(outstanding), note: "Pending + overdue", icon: FileText, tone: "text-amber-400" },
    { label: "Active Projects", value: projectsRes.error ? "—" : String(projectsRes.count ?? 0), note: "Not completed/cancelled", icon: Briefcase, tone: "text-blue-400" },
    { label: "Upcoming Bookings", value: bookingsRes.error ? "—" : String(bookingsRes.count ?? 0), note: "Scheduled, future", icon: Calendar, tone: "text-primary" },
    { label: "Open Tickets", value: ticketsRes.error ? "—" : String(ticketsRes.count ?? 0), note: "Awaiting resolution", icon: Ticket, tone: "text-rose-400" },
    { label: "New Leads (7d)", value: newLeadsRes.error ? "—" : String(newLeadsRes.count ?? 0), note: "Last 7 days", icon: Users, tone: "text-fuchsia-400" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Executive Command Center</h1>
          <p className="text-zinc-400 text-sm">Operational telemetry, CRM pipeline, consultations, and revenue metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
          <Link
            href="/admin/proposals/new"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Draft Proposal
          </Link>
        </div>
      </div>

      {anyError ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300 flex items-center gap-2" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Some metrics could not be loaded. Figures showing “—” failed to query; the rest are live.
        </div>
      ) : null}

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t.label}</span>
              <t.icon className={`w-5 h-5 ${t.tone}`} />
            </div>
            <div className="text-2xl font-black text-white">{t.value}</div>
            <p className="text-[10px] text-zinc-500 mt-1">{t.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { href: "/admin/leads", label: "CRM Leads Ledger" },
          { href: "/admin/invoices", label: "Invoices" },
          { href: "/admin/bookings", label: "Calendar Bookings" },
          { href: "/admin/proposals", label: "Proposals & SOWs" },
          { href: "/admin/outreach", label: "Outreach Pipeline" },
          { href: "/admin/support", label: "Support Tickets" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors flex items-center justify-between text-xs font-bold text-white"
          >
            <span>{q.label}</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Recent Inbound Inquiries</span>
          </h2>
          <Link href="/admin/leads" className="text-xs text-primary font-bold hover:underline">
            View All Leads
          </Link>
        </div>

        {leadsRes.error ? (
          <p className="text-xs text-rose-300 py-4 text-center">Could not load recent leads.</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {leads.length > 0 ? (
              leads.map((l) => (
                <div key={l.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <Link href={`/admin/leads/${l.id}`} className="font-bold text-white hover:underline text-sm block">
                      {l.name}
                    </Link>
                    <p className="text-zinc-400 text-[11px]">
                      {l.email} {l.company ? `· ${l.company}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                      Score: {leadScoreLabel(l.lead_score)}
                    </span>
                    <Link href={`/admin/leads/${l.id}`} className="text-primary hover:underline font-semibold">
                      Dossier →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">No leads recorded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
