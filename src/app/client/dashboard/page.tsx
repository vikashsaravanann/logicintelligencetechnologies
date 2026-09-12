import { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, Receipt, HelpCircle, ArrowRight, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Executive Dashboard | Client Portal | Logic Intelligence Technologies",
};

export const revalidate = 0;

export default async function ClientDashboardPage() {
  const [
    { data: projects },
    { data: invoices },
    { data: tickets },
    { data: files },
  ] = await Promise.all([
    supabaseAdmin.from("projects").select("*").order("created_at", { ascending: false }).limit(4),
    supabaseAdmin.from("invoices").select("*").order("created_at", { ascending: false }).limit(4),
    supabaseAdmin.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(4),
    supabaseAdmin.from("client_files").select("*").order("created_at", { ascending: false }).limit(4),
  ]);

  const activeProjects = projects?.filter((p) => p.status !== "Completed") || [];
  const pendingInvoices = invoices?.filter((i) => i.status === "Pending") || [];
  const openTickets = tickets?.filter((t) => t.status === "Open" || t.status === "In Progress") || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Client Workspace
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time telemetry, milestone delivery timelines, and billing status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/support"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Create Ticket
          </Link>
          <Link
            href="/book-consultation"
            className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
          >
            Book Review Call
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Projects</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-white">{activeProjects.length}</div>
          <p className="text-[10px] text-zinc-500 mt-1">In active development</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pending Invoices</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{pendingInvoices.length}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Awaiting milestone approval</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Open Tickets</span>
            <HelpCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">{openTickets.length}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Under engineering review</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Vault Documents</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{files?.length || 0}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Encrypted specifications</p>
        </div>
      </div>

      {/* Projects Grid & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Projects */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Current Sprint & Projects</span>
            </h2>
            <Link href="/client/projects" className="text-xs text-primary font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {activeProjects.length > 0 ? (
              activeProjects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">{proj.name}</h3>
                      <p className="text-[10px] text-zinc-400">Code: {proj.project_code}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                      {proj.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>Milestone Progress</span>
                      <span className="font-bold text-white">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No active projects assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Invoices */}
        <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Billing Summary</span>
            </h2>
            <Link href="/client/invoices" className="text-xs text-primary font-semibold hover:underline">
              All
            </Link>
          </div>

          <div className="space-y-3">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <div key={inv.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{inv.invoice_code}</p>
                    <p className="text-zinc-400 text-[10px]">{inv.due_date || "Upon Receipt"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">₹{Number(inv.amount).toLocaleString()}</p>
                    <span className={`text-[9px] uppercase font-bold ${inv.status === "Paid" ? "text-emerald-400" : "text-amber-400"}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">No billing statements available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
