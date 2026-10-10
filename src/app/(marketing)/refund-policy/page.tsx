import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { RefreshCcw, CheckCircle2, Clock, ShieldCheck, AlertCircle, FileSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Logic Intelligence Technologies",
  description:
    "Understand our milestone-based refund, cancellation, and dispute resolution policy for enterprise software engineering and cloud systems.",
  alternates: {
    canonical: "/refund-policy",
  },
};

const REFUND_POLICIES = [
  {
    number: "01",
    title: "Custom Software & Web Engineering",
    icon: CheckCircle2,
    badge: "Milestone-Driven",
    content: (
      <div className="space-y-4 text-sm sm:text-base text-zinc-300">
        <p className="leading-relaxed">
          Engineering engagements are structured systematically into transparent milestone phases (Discovery & Architecture, UI/UX Prototyping, Production Development, Security Hardening, and Production Deployment). Payments are tied directly to demonstrable milestone deliverables.
        </p>
        <div className="grid gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h4 className="font-semibold text-white mb-1">Initial Mobilization Deposits</h4>
            <p className="text-sm text-zinc-400">
              Initial deposits cover immediate engineering resource reservation, dedicated infrastructure provisioning, and architectural requirements workshops. Once discovery or system architecture commences, initial deposits are non-refundable.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h4 className="font-semibold text-white mb-1">Milestone Sign-Off & Intermediate Invoices</h4>
            <p className="text-sm text-zinc-400">
              Upon formal client review and sign-off of a milestone deliverable, the associated invoice payment is finalized and non-refundable. If a project is discontinued mid-development upon mutual agreement, billing is reconciled solely for completed sprint tasks up to the cancellation notice date.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h4 className="font-semibold text-white mb-1">Final Handover & Post-Launch Warranty</h4>
            <p className="text-sm text-zinc-400">
              Upon production deployment and source code repository transfer, completed engagements are final. Every custom software deliverable is accompanied by a complimentary 30-day post-launch warranty period to remediate any deviation from signed functional specifications.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Retainer & Platform Maintenance Contracts",
    icon: Clock,
    badge: "30-Day Notice",
    content: (
      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
        Ongoing DevOps retainers, SLA-backed maintenance contracts, and dedicated engineering capacity require a 30-day written cancellation notice. Services and infrastructure maintenance continue uninterrupted through the active billing cycle. Invoices are billed on the first of each cycle and partial calendar month refunds are not issued.
      </p>
    ),
  },
  {
    number: "03",
    title: "Digital Assets, Modules & API Access",
    icon: ShieldCheck,
    badge: "Final Sale",
    content: (
      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
        Pre-packaged software modules, microservices, and downloadable architecture frameworks are non-returnable digital goods. In the unlikely event of an unresolvable technical defect preventing operation on compliant hosting environments, our engineering staff will remediate the codebase or credit the purchase toward alternative solutions.
      </p>
    ),
  },
  {
    number: "04",
    title: "Dispute Escalation & Project Audits",
    icon: AlertCircle,
    badge: "Equitable Mediation",
    content: (
      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
        If you identify an architectural discrepancy or contractual milestone non-conformance, please initiate an immediate formal audit. We conduct a transparent code review and sprint analysis within 5 business days to determine appropriate remediation, rework without fee, or credit adjustments.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <RefreshCcw className="w-3.5 h-3.5" />
              Transparent Terms
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              REFUND & CANCELLATION POLICY
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Transparent milestone governance for {companyConfig.legalName}
            </p>
          </div>

          {/* Intro Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              At <span className="text-white font-medium">{companyConfig.legalName}</span>, our work is governed by clarity, defined sprints, and accountable deliverables. Because custom software engineering involves tailored engineering effort and dedicated resource allocation, our refund guidelines are organized around milestone approvals.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {REFUND_POLICIES.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.number}
                  className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] transition-colors hover:border-cyan-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {sec.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                        {sec.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-500 font-semibold px-2 py-1 rounded bg-white/5">
                        {sec.number}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    {sec.content}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Audit Request Card */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#151922] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-cyan-400" />
                Request a Project Milestone Audit
              </h3>
              <p className="text-sm text-zinc-400 max-w-xl">
                If you have concerns about an ongoing sprint deliverable or need to pause an active engagement, our project directors will review your timeline and find an equitable resolution.
              </p>
            </div>
            <a
              href={`mailto:${companyConfig.email}?subject=Project%20Audit%20Request`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium border border-cyan-500/20 transition-colors whitespace-nowrap"
            >
              Contact Project Office
            </a>
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions about milestone payments?" />
    </PageShell>
  );
}
