import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { RefreshCcw, CheckCircle2, Clock, ShieldCheck, AlertCircle, FileSearch, ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Logic Intelligence Technologies",
  description:
    "Understand our milestone-based refund, cancellation, and dispute resolution policy for enterprise software engineering, AI systems, and cloud retainers.",
  alternates: {
    canonical: "/refund-policy",
  },
};

const REFUND_METRICS = [
  { label: "Delivery Model", value: "Milestone-Gated", detail: "Payments released only upon demonstrable sprint sign-off" },
  { label: "Post-Launch Warranty", value: "90 Days", detail: "Full defect remediation at zero additional fee" },
  { label: "Retainer Notice", value: "30 Days", detail: "Predictable ramp-down for ongoing cloud services" },
  { label: "Audit Review SLA", value: "5 Days", detail: "Fast-track technical discrepancy assessment" },
];

const REFUND_POLICIES = [
  {
    number: "01",
    title: "Custom Software & Web Engineering Deliverables",
    icon: CheckCircle2,
    badge: "Milestone-Driven",
    badgeColor: "bg-teal-500/10 text-[var(--lit-teal,#1FA9A2)] border-teal-500/20",
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        <p>
          Engineering engagements are structured systematically into transparent milestone phases (Discovery & Architecture, UI/UX Prototyping, Production Development, Security Hardening, and Production Deployment). Invoicing is strictly tied to verifiable deliverables demonstrated in sprint reviews.
        </p>
        <div className="grid gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
            <h4 className="font-semibold text-[var(--lit-navy,#0B2545)] mb-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Initial Mobilization & Architecture Deposits
            </h4>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
              Initial deposits cover immediate engineering resource reservation, dedicated cloud sandbox provisioning, and architecture scoping sessions. Once technical discovery or infrastructure scaffolding commences, mobilization deposits are non-refundable.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
            <h4 className="font-semibold text-[var(--lit-navy,#0B2545)] mb-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Milestone Sign-Off & Intermediate Invoices
            </h4>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
              Upon formal client review and sign-off of a milestone deliverable, the associated invoice payment is finalized and non-refundable. If an engagement is paused or discontinued mid-cycle upon mutual written agreement, billing is reconciled solely for completed sprint tasks up to the cancellation notice date.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
            <h4 className="font-semibold text-[var(--lit-navy,#0B2545)] mb-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Final Handover & 90-Day Post-Launch Warranty
            </h4>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
              Upon production deployment and repository transfer, completed engagements are concluded. Every custom software deliverable is accompanied by an enterprise 90-day post-launch warranty period to remediate any deviation from signed technical specifications without added billing.
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
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        Ongoing DevOps retainers, SLA-backed maintenance contracts, and dedicated engineering allocations require a 30-day written cancellation notice. Services, security patches, and cloud monitoring continue uninterrupted through the active billing period. Invoices are billed on the first of each monthly cycle, and partial calendar month refunds are not issued.
      </p>
    ),
  },
  {
    number: "03",
    title: "Pre-Built Modules, Digital Assets & API Licenses",
    icon: ShieldCheck,
    badge: "Final Sale",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        Pre-packaged software engines, microservices, and downloadable architecture frameworks are non-returnable digital goods once keys or binaries are issued. In the unlikely event of an unresolvable technical defect preventing operation on compliant hosting environments, our engineering team will patch the codebase or credit the purchase toward alternative solutions.
      </p>
    ),
  },
  {
    number: "04",
    title: "Dispute Escalation & Milestone Audits",
    icon: AlertCircle,
    badge: "Equitable Mediation",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        If you identify an architectural discrepancy or contractual milestone non-conformance, please submit an immediate formal audit request. We conduct an independent code review and sprint analysis within 5 business days to determine appropriate remediation, rework without fee, or credit adjustments.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Refund Policy", path: "/refund-policy" },
        ])}
      />

      <div className="pt-28 pb-20 bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[var(--lit-light-gold,#FFF4D9)] text-amber-800 border border-amber-200 mb-4">
              <RefreshCcw className="w-3.5 h-3.5" />
              Commercial Transparency • Milestone Governance
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading mb-4">
              Refund & <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Cancellation Policy</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} • Transparent milestone payment terms for {COMPANY.legalName}
            </p>
          </div>

          {/* Intro Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-10">
            <h2 className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2 font-heading">
              Fair & Accountable Milestone Billing
            </h2>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              At <span className="text-[var(--lit-navy,#0B2545)] font-semibold">{COMPANY.legalName}</span>, our work is governed by clarity, defined sprints, and accountable deliverables. Because custom enterprise software engineering involves dedicated engineering effort and reserved cloud capacity, our refund policies are organized around verifiable milestone sign-offs.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {REFUND_METRICS.map((metric, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
              >
                <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)] mb-1">
                  {metric.value}
                </div>
                <div className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-0.5">
                  {metric.label}
                </div>
                <div className="text-[11px] text-[var(--lit-text-muted,#52677C)] leading-tight">
                  {metric.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {REFUND_POLICIES.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.number}
                  className="p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${sec.badgeColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight font-heading">
                        {sec.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-medium px-3 py-1 rounded-full border ${sec.badgeColor}`}>
                        {sec.badge}
                      </span>
                      <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] font-semibold px-2.5 py-1 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                        § {sec.number}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    {sec.content}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Milestone Audit Request Card */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-1 flex items-center gap-2 font-heading">
                  <FileSearch className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
                  Request a Project Milestone Audit
                </h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-xl">
                  If you have concerns regarding an ongoing sprint deliverable or need to pause an active engagement, our executive project management office will review sprint logs and work with you on an equitable resolution.
                </p>
                <div className="mt-3 text-xs text-[var(--lit-text-muted,#52677C)]">
                  Response SLA: <span className="font-semibold text-[var(--lit-navy,#0B2545)]">Within 5 business days</span> • Direct escalation desk
                </div>
              </div>
              <a
                href={`mailto:${COMPANY.email}?subject=Project%20Milestone%20Audit%20Request`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-teal,#1FA9A2)] text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
              >
                <span>Initiate Audit Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions regarding milestone payments or refund policies?" />
    </PageShell>
  );
}
