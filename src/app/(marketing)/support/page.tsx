import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Plus, ShieldCheck, Clock, MessageSquare, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Enterprise Support & Developer Help Desk | Logic Intelligence Technologies",
  description: "Get technical support, report issues, and access SLA escalation desks for all Logic Intelligence systems.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportHubPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>24/7 Engineering Support Desk</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            ENTERPRISE SUPPORT & <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SLA RESOLUTION</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Direct access to senior full-stack architects and DevOps engineers to guarantee uptime, resolve technical bugs, and answer architecture inquiries.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </Link>
          </div>
        </div>

        {/* SLA Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Priority SLA</h3>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">Under 2-Hour Response</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              For production incidents, critical server interruptions, or database latency alerts.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Security Escalation</h3>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-4">Instant Alert Desk</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Immediate triage for vulnerability patches, SSL renewal, and DDoS mitigation triggers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Feature Requests</h3>
            <p className="text-xs text-accent font-bold uppercase tracking-wider mb-4">Sprint Integration</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Submit change requests, UI improvements, and third-party API integration tickets.
            </p>
          </div>
        </div>

        {/* Knowledge & FAQs */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 mb-16">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">
            Frequently Answered Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
              <h3 className="font-bold text-white mb-2">How do I track my ticket status?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you submit a ticket, you receive a direct tracking link and email notifications with live replies from our developers.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">What if I have an emergency after hours?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Critical priority tickets automatically trigger PagerDuty alerts to our on-call engineers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
