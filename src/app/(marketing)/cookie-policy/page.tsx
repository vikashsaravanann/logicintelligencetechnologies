import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { Cookie, ShieldCheck, Activity, Settings2, ExternalLink, Mail, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | Logic Intelligence Technologies",
  description:
    "Learn how Logic Intelligence Technologies manages session tokens, essential cookies, and privacy-preserving performance telemetry.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

const COOKIE_METRICS = [
  { label: "Third-Party Ads", value: "0 Trackers", detail: "Zero commercial advertising networks" },
  { label: "Profiling Pixels", value: "None", detail: "No cross-site fingerprinting or targeting" },
  { label: "Auth Tokens", value: "HTTP-Only", detail: "Encrypted against cross-site scripting (XSS)" },
  { label: "Compliance Standard", value: "GDPR / DPDPA", detail: "Privacy-first strict consent model" },
];

const COOKIE_CATEGORIES = [
  {
    icon: ShieldCheck,
    title: "Essential & Authentication Storage",
    badge: "Strictly Necessary",
    badgeColor: "bg-teal-500/10 text-[var(--lit-teal,#1FA9A2)] border-teal-500/20",
    description:
      "Required for foundational platform operation, cross-site request forgery (CSRF) defense, and secure cryptographic enterprise session management. These tokens operate strictly in-memory or via secure HTTP-only cookies and cannot be disabled.",
    items: [
      { name: "sb-auth-token", purpose: "Encrypted JWT session state for authenticated client and admin portal access", duration: "Session / 30 Days" },
      { name: "lit-csrf-token", purpose: "Protects mutating API requests against cross-site request forgery attacks", duration: "Session" },
    ],
  },
  {
    icon: Activity,
    title: "Performance & Diagnostic Telemetry",
    badge: "Anonymized Analytics",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description:
      "Anonymized Real User Monitoring (RUM) and Core Web Vitals (LCP, INP, CLS) telemetry designed to diagnose edge network latency and render performance. This telemetry is strictly non-identifiable and never correlated with personal user accounts.",
    items: [
      { name: "_vercel_speed_insights", purpose: "Edge server latency measurement and Core Web Vitals diagnostics", duration: "Session" },
      { name: "_vercel_analytics", purpose: "Anonymized navigation route transitions and viewport responsiveness metrics", duration: "Session" },
    ],
  },
  {
    icon: Settings2,
    title: "Functional & Interactive State",
    badge: "Experience Preservation",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description:
      "Preserves client-side form progress across multi-step tools such as the Architecture Checklist and Discovery Intake so technical work is not lost during browser tab navigation.",
    items: [
      { name: "lit-discovery-state", purpose: "Caches draft questionnaire responses locally to prevent data loss before submission", duration: "Local Session" },
      { name: "lit-consent-pref", purpose: "Records user cookie category preferences and opt-in status", duration: "1 Year" },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Cookie Policy", path: "/cookie-policy" },
        ])}
      />

      <div className="pt-28 pb-20 bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[var(--lit-light-purple,#F1ECFF)] text-purple-700 border border-purple-200 mb-4">
              <Cookie className="w-3.5 h-3.5" />
              Telemetry & Local Storage Governance
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading mb-4">
              Cookie & <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Telemetry Policy</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} • Privacy-first telemetry standard for {COMPANY.legalName}
            </p>
          </div>

          {/* Privacy Commitment Banner */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                  Zero Commercial Tracking Guarantee
                </h2>
                <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                  At <span className="text-[var(--lit-navy,#0B2545)] font-semibold">{COMPANY.displayName}</span>, we uphold radical privacy standards. We do not sell consumer telemetry, execute third-party ad retargeting, or embed behavioral profiling pixels. Local browser storage is reserved exclusively for cryptographic authentication and necessary platform stability.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {COOKIE_METRICS.map((metric, i) => (
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

          {/* Cookie Categories */}
          <div className="space-y-8">
            {COOKIE_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <section
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs transition-all hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cat.badgeColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight font-heading">
                        {cat.title}
                      </h2>
                    </div>
                    <span className={`text-xs font-mono font-medium px-3 py-1 rounded-full border self-start sm:self-auto ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6">
                    {cat.description}
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] font-mono">
                          <th className="py-3 px-4 font-semibold">Identifier</th>
                          <th className="py-3 px-4 font-semibold">Operational Purpose</th>
                          <th className="py-3 px-4 font-semibold">Retention Period</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)]">
                        {cat.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className="hover:bg-white/60 transition-colors">
                            <td className="py-3 px-4 font-mono text-[var(--lit-blue,#1565C0)] font-semibold whitespace-nowrap">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 leading-relaxed">{item.purpose}</td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                              {item.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Browser Control Section */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
            <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2 font-heading">
              Managing Local Browser Preferences
            </h3>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-4">
              All contemporary web browsers enable users to inspect, clear, or block local cookies and web storage partitions. You can adjust your client browser settings to block non-essential telemetry or clear session data upon closing your browser window.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://www.aboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--lit-blue,#1565C0)] hover:underline"
              >
                <span>Independent Browser Cookie Guide (AboutCookies.org)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[var(--lit-border-light,#DFE7EF)] hidden sm:inline">•</span>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--lit-teal,#1FA9A2)] hover:underline"
              >
                <span>Comprehensive Privacy Charter</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Data Protection Inquiries Card */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  Telemetry & Data Protection Officer Desk
                </h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
                  For formal inquiries regarding telemetry data, session cryptography, or DPDPA / GDPR compliance:
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--lit-blue,#1565C0)] hover:underline"
                  >
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
                <span>Contact Privacy Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions regarding cookie consent or telemetry policies?" />
    </PageShell>
  );
}
