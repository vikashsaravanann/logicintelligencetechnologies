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
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  Database, 
  UserCheck, 
  Mail,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Logic Intelligence Technologies",
  description:
    "Enterprise privacy and data governance framework for Logic Intelligence Technologies platforms, APIs, and client services.",
  alternates: {
    canonical: "/privacy",
  },
};

const PRIVACY_SUMMARY = [
  {
    label: "Data Commercialization",
    value: "Zero Data Brokering",
    detail: "We never monetize, rent, or sell enterprise customer data",
  },
  {
    label: "Audio Streaming",
    value: "Zero Audio Persistence",
    detail: "Voice inference executes in volatile RAM with zero disk writes",
  },
  {
    label: "Encryption Standard",
    value: "TLS 1.3 & AES-256",
    detail: "Strict transit cipher suites and KMS-isolated storage",
  },
  {
    label: "Subject Rights",
    value: "Permanent Erasure",
    detail: "Full access, export, and deletion rights under DPDPA / GDPR",
  },
];

const SECTIONS = [
  {
    number: "01",
    title: "Information We Collect",
    icon: Database,
    description:
      "We collect direct inquiry information (name, corporate email, phone number, organization scope, and architectural requirements) voluntarily submitted via contact forms, plus anonymized operational telemetry (response times, client engines, Core Web Vitals) to optimize delivery quality and security verification.",
  },
  {
    number: "02",
    title: "Use of Information",
    icon: FileText,
    description:
      "Telemetry and customer inputs are used exclusively to deliver contracted software engineering services, evaluate architectural feasibility, provide customer support, execute milestone deliverables, and fulfill statutory obligations in India.",
  },
  {
    number: "03",
    title: "Real-Time Data Processing & Privacy",
    icon: Lock,
    description:
      "Our real-time AI architectures (including Logic Voice and autonomous website agents) enforce zero-persistence principles. Data is streamed in-memory with strict memory isolation and zero disk caching for transient audio payloads.",
  },
  {
    number: "04",
    title: "Data Sharing & Sovereignty",
    icon: Eye,
    description:
      "We do not monetize, rent, or sell enterprise data. Data sharing is limited strictly to vetted cloud infrastructure providers (such as Supabase, Vercel, and Upstash) under rigorous Data Processing Agreements (DPAs) and confidentiality terms.",
  },
  {
    number: "05",
    title: "User Rights & Data Access",
    icon: UserCheck,
    description:
      "Under Indian DPDPA and international privacy standards, you may request inspection, correction, export, or permanent deletion of your organizational information at any time by contacting our engineering compliance desk.",
  },
  {
    number: "06",
    title: "Compliance Contact & Data Protection Desk",
    icon: Mail,
    description: `For formal compliance inquiries, regulatory filings, or DPA requests regarding ${COMPANY.legalName}, reach our team directly at ${COMPANY.email} or call ${COMPANY.phone}.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ])}
      />

      <div className="bg-[var(--lit-cloud,#F7F9FC)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="pt-28 sm:pt-32 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unified Back Navigation */}
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Hero Header */}
          <div className="mt-4 mb-12 border-b border-[var(--lit-border-light,#DFE7EF)] pb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wide uppercase mb-4">
              <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Enterprise Privacy Framework
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading leading-tight mb-4">
              Privacy <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Policy</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Official corporate policy for {COMPANY.legalName}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {PRIVACY_SUMMARY.map((metric, idx) => (
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

          {/* Notice Card with link to main /privacy */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                  Complete Data Governance Charter
                </h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                  At <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">{COMPANY.displayName}</strong>, we design all digital platforms with privacy-by-design principles. For the comprehensive clause-by-clause legal charter, see our primary Privacy Policy document.
                </p>
              </div>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold uppercase tracking-wider shrink-0 transition-all shadow-xs"
              >
                View Full Charter
                <ExternalLink className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              </Link>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6 mb-12">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/40"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
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
                  <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-4 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]/60">
                    {sec.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Help Bar */}
          <PageHelpBar title="Questions about your data?" />
        </div>
      </div>
    </PageShell>
  );
}
