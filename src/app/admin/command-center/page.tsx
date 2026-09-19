import { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign, Briefcase, Users, Calendar, Ticket, ArrowRight,
  ShieldCheck, Plus, Bot, FileText, Headphones, TrendingUp,
  Globe, Mail, Phone, Building2, Clock, CheckCircle2, AlertCircle,
  BarChart3, Activity, Zap, Eye
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Executive Command Center | Logic Intelligence Technologies",
};

export const revalidate = 0;

function StatCard({
  label, value, sub, icon: Icon, color, href
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; href?: string;
}) {
  const inner = (
    <div className={`rounded-2xl border bg-neutral-900/60 p-5 hover:bg-neutral-900/90 transition-all group ${color}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.replace("border-", "bg-").replace("/30", "/10")}`}>
          <Icon className={`w-4 h-4 ${color.includes("emerald") ? "text-emerald-400" : color.includes("blue") ? "text-blue-400" : color.includes("cyan") ? "text-cyan-400" : color.includes("rose") ? "text-rose-400" : color.includes("violet") ? "text-violet-400" : "text-yellow-400"}`} />
        </div>
      </div>
      <div className="text-3xl font-black text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
      {sub && <p className="text-[10px] text-zinc-500 font-medium">{sub}</p>}
      {href && (
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-zinc-500 group-hover:text-primary transition-colors uppercase tracking-wider">
          <span>View details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminCommandCenterPage() {
  const [
    { data: invoices },
    { count: projectsCount },
    { data: leads },
    { count: bookingsCount },
    { count: ticketsCount },
    { data: aiLeads },
    { count: vsRequestCount },
    { data: recentBookings },
    { data: openTickets },
  ] = await Promise.all([
    supabaseAdmin.from("invoices").select("amount, status"),
    supabaseAdmin.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("contact_leads").select("*").order("created_at", { ascending: false }).limit(8),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "Open"),
    supabaseAdmin.from("contact_leads").select("*", { count: "exact", head: true }).eq("source", "ai-chat"),
    supabaseAdmin.from("contact_leads").select("*", { count: "exact", head: true }).ilike("message", "%VoiceShield%").neq("pipeline_stage", "Access Granted"),
    supabaseAdmin.from("bookings").select("*").order("slot_time", { ascending: true }).gte("slot_time", new Date().toISOString()).limit(4),
    supabaseAdmin.from("support_tickets").select("*").eq("status", "Open").order("created_at", { ascending: false }).limit(4),
  ]);

  const totalRevenue = invoices?.filter((i) => i.status === "Paid").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;
  const pendingRevenue = invoices?.filter((i) => i.status !== "Paid").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;
  const voiceShieldPending = vsRequestCount || 0;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto p-4 py-8 max-w-7xl space-y-8">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Executive Command Center</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/proposals/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]">
              <Plus className="w-4 h-4" /> Draft Proposal
            </Link>
            <Link href="/admin/leads" className="px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10">
              All Leads
            </Link>
            <Link href="/" target="_blank" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live Site
            </Link>
          </div>
        </div>



        {/* ── KPI GRID ────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="Settled Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub="Paid invoices" icon={DollarSign} color="border-emerald-500/20" href="/admin/proposals" />
          <StatCard label="Pending Revenue" value={`₹${pendingRevenue.toLocaleString("en-IN")}`} sub="Unpaid invoices" icon={TrendingUp} color="border-yellow-500/20" href="/admin/proposals" />
          <StatCard label="Active Projects" value={projectsCount || 0} sub="In sprint execution" icon={Briefcase} color="border-blue-500/20" />
          <StatCard label="Consultation Bookings" value={bookingsCount || 0} sub="Scheduled sessions" icon={Calendar} color="border-cyan-500/20" href="/admin/bookings" />
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total CRM Leads" value={leads?.length || 0} sub="All inbound contacts" icon={Users} color="border-violet-500/20" href="/admin/leads" />
          <StatCard label="AI Chat Leads" value={aiLeads?.length || 0} sub="AI-captured contacts" icon={Bot} color="border-blue-500/20" href="/admin/ai-leads" />
          <StatCard label="Open Tickets" value={ticketsCount || 0} sub="Awaiting resolution" icon={Ticket} color="border-rose-500/20" href="/admin/support" />
          <StatCard label="VS Pending" value={voiceShieldPending} sub="Access requests" icon={ShieldCheck} color="border-cyan-500/20" href="/admin/voiceshield-requests" />
        </div>

        {/* ── NAVIGATION SHORTCUTS ────────────────────────────── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "CRM Leads", href: "/admin/leads", icon: Users, desc: "Inbound inquiries" },
              { label: "AI Chat Leads", href: "/admin/ai-leads", icon: Bot, desc: "AI-captured leads" },
              { label: "Bookings", href: "/admin/bookings", icon: Calendar, desc: "Client sessions" },
              { label: "Proposals", href: "/admin/proposals", icon: FileText, desc: "SOWs & quotes" },
              { label: "Support", href: "/admin/support", icon: Headphones, desc: "Open tickets" },
              { label: "VoiceShield", href: "/admin/voiceshield-requests", icon: ShieldCheck, desc: "Grant access", highlight: true },
              { label: "Email Broadcasts", href: "/admin/emails", icon: Mail, desc: "Send campaigns" },
              { label: "Invoices", href: "/admin/invoices", icon: DollarSign, desc: "Billing & payments" },
              { label: "Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Metrics & traffic" },
              { label: "System Status", href: "/admin/status", icon: Activity, desc: "Logs & health" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 group hover:-translate-y-0.5 ${
                  item.highlight
                    ? "border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40"
                    : "border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/70 hover:border-neutral-700"
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.highlight ? "text-cyan-400" : "text-primary"}`} />
                <div>
                  <div className={`text-xs font-bold ${item.highlight ? "text-cyan-200" : "text-white"}`}>{item.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>


        {/* ── QUICK ACTIONS ───────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "New Proposal", href: "/admin/proposals/new", icon: Plus, desc: "Draft a client SOW", color: "bg-primary/10 border-primary/20 text-primary" },
              { label: "Send Email", href: "/admin/emails/new", icon: Mail, desc: "Compose broadcast", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
              { label: "View Leads", href: "/admin/leads", icon: Users, desc: "Review CRM pipeline", color: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
              { label: "VS Access", href: "/admin/voiceshield-requests", icon: ShieldCheck, desc: "Approve requests", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
              { label: "Support", href: "/admin/support", icon: Headphones, desc: "Handle tickets", color: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
              { label: "Check Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Traffic & metrics", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 group ${action.color}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{action.label}</div>
                  <div className="text-[10px] text-zinc-500">{action.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-[10px] text-zinc-600 font-mono">
          <span>Logic Intelligence Technologies · Admin Command Center</span>
          <span>Auto-refreshes on page load · All times IST</span>
        </div>

      </div>
    </div>
  );
}
