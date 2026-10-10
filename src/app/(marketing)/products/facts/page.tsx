import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import { COMPANY } from "@/config/company";
import {
  Mic,
  Heart,
  ExternalLink,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Authoritative Product Register & Fact Sheet | Logic Intelligence Technologies",
  description:
    "Authoritative public technical and governance register for Logic Voice and LIT Healthcare — proprietary products developed by Logic Intelligence Technologies.",
  alternates: {
    canonical: "/products/facts",
  },
};

export default function ProductFactsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <div>
          <BackButton fallbackHref="/products" label="Back to Products" inline />
        </div>

        {/* Header */}
        <div className="space-y-4 border-b border-[var(--lit-border-light,#DFE7EF)] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FA9A2]/10 border border-[#1FA9A2]/25 text-[#0E7A74] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Authoritative Product Register · Corporate Disclosure</span>
          </div>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-[var(--lit-navy,#0B2545)] tracking-tight uppercase leading-[1.1]">
            Public Product{' '}
            <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
              Fact Sheet
            </span>
          </h1>
          <p className="text-[var(--lit-text-muted,#52677C)] text-base sm:text-lg leading-relaxed font-normal">
            Authoritative technical, legal, and operational disclosures for software platforms developed by Logic Intelligence Technologies.
          </p>
        </div>

        {/* Corporate Notice */}
        <div className="p-6 rounded-2xl bg-[#E7F3FF]/70 border border-[#1565C0]/30 flex items-start gap-4 shadow-xs">
          <Info className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed space-y-1">
            <span className="font-bold text-[var(--lit-navy,#0B2545)] block uppercase font-mono text-xs tracking-wider">
              Corporate Legal Architecture Notice
            </span>
            <p>
              Both <strong className="text-[var(--lit-ink,#121826)] font-semibold">Logic Voice</strong> and{' '}
              <strong className="text-[var(--lit-ink,#121826)] font-semibold">LIT Healthcare</strong> are proprietary software platforms wholly engineered and owned by{' '}
              <strong className="text-[var(--lit-ink,#121826)] font-semibold">Logic Intelligence Technologies</strong>. Neither platform constitutes an independent legal entity, subsidiary, or separate incorporated company.
            </p>
          </div>
        </div>

        {/* Product 1: Logic Voice */}
        <section className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#1FA9A2]/10 border border-[#1FA9A2]/25 flex items-center justify-center text-[#0E7A74]">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                  Logic Voice
                </h2>
                <p className="text-xs text-[#0E7A74] font-mono font-semibold uppercase tracking-wider mt-0.5">
                  Voice-First Personal AI Assistant &amp; Automation
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#E7F3FF] text-[#1565C0] border border-[#1565C0]/20 self-start sm:self-auto">
              Proprietary Platform
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Category
              </p>
              <p className="text-[var(--lit-ink,#121826)] font-semibold">
                AI Voice Assistant / Personal AI Operating System
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Operational Target
              </p>
              <p className="text-[var(--lit-ink,#121826)] font-semibold">
                Autonomous Goal Planning &amp; Voice Tool Execution
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Live Platform Endpoint
              </p>
              <a
                href={COMPANY.products.logicVoice.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1565C0] hover:underline inline-flex items-center gap-1.5 font-mono text-xs mt-0.5 font-medium"
              >
                <span>{COMPANY.products.logicVoice.websiteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Source Repository
              </p>
              <a
                href="https://github.com/vikashsaravanann/logic-voice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--lit-navy,#0B2545)] hover:text-[#1565C0] inline-flex items-center gap-1.5 font-mono text-xs mt-0.5 font-medium"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#0E7A74]" />
                <span>vikashsaravanann/logic-voice</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F1ECFF]/50 border border-[#7C3AED]/20 space-y-1.5">
            <p className="text-xs text-[#7C3AED] font-mono font-semibold uppercase tracking-wider">
              Architectural Boundaries &amp; Safety
            </p>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              Logic Voice operates with explicit safety gates. Consequential tool execution (database mutations, external communications, third-party transactions) strictly requires authenticated confirmation. Inventions or unsupported claims regarding universal zero-setup integrations are prohibited in company technical literature.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/products/logic-voice"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1565C0] hover:text-[#0E7A74] transition-colors"
            >
              <span>Explore Logic Voice Architecture &amp; Technical Specs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Product 2: LIT Healthcare */}
        <section className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#E7F3FF] border border-[#1565C0]/20 flex items-center justify-center text-[#1565C0]">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                  LIT Healthcare
                </h2>
                <p className="text-xs text-[#1565C0] font-mono font-semibold uppercase tracking-wider mt-0.5">
                  Smart Hospital Management &amp; Clinical Intelligence
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#059669]/20 self-start sm:self-auto">
              Proprietary Platform
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Category
              </p>
              <p className="text-[var(--lit-ink,#121826)] font-semibold">
                Healthcare Technology · Multi-Tenant HMS
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Deployment Scale
              </p>
              <p className="text-[var(--lit-ink,#121826)] font-semibold">
                Clinics, Specialty Centers, Hospital Networks
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Live Platform Endpoint
              </p>
              <a
                href={COMPANY.products.healthcare.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1565C0] hover:underline inline-flex items-center gap-1.5 font-mono text-xs mt-0.5 font-medium"
              >
                <span>{COMPANY.products.healthcare.websiteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono font-semibold uppercase tracking-wider">
                Source Repository
              </p>
              <a
                href="https://github.com/vikashsaravanann/lit-smart-hospital-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--lit-navy,#0B2545)] hover:text-[#1565C0] inline-flex items-center gap-1.5 font-mono text-xs mt-0.5 font-medium"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#0E7A74]" />
                <span>vikashsaravanann/lit-smart-hospital-platform</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#ECFDF5]/60 border border-[#059669]/20 space-y-1.5">
            <p className="text-xs text-[#059669] font-mono font-semibold uppercase tracking-wider">
              Clinical Governance &amp; Data Isolation
            </p>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              LIT Healthcare implements multi-organization row-level security (RLS) separating clinical databases strictly per facility. Clinical intelligence tools function strictly in assistive advisory modes under licensed medical staff oversight; autonomous clinical diagnosis is prohibited.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/healthcare"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1565C0] hover:text-[#0E7A74] transition-colors"
            >
              <span>Explore LIT Healthcare Workspaces &amp; Subscription Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative rounded-3xl overflow-hidden bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-12 text-center shadow-xl border border-white/10">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(69,217,210,0.18), transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              See Our Proprietary Platforms in Action
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Explore Logic Voice and LIT Healthcare live, or schedule a technical walkthrough with our lead architects.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/products"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1FA9A2] to-[#45D9D2] text-[var(--lit-navy,#0B2545)] font-bold text-sm hover:brightness-105 shadow-md transition-all"
              >
                <span>Explore All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <span>Contact Enterprise Desk</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
