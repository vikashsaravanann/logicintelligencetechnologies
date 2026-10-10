import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { BackButton } from '@/components/navigation/back-button';
import JsonLd from '@/components/seo/json-ld';
import { breadcrumb } from '@/lib/seo/schema';
import { COMPANY, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { Scale, FileCheck2, Code2, ShieldAlert, Gavel, Mail, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: 'Terms of Service | Logic Intelligence Technologies',
  description: 'Enterprise terms of service governing software engineering contracts, platforms, and API access.',
  alternates: {
    canonical: '/terms',
  },
};

const TERMS_METRICS = [
  { label: 'SLA Target', value: '99.9%', detail: 'Production platform uptime standard' },
  { label: 'IP Assignment', value: '100%', detail: 'Full client ownership on milestone settlement' },
  { label: 'Jurisdiction', value: 'India', detail: 'Governed under laws of Tamil Nadu' },
  { label: 'Warranty Scope', value: '90 Days', detail: 'Defect remediation post-delivery' },
];

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    icon: FileCheck2,
    badgeColor: "bg-teal-500/10 text-[var(--lit-teal,#1FA9A2)] border-teal-500/20",
    description: `By accessing or using the digital products, hosted platforms, and consulting services provided by ${COMPANY.legalName}, you agree to be bound by these Terms of Service, corresponding Statements of Work (SOWs), and Service Level Agreements. These terms constitute a legally enforceable master services agreement between your enterprise entity and Logic Intelligence Technologies.`,
  },
  {
    number: "02",
    title: "Engineering Services & Platform Access",
    icon: Code2,
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: `All engineering deliverables—including autonomous AI workflows, Logic Voice infrastructure, custom web platforms, and cloud telemetry integrations—are rendered strictly in accordance with approved milestone specifications. Platform access is non-transferable, authenticated via secure credentials, and subjected to automated API rate bounds.`,
  },
  {
    number: "03",
    title: "Intellectual Property Ownership",
    icon: Scale,
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description: `Pre-existing foundational libraries, generic algorithms, and core platform engines remain the exclusive intellectual property of ${COMPANY.legalName}. Bespoke client implementations, unique database schemas, workflows, and trained tenant models transfer irrevocably to the client upon settlement of the respective milestone invoices.`,
  },
  {
    number: "04",
    title: "Limitation of Liability & Indemnity",
    icon: ShieldAlert,
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    description: `Services and software packages are engineered according to enterprise-grade fault tolerance benchmarks. To the maximum extent permitted by applicable law, aggregate financial liability for any claim arising out of the engagement is capped at the total professional fees paid under the prevailing milestone statement of work.`,
  },
  {
    number: "05",
    title: "Governing Law & Jurisdiction",
    icon: Gavel,
    badgeColor: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    description: `These Terms are governed by and construed in accordance with the laws of India. Any disputes or arbitration proceedings arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Coimbatore, Tamil Nadu, India, following good-faith bilateral executive review.`,
  },
  {
    number: "06",
    title: "Commercial Notices & Legal Inquiries",
    icon: Mail,
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    description: `Formal contractual notices, bespoke master services agreement amendments, and compliance communications must be submitted in writing to our corporate legal team at ${COMPANY.email} or served to our registered office in Coimbatore, Tamil Nadu.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms-of-service" },
        ])}
      />

      <div className="pt-28 pb-20 bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] border border-blue-200 mb-4">
              <Scale className="w-3.5 h-3.5" />
              Contractual Framework • Terms of Service
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading mb-4">
              Terms of <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Service</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} • Governing master terms for {COMPANY.legalName} • Canonical terms document
            </p>
          </div>

          {/* Canonical Cross-Reference Notice */}
          <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                  Primary Commercial Terms Charter
                </p>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  This document serves as an overview of our contractual framework. For our comprehensive, section-by-section Terms of Use, please consult the canonical terms directory.
                </p>
              </div>
            </div>
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-teal,#1FA9A2)] transition-colors shrink-0 shadow-xs"
            >
              <span>Canonical Terms</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {TERMS_METRICS.map((metric, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs"
              >
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--lit-navy,#0B2545)] mb-1">
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

          {/* Overview Statement */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-10">
            <h2 className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2">
              Master Engagement Standard
            </h2>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              Welcome to <span className="text-[var(--lit-navy,#0B2545)] font-semibold">{COMPANY.legalName}</span>. These terms govern enterprise engagement with our engineering platforms, APIs, Logic Voice deployments, and bespoke software solutions. By entering into an SOW or utilizing our digital infrastructure, you confirm authorization to bind your enterprise to these provisions.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${sec.badgeColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] font-semibold px-2.5 py-1 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      § {sec.number}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-4 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    {sec.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Legal Office Contact Card */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                  Enterprise Legal & Commercial Counsel
                </h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
                  Custom master services agreements (MSAs), security exhibits, and NDAs:
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--lit-blue,#1565C0)] hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{COMPANY.email}</span>
                  </a>
                  <span className="text-[var(--lit-border-light,#DFE7EF)]">•</span>
                  <span className="text-[var(--lit-text-muted,#52677C)]">
                    {COMPANY.location.city}, {COMPANY.location.state}, {COMPANY.location.country}
                  </span>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-teal,#1FA9A2)] transition-colors shrink-0 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Contact Legal Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions regarding our enterprise terms of service?" />
    </PageShell>
  );
}
