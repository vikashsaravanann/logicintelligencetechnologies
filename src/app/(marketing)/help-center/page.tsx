import React from "react";
import type { Metadata } from "next";
import {
  LifeBuoy,
  ShieldCheck,
  Clock,
  Cpu,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import HelpCenterInteractive from "./components/HelpCenterInteractive";

export const metadata: Metadata = {
  title: "Help Center & Knowledge Base | Logic Intelligence Technologies",
  description:
    "Enterprise help desk, architectural FAQs, SLA guarantees, deployment guides, and priority L3 engineering support.",
  alternates: {
    canonical: "/help-center",
  },
  openGraph: {
    title: "Help Center & Knowledge Base | Logic Intelligence Technologies",
    description:
      "Enterprise support desk, architectural guides, security FAQs, and direct SLA engineering escalation channels.",
    images: [
      {
        url: "/api/og?title=Help+Center&category=Support+Knowledge+Hub",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies Help Center",
      },
    ],
  },
};

const TRUST_METRICS = [
  {
    icon: Clock,
    metric: "99.99% SLA",
    label: "Contractual Uptime",
    accent: "text-[#1565C0] bg-[#E7F3FF] border-[#BBDEFB]",
  },
  {
    icon: ShieldCheck,
    metric: "< 15 Mins",
    label: "Sev-1 Triage Response",
    accent: "text-[#00796B] bg-[#E0F2F1] border-[#B2DFDB]",
  },
  {
    icon: Cpu,
    metric: "Tier-3 Direct",
    label: "Full-Stack SRE Engineers",
    accent: "text-[#5E35B1] bg-[#EDE7F6] border-[#D1C4E9]",
  },
  {
    icon: CheckCircle2,
    metric: "SOC-2 & HIPAA",
    label: "Zero-Persistence Security",
    accent: "text-[#B78103] bg-[#FFF8E1] border-[#FFE082]",
  },
];

export default function HelpCenterPage() {
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Help Center", path: "/help-center" },
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
          <div className="text-center space-y-5 mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Enterprise Support & Knowledge Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Enterprise Help Desk & <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Support Knowledge Base
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
              Search operational protocols, architectural FAQs, security disclosures, and SLA agreements, or connect directly with our tier-3 systems engineers.
            </p>

            {/* Quick Trust Metric Strip */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
              {TRUST_METRICS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                        {item.metric}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border ${item.accent}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-medium leading-tight">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Search, Categories, FAQs and Sidebar */}
          <HelpCenterInteractive />
        </div>

        {/* Canonical CTA Section */}
        <div className="mt-20">
          <CTASection
            title="Need Dedicated SLA Engineering Support?"
            subtitle="Connect with our site reliability engineering desk for custom enterprise onboarding, VPC deployment assistance, or SLA guarantees."
            primaryCta={{
              label: "Submit Engineering Ticket",
              href: "/support/new",
            }}
            secondaryCta={{
              label: "Explore API Reference",
              href: "/docs/api",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
