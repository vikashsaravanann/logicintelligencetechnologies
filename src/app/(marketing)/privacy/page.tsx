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
  Server,
  FileKey
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Logic Intelligence Technologies",
  description:
    "How Logic Intelligence Technologies collects, uses, and safeguards enterprise data and personal information. Read our full data protection policy.",
  alternates: {
    canonical: "/privacy",
  },
};

const PRIVACY_PILLARS = [
  {
    label: "Data Commercialization",
    value: "Zero Data Brokering",
    detail: "We never sell, monetize, or trade customer datasets",
  },
  {
    label: "Cryptographic Protection",
    value: "TLS 1.3 & AES-256",
    detail: "Strict transit encryption and KMS-isolated storage",
  },
  {
    label: "AI Model Retraining",
    value: "Zero Client Training",
    detail: "Customer payloads never train shared foundation models",
  },
  {
    label: "Subject Rights",
    value: "Permanent Erasure",
    detail: "Full access, export, and deletion rights under DPDPA / GDPR",
  },
];

const SECTIONS = [
  {
    id: "collection",
    number: "01",
    title: "Information We Collect",
    icon: Database,
    content: (
      <div className="space-y-4">
        <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
          We collect information you voluntarily provide when you submit project inquiries, schedule technical consultations, request enterprise demos, or communicate with our engineering leads. This includes your name, corporate email address, telephone number, organization name, and technical project requirements.
        </p>
        <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
          We also collect anonymized technical telemetry (browser engine, geographic region, referrer sources, and Core Web Vitals) through performance observability tooling to evaluate site responsiveness and platform reliability.
        </p>
      </div>
    ),
  },
  {
    id: "usage",
    number: "02",
    title: "How We Use Your Information",
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
          Data collected is strictly utilized to fulfill our contractual and technical commitments to our clients:
        </p>
        <div className="grid gap-2.5">
          {[
            "Evaluating architectural feasibility and delivering requested engineering proposals",
            "Executing development milestones, client portal access, and platform onboarding procedures",
            "Transmitting mission-critical operational alerts, security updates, and milestone progress reports",
            "Optimizing platform infrastructure, API throughput, and security baselines",
            "Complying with statutory corporate obligations and regulatory filings in India",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "sharing",
    number: "03",
    title: "Data Sharing & Third-Party Infrastructure",
    icon: Eye,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        <p>
          We do not sell, rent, or trade your corporate or personal information. Data is disclosed only to verified technical infrastructure providers (such as hosting and encrypted database platforms) strictly necessary for delivering services, bound by rigorous non-disclosure agreements and SOC 2-compliant data processing agreements.
        </p>
        <p className="text-xs sm:text-sm">
          Third-party integrations are limited to verified cloud hosts (e.g., Supabase, Vercel, Upstash) operating under ISO/IEC 27001 and GDPR compliance frameworks.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    number: "04",
    title: "Cookies & Persistent Storage",
    icon: Lock,
    content: (
      <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        {COMPANY.displayName} uses essential session cookies and performance telemetry to maintain security state, verify authenticated sessions, and measure UI response times. You can inspect or restrict cookies via your browser settings; refer to our dedicated{" "}
        <Link href="/cookie-policy" className="text-[var(--lit-blue,#1565C0)] font-semibold hover:underline">
          Cookie Policy
        </Link>{" "}
        for complete token and storage configurations.
      </p>
    ),
  },
  {
    id: "security",
    number: "05",
    title: "Data Security Architecture & Retention",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        <p>
          We enforce defense-in-depth principles across all systems, including TLS 1.3 encryption in transit, AES-256 encryption at rest, PostgreSQL Row-Level Security (RLS), and continuous automated vulnerability scans.
        </p>
        <p className="text-xs sm:text-sm">
          In accordance with Indian IT legislation and international data privacy norms, we maintain zero-disk persistence for transient AI voice streaming, executing audio inference solely in volatile RAM.
        </p>
      </div>
    ),
  },
  {
    id: "rights",
    number: "06",
    title: "Your Rights & Data Subject Requests",
    icon: UserCheck,
    content: (
      <div className="space-y-4 text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
        <p>
          Under the Digital Personal Data Protection Act (DPDPA, India) and international privacy frameworks (GDPR), you retain the right to inspect, update, export, or request the permanent erasure of any personal telemetry or account data under our custody.
        </p>
        <p className="text-xs sm:text-sm">
          To exercise these rights, submit a formal request to our Data Protection Officer at{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-[var(--lit-blue,#1565C0)] font-bold hover:underline font-mono">
            {COMPANY.email}
          </a>. Requests are acknowledged within 24 business hours and completed within statutory time limits.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    number: "07",
    title: "Corporate Compliance & Data Protection Officer",
    icon: Mail,
    content: (
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
        <h4 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-2">Corporate Compliance Officer</h4>
        <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-4">
          For legal inquiries, data protection agreements (DPAs), or regulatory audits regarding {COMPANY.legalName}:
        </p>
        <div className="space-y-2 text-xs sm:text-sm text-[var(--lit-navy,#0B2545)]">
          <div>
            <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">Email:</strong>{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-[var(--lit-blue,#1565C0)] font-medium hover:underline">
              {COMPANY.email}
            </a>
          </div>
          <div>
            <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">Phone:</strong>{" "}
            <a href={`tel:${COMPANY.phone}`} className="text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]">
              {COMPANY.phone}
            </a>
          </div>
          <div>
            <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">Jurisdiction:</strong> {COMPANY.address}
          </div>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
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
              Data Protection & Privacy Charter
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading leading-tight mb-4">
              Privacy <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Policy</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Governed under the Information Technology Act, 2000 (India) & Digital Personal Data Protection Act (DPDPA)
            </p>
          </div>

          {/* Quick Privacy Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {PRIVACY_PILLARS.map((pillar, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all"
              >
                <div className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1">
                  {pillar.label}
                </div>
                <div className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                  {pillar.value}
                </div>
                <div className="text-xs text-[var(--lit-text-muted,#52677C)] leading-normal">
                  {pillar.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Introduction Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-12">
            <p className="text-base sm:text-lg text-[var(--lit-navy,#0B2545)] leading-relaxed">
              At <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">{COMPANY.legalName}</strong>, protecting the confidentiality, integrity, and sovereignty of client datasets and user information is foundational to our engineering operations. This Privacy Policy specifies our data governance practices across our corporate website and digital interfaces.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.id}
                  id={sec.id}
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

          {/* Closing Help Bar */}
          <PageHelpBar title="Questions regarding our privacy framework?" />
        </div>
      </div>
    </PageShell>
  );
}
