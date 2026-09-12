import { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Briefcase, Users, Calendar, Ticket, ArrowRight, TrendingUp, ShieldCheck, Plus } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Executive Command Center | Logic Intelligence Technologies",
};

export const revalidate = 0;

export default async function AdminCommandCenterPage() {
  const [
    { data: invoices },
    { count: projectsCount },
    { data: leads },
    { count: bookingsCount },
    { count: ticketsCount },
  ] = await Promise.all([
    supabaseAdmin.from("invoices").select("amount, status"),
    supabaseAdmin.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("contact_leads").select("*").order("created_at", { ascending: false }).limit(6),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "Open"),
  ]);

  const totalRevenue =
    invoices?.filter((i) => i.status === "Paid").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Executive Command Center
          </h1>
          <p className="text-zinc-400 text-sm">
            Operational telemetry, CRM pipeline, consultations, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/proposals/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Draft Proposal</span>
          </Link>
          <Link
            href="/admin/leads"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            All Leads
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Settled Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">From verified invoices</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Projects</span>
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{projectsCount || 0}</div>
          <p className="text-[10px] text-zinc-500 mt-1">In active sprint execution</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Consultation Bookings</span>
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-black text-white">{bookingsCount || 0}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Scheduled client sessions</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Open Tickets</span>
            <Ticket className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">{ticketsCount || 0}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Awaiting resolution</p>
        </div>
      </div>

      {/* Navigation Quick Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/leads"
          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors flex items-center justify-between text-xs font-bold text-white"
        >
          <span>CRM Leads Ledger</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </Link>
        <Link
          href="/admin/bookings"
          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors flex items-center justify-between text-xs font-bold text-white"
        >
          <span>Calendar Bookings</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </Link>
        <Link
          href="/admin/proposals"
          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors flex items-center justify-between text-xs font-bold text-white"
        >
          <span>Proposals & SOWs</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </Link>
        <Link
          href="/admin/support"
          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors flex items-center justify-between text-xs font-bold text-white"
        >
          <span>Support Tickets</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </Link>
      </div>

      {/* Recent Leads Feed */}
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

        <div className="divide-y divide-neutral-800">
          {leads && leads.length > 0 ? (
            leads.map((l) => (
              <div key={l.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <Link href={`/admin/leads/${l.id}`} className="font-bold text-white hover:underline text-sm block">
                    {l.name}
                  </Link>
                  <p className="text-zinc-400 text-[11px]">{l.email} {l.company ? `· ${l.company}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                    Score: {l.lead_score || 35}
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
      </div>
    </div>
  );
}
