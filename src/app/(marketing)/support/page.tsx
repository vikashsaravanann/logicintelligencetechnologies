import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  ShieldCheck,
  Clock,
  MessageSquare,
  ArrowRight,
  Zap,
  CheckCircle2,
  LifeBuoy,
  FileText,
  Activity,
  AlertTriangle,
  Server,
  Lock,
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import TicketLookupBar from "./components/TicketLookupBar";

export const metadata: Metadata = {
  title: "Enterprise Support & SLA Resolution | Logic Intelligence Technologies",
  description:
    "Direct access to enterprise technical support, 24/7 SLA incident resolution, ticket tracking, and L3 Site Reliability Engineering escalation desks.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Enterprise Support & SLA Resolution | Logic Intelligence Technologies",
    description:
      "Enterprise support queue, SLA resolution timelines, priority engineering escalation desks, and active ticket tracking.",
    images: [
      {
        url: "/api/og?title=Enterprise+Support&category=Support+Resolution",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies Enterprise Support",
      },
    ],
  },
};

const SLA_TIERS = [
  {
    icon: Clock,
    title: "Priority SLA",
    timeframe: "Under 15-Min Response",
    badge: "Sev-1 Critical",
    description:
      "For production-halting incidents, core API outages, catastrophic inference degradation, or database connection pool failures.",
    accentColor: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
    cardBorder: "border-[#BBDEFB]/80 hover:border-[#1565C0]/40",
  },
  {
    icon: ShieldCheck,
    title: "Security Escalation",
    timeframe: "Instant Alert Desk",
    badge: "24/7 Rapid Triage",
    description:
      "Immediate response for vulnerability reports, SSL certificate renewals, DDoS mitigation overrides, and compromised credential revocations.",
    accentColor: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
    cardBorder: "border-[#B2DFDB]/80 hover:border-[#00796B]/40",
  },
  {
    icon: MessageSquare,
    title: "Architecture & Sprints",
    timeframe: "Sprint Integration",
    badge: "Advisory & Features",
    description:
      "Submit architectural change proposals, webhook routing inquiries, custom agent tool designs, and database schema extensions.",
    accentColor: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
    cardBorder: "border-[#D1C4E9]/80 hover:border-[#5E35B1]/40",
  },
];

const SEVERITY_MATRIX = [
  {
    severity: "Sev-1 (Critical)",
    impact: "Total production outage, core voice pipeline down, high financial/operational loss.",
    sla: "< 15 minutes",
    coverage: "24/7/365 On-Call SRE",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    severity: "Sev-2 (Major)",
    impact: "Significant latency regression, non-critical service disruption with partial workaround.",
    sla: "< 1 hour",
    coverage: "24/7 On-Call Rotation",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    severity: "Sev-3 (Moderate)",
    impact: "Minor system defect, isolated edge-case failure, non-blocking administrative issue.",
    sla: "< 4 hours",
    coverage: "Business Hours (IST/UTC)",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    severity: "Sev-4 (Low / Advisory)",
    impact: "General technical questions, architectural consultation, feature or package extension requests.",
    sla: "< 24 hours",
    coverage: "Standard Engineering Desk",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

const SUPPORT_FAQS = [
  {
    q: "How do I track my active ticket status?",
    a: "When you submit a ticket, a unique tracking UUID is generated and displayed on screen. You can bookmark the URL or enter your ticket ID into the tracker above to view real-time updates and direct responses from our development team.",
  },
  {
    q: "What if an outage occurs after hours or over holidays?",
    a: "Critical severity tickets automatically trigger automated PagerDuty escalation protocols, paging our lead systems architects within 60 seconds regardless of time zone or local holidays.",
  },
  {
    q: "Who answers enterprise support requests?",
    a: "Every ticket is reviewed and handled directly by senior full-stack software engineers and site reliability architects. We do not use outsourced level-1 call centers or scripted deflections.",
  },
  {
    q: "Can we integrate alerts directly into our corporate Slack or Teams?",
    a: "Yes. Enterprise clients can configure direct webhook bridges to receive bi-directional ticket updates directly within their internal engineering Slack or Teams channels.",
  },
];

export default function SupportHubPage() {
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Support", path: "/support" },
  ];

  return (
    <PageShell>
      <JsonLd data={breadcrumb(breadcrumbItems)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs / Back button */}
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Home" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>24/7 Engineering Escalation Desk</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Enterprise Support & <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                SLA Resolution
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
              Direct access to senior full-stack architects and Site Reliability Engineers to ensure guaranteed uptime, rapid incident resolution, and architectural support.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Support Ticket</span>
              </Link>
              <Link
                href="/help-center"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs"
              >
                <LifeBuoy className="w-4 h-4 text-[#1565C0]" />
                <span>Search Help Center</span>
              </Link>
            </div>

            {/* Quick Ticket Lookup Bar */}
            <div className="pt-4">
              <TicketLookupBar />
            </div>
          </div>

          {/* 3 SLA Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {SLA_TIERS.map((tier, idx) => {
              const Icon = tier.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl border bg-white p-7 sm:p-8 transition-all duration-300 shadow-sm ${tier.cardBorder}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tier.accentColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${tier.accentColor}`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1">
                    {tier.title}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#1565C0] uppercase tracking-wider mb-3">
                    {tier.timeframe}
                  </p>
                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                    {tier.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Incident Severity & SLA Response Matrix */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 mb-16 shadow-sm">
            <div className="max-w-2xl mb-8 space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1565C0]">
                Incident Management Protocol
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                Contractual Severity & SLA Matrix
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] font-light leading-relaxed">
                Clear escalation paths ensuring rapid mobilization of senior engineers based on production impact.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 font-semibold">Severity Tier</th>
                    <th className="py-3 px-4 font-semibold">Incident Scope & Impact</th>
                    <th className="py-3 px-4 font-semibold">Target SLA</th>
                    <th className="py-3 px-4 font-semibold">Coverage Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SEVERITY_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${row.badge}`}
                        >
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[var(--lit-text-muted,#52677C)] font-light max-w-md">
                        {row.impact}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[var(--lit-navy,#0B2545)] whitespace-nowrap">
                        {row.sla}
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap font-medium">
                        {row.coverage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Access Resource Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <Link
              href="/support/new"
              className="p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E7F3FF] text-[#1565C0] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors flex items-center justify-between">
                <span>Submit Ticket</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-light leading-relaxed">
                Log a direct ticket with technical details and stack traces.
              </p>
            </Link>

            <Link
              href="/help-center"
              className="p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EDE7F6] text-[#5E35B1] flex items-center justify-center">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors flex items-center justify-between">
                <span>Help Center</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-light leading-relaxed">
                Explore architectural FAQs, VPC guides, and key rotation specs.
              </p>
            </Link>

            <Link
              href="/docs/api"
              className="p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E0F2F1] text-[#00796B] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors flex items-center justify-between">
                <span>Developer Docs</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-light leading-relaxed">
                Review interactive REST APIs, WebSockets, and SDK schemas.
              </p>
            </Link>

            <Link
              href="/status"
              className="p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0] transition-all shadow-2xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors flex items-center justify-between">
                <span>System Status</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-light leading-relaxed">
                Check real-time uptime telemetry and edge latency health.
              </p>
            </Link>
          </div>

          {/* Support FAQs */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-12 mb-16 shadow-sm">
            <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-8">
              Frequently Answered Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {SUPPORT_FAQS.map((faq, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="font-bold text-[var(--lit-navy,#0B2545)] text-base">
                    {faq.q}
                  </h3>
                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canonical CTA Section */}
        <div className="mt-20">
          <CTASection
            title="Need Direct Enterprise Architecture Escalation?"
            subtitle="Connect with our lead architects to review mission-critical deployments, SLA agreements, or custom private VPC topologies."
            primaryCta={{
              label: "Submit Engineering Ticket",
              href: "/support/new",
            }}
            secondaryCta={{
              label: "Browse Help Center",
              href: "/help-center",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
