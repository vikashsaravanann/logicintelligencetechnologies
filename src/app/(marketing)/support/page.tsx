import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Plus, ShieldCheck, Clock, MessageSquare, ArrowRight, Zap, CheckCircle2, LifeBuoy } from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Enterprise Support & SLA Resolution | Logic Intelligence Technologies",
  description: "Get technical support, report operational incidents, and access SLA escalation desks for all Logic Intelligence systems.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportHubPage() {
  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>24/7 Engineering Escalation Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase mb-6 leading-tight">
            Enterprise Support & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              SLA Resolution
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
            Direct access to senior full-stack architects and Site Reliability Engineers to ensure guaranteed uptime, rapid incident resolution, and architectural support.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </Link>
          </div>
        </div>

        {/* 3 SLA Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 hover:border-cyan-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mb-2">Priority SLA</h3>
            <p className="text-xs text-cyan-400 font-mono font-bold uppercase tracking-wider mb-4">Under 2-Hour Response</p>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              For production incidents, critical server interruptions, database connection degradation, or core API outages.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 hover:border-cyan-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mb-2">Security Escalation</h3>
            <p className="text-xs text-cyan-400 font-mono font-bold uppercase tracking-wider mb-4">Instant Alert Desk</p>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              Immediate triage for vulnerability patches, SSL renewals, DDoS mitigation triggers, and access control revocations.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 hover:border-cyan-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mb-2">Feature Requests</h3>
            <p className="text-xs text-teal-400 font-mono font-bold uppercase tracking-wider mb-4">Sprint Integration</p>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              Submit architectural change requests, UI improvements, third-party webhook integrations, and database schema extensions.
            </p>
          </div>
        </div>

        {/* Knowledge & FAQs */}
        <div className="rounded-3xl border border-white/10 bg-[#10131A] p-8 sm:p-12 mb-16 shadow-2xl">
          <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-8">
            Frequently Answered Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-white text-base">How do I track my active ticket status?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                When you submit a ticket, you receive a direct tracking link and instantaneous email notifications with live replies from our developers.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-white text-base">What if an outage occurs after hours or on weekends?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                Critical severity tickets automatically trigger PagerDuty alerts to our on-call Site Reliability Engineers 24/7/365.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
