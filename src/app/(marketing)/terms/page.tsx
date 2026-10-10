import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { 
  Scale, 
  FileCheck2, 
  Code2, 
  CreditCard, 
  Users, 
  ShieldAlert, 
  Gavel, 
  Mail,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Logic Intelligence Technologies",
  description:
    "The terms and conditions governing the use of Logic Intelligence Technologies' platforms, engineering deliverables, and digital services.",
  alternates: {
    canonical: "/terms",
  },
};

const TERMS_METRICS = [
  {
    label: "Delivery Model",
    value: "Milestone-Gated",
    detail: "Clear review and acceptance gates before milestone clearance",
  },
  {
    label: "IP Ownership",
    value: "100% Client Vesting",
    detail: "Bespoke code and schemas transfer upon final invoice payment",
  },
  {
    label: "Service Integrity",
    value: "Enterprise SLAs",
    detail: "Guaranteed uptime baselines, vulnerability patching & support",
  },
  {
    label: "Statutory Jurisdiction",
    value: "India (Tamil Nadu)",
    detail: "Governed under the commercial courts of Coimbatore, India",
  },
];

const TERMS_SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms & Authority",
    icon: FileCheck2,
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        By accessing this website, purchasing software packages, or executing a Statement of Work (SOW) with {COMPANY.legalName}, you explicitly agree to comply with and be bound by these Terms of Service. If you do not accept these provisions, you must immediately discontinue use of our platforms. Our engineering services are provided exclusively to commercial entities and individuals capable of executing legally binding contracts under applicable Indian law.
      </p>
    ),
  },
  {
    number: "02",
    title: "Description of Services & Upgrades",
    icon: Code2,
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        {COMPANY.displayName} provides bespoke enterprise AI systems, real-time voice intelligence architectures, custom full-stack software development, cloud infrastructure automation, and technical advisory services. We reserve the right to upgrade, modify, or deprecate technical features, software dependencies, and hosting requirements to maintain security, compliance, and operational reliability.
      </p>
    ),
  },
  {
    number: "03",
    title: "Intellectual Property Rights & Deliverable Vesting",
    icon: Scale,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        <p>
          Unless explicitly negotiated otherwise, all proprietary platform core libraries, internal frameworks, brand trademarks, and reusable UI systems remain the intellectual property of {COMPANY.legalName}.
        </p>
        <p className="text-xs sm:text-sm">
          For custom engineering engagements, intellectual property transfer of bespoke business logic, frontend interfaces, and database schemas is governed by the individual Statement of Work (SOW) or Master Services Agreement (MSA). Client ownership of custom deliverables vests fully upon settled payment of the final milestone invoice.
        </p>
      </div>
    ),
  },
  {
    number: "04",
    title: "Payments, Billing & Milestone Invoicing",
    icon: CreditCard,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        <p>
          Payment schedules and deliverables are structured around defined engineering milestones. Commencement of development requires clearance of the agreed mobilization deposit.
        </p>
        <p className="text-xs sm:text-sm">
          Invoices are net-payable according to agreed proposal terms. Late disbursements beyond grace periods may pause sprint velocity until accounts are reconciled. Refer to our dedicated{" "}
          <Link href="/refund-policy" className="text-[var(--lit-blue,#1565C0)] font-semibold hover:underline">
            Refund Policy
          </Link>{" "}
          for milestone cancellation rules and dispute procedures.
        </p>
      </div>
    ),
  },
  {
    number: "05",
    title: "Client Obligations & Collaboration",
    icon: Users,
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        Timely delivery requires reciprocal responsiveness. Clients are responsible for providing requisite API access tokens, domain DNS records, content assets, and sign-offs within sprint review cycles. Project delays caused by outstanding client prerequisites will result in commensurate timeline adjustments without penalty to {COMPANY.displayName}.
      </p>
    ),
  },
  {
    number: "06",
    title: "Limitation of Liability & Infrastructure Boundaries",
    icon: ShieldAlert,
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        In no event shall {COMPANY.legalName}, its directors, or engineering personnel be held liable for indirect, consequential, punitive, or loss-of-profit damages arising out of third-party cloud outages, third-party model latency, upstream API deprecations, or unauthorized client infrastructure modifications. Maximum aggregate liability under any claim shall not exceed the total fees paid by the client under the specific SOW during the preceding 3-month period.
      </p>
    ),
  },
  {
    number: "07",
    title: "Governing Law & Dispute Resolution",
    icon: Gavel,
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        These Terms shall be interpreted, enforced, and construed under the laws of the Republic of India. Any irreconcilable dispute arising from or related to these Terms or platform operations shall be subject to the exclusive jurisdiction of the competent commercial courts of Coimbatore, Tamil Nadu, India.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />

      <div className="bg-[var(--lit-cloud,#F7F9FC)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="pt-28 sm:pt-32 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unified Back Navigation */}
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Hero Header */}
          <div className="mt-4 mb-12 border-b border-[var(--lit-border-light,#DFE7EF)] pb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wide uppercase mb-4">
              <Scale className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Legal & Service Agreement
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading leading-tight mb-4">
              Terms of <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Service</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Applicable to all client engagements and digital services for {COMPANY.legalName}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {TERMS_METRICS.map((metric, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all"
              >
                <div className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1">
                  {metric.label}
                </div>
                <div className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                  {metric.value}
                </div>
                <div className="text-xs text-[var(--lit-text-muted,#52677C)] leading-normal">
                  {metric.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Overview Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-12">
            <p className="text-base sm:text-lg text-[var(--lit-navy,#0B2545)] leading-relaxed">
              Welcome to <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">{COMPANY.legalName}</strong>. These Terms of Service delineate the legal framework governing enterprise service procurement, intellectual property rights, milestone invoicing, and platform governance.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6 mb-12">
            {TERMS_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.number}
                  id={`section-${sec.number}`}
                  className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/40"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-[var(--lit-teal,#1FA9A2)] font-bold px-2.5 py-1 rounded-md bg-[var(--lit-teal,#1FA9A2)]/10">
                      {sec.number}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]/60">
                    {sec.content}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Counsel Inquiries Box */}
          <div className="rounded-3xl border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-light-blue,#E7F3FF)]/40 p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] mb-2">
                <Mail className="w-4 h-4" />
                Legal Consultation Desk
              </div>
              <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                Questions Regarding Custom Master Services Agreements?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] max-w-xl">
                Our legal team is available to review bespoke Master Services Agreements (MSAs), custom enterprise SLAs, or corporate procurement contracts.
              </p>
            </div>
            <a
              href={`mailto:${COMPANY.email}?subject=Legal%20Terms%20Inquiry`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-teal,#1FA9A2)] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs shrink-0"
            >
              Contact Counsel
            </a>
          </div>

          {/* Help Bar */}
          <PageHelpBar title="Questions about these terms?" />
        </div>
      </div>
    </PageShell>
  );
}
