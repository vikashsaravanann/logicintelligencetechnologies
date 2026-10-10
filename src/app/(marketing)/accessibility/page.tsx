import React from "react";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Keyboard, 
  Sparkles, 
  Monitor, 
  Mail, 
  Phone, 
  MapPin,
  Sliders,
  Compass
} from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility Statement | Logic Intelligence Technologies",
  description:
    "Our commitment to digital accessibility, WCAG 2.2 AA conformance, keyboard navigation, and inclusive engineering standards across all digital properties.",
  alternates: {
    canonical: "/accessibility",
  },
};

const ACCESSIBILITY_PILLARS = [
  {
    label: "Target Standard",
    value: "WCAG 2.2 Level AA",
    detail: "Conformance across all public and portal interfaces",
  },
  {
    label: "Keyboard Navigation",
    value: "100% Operable",
    detail: "Full sequential tab order with zero focus traps",
  },
  {
    label: "Color Science",
    value: "4.5:1+ Contrast",
    detail: "Exceeds minimum visual contrast thresholds",
  },
  {
    label: "Motion Preference",
    value: "prefers-reduced-motion",
    detail: "Dynamic animations automatically yield to system settings",
  },
];

const ACCESSIBILITY_FEATURES = [
  {
    title: "Semantic HTML5 Landmark Architecture",
    description: "Strict structural hierarchy using native landmarks (<main>, <nav>, <header>, <footer>, <section>, <article>) for intuitive screen reader navigation and predictable tree traversal.",
  },
  {
    title: "Full Keyboard Operability & Focus Boundaries",
    description: "All interactive controls, modals, and drawers support Tab, Shift+Tab, and Escape key navigation with high-visibility teal focus rings and zero focus traps.",
  },
  {
    title: "Accessible ARIA & Live Announcement Regions",
    description: "Dynamic content updates (such as form submission validation, search filters, and asynchronous state changes) utilize polite ARIA live regions and explicit role definitions.",
  },
  {
    title: "Rigorous Calculated Contrast Ratios",
    description: "Color tokens strictly enforce WCAG 2.2 AA contrast ratios exceeding 4.5:1 for body copy and 3.0:1 for elevated UI surfaces and iconography against light and dark backgrounds.",
  },
  {
    title: "Reduced Motion & Fluid Responsive Typography",
    description: "Respects prefers-reduced-motion system preferences across all transitions, paired with fluid clamp() typography that scales up to 200% without horizontal clipping.",
  },
  {
    title: "Screen Reader & Assistive Tech Audits",
    description: "Tested and audited against modern assistive technologies including NVDA, JAWS, macOS/iOS VoiceOver, and Android TalkBack across Chromium, WebKit, and Gecko engines.",
  },
];

export default function AccessibilityPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Accessibility Statement", path: "/accessibility" },
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
              WCAG 2.2 Level AA Conformance Standard
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading leading-tight mb-4">
              Accessibility <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">Statement</span>
            </h1>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Universal accessibility charter for {COMPANY.legalName}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {ACCESSIBILITY_PILLARS.map((pillar, idx) => (
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

          {/* Intro Commitment Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-12">
            <p className="text-base sm:text-lg text-[var(--lit-navy,#0B2545)] leading-relaxed">
              At <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">{COMPANY.legalName}</strong>, we are committed to ensuring digital accessibility for all users regardless of ability, neurodiversity, or assistive device. We engineer, benchmark, and audit our digital properties to conform with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.
            </p>
          </div>

          {/* Implemented Engineering Standards */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                  Implemented Engineering Standards
                </h2>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                  Architectural safeguards embedded directly into our React component library and CSS design system.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {ACCESSIBILITY_FEATURES.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white flex items-start gap-4 hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[var(--lit-navy,#0B2545)] text-base font-heading mb-1">{feat.title}</h3>
                    <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assistive Tech Compatibility Matrix */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--lit-soft-lilac,#EDE7F6)] text-[#6D28D9] flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                  Assistive Technology Environments Tested
                </h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                  Continuous multi-device validation matrix covering screen readers, magnification tools, and keyboard inputs.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6">
              Our frontends are periodically verified across various assistive environments and input modalities:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/70">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] block mb-1">
                  Desktop Assistive Setups
                </span>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                  NVDA (Chrome & Firefox) &bull; Freedom Scientific JAWS &bull; Apple VoiceOver (macOS Safari & Chrome)
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/70">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] block mb-1">
                  Mobile Assistive Modalities
                </span>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                  Apple VoiceOver (iOS Mobile Safari) &bull; Google TalkBack (Android Chrome Mobile) &bull; Switch Access
                </p>
              </div>
            </div>
          </div>

          {/* Coordinator Support Desk */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs mb-12">
            <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-2 flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
              Accessibility Coordinator Support Desk
            </h3>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] mb-6 leading-relaxed">
              If you encounter an accessibility barrier or require an alternate document format, please reach out to our team. We remediate identified accessibility tickets within 48 business hours.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/60">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1">
                  <Mail className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  Email Support
                </div>
                <a 
                  href={`mailto:${COMPANY.email}?subject=Accessibility%20Barrier%20Report`} 
                  className="text-xs font-bold text-[var(--lit-blue,#1565C0)] hover:underline break-all"
                >
                  {COMPANY.email}
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/60">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1">
                  <Phone className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  Direct Phone
                </div>
                <a 
                  href={`tel:${COMPANY.phone}`} 
                  className="text-xs text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] font-semibold"
                >
                  {COMPANY.phone}
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/60">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1">
                  <MapPin className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                  Headquarters
                </div>
                <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
                  {COMPANY.address}
                </span>
              </div>
            </div>
          </div>

          {/* Help Bar */}
          <PageHelpBar 
            title="Encountered an accessibility barrier?" 
            text="Report an issue to our engineering team for immediate review and rapid remediation." 
          />
        </div>
      </div>
    </PageShell>
  );
}
