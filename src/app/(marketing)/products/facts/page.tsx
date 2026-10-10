import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { Cpu, Mic, Heart, ExternalLink, GitBranch, ArrowRight, ShieldCheck, CheckCircle2, FileText, Info } from "lucide-react";
import CTASection from "@/components/ui/cta-section";

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
    <div className="min-h-screen bg-[#07090D] text-slate-100 pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-primary selection:text-slate-950 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        <BackToHome href="/products" label="Back to Products" />

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Authoritative Product Register</span>
          </div>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-white tracking-tight uppercase leading-[1.1]">
            Public Product Fact Sheet
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-light">
            Authoritative technical, legal, and operational disclosures for software platforms developed by Logic Intelligence Technologies.
          </p>
        </div>

        {/* Corporate Notice */}
        <div className="p-6 rounded-2xl bg-[#10131A] border border-primary/30 flex items-start gap-4">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300 leading-relaxed font-light space-y-1">
            <span className="font-bold text-white block uppercase font-mono text-xs tracking-wider">
              Corporate Legal Architecture Notice
            </span>
            <span>
              Both <strong>Logic Voice</strong> and <strong>LIT Healthcare</strong> are proprietary software platforms wholly engineered and owned by <strong>Logic Intelligence Technologies</strong>. Neither platform constitutes an independent legal entity, subsidiary, or separate incorporated company.
            </span>
          </div>
        </div>

        {/* Product 1: Logic Voice */}
        <section className="bg-[#10131A] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 hover:border-primary/40 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Logic Voice</h2>
                  <p className="text-xs text-primary font-mono font-semibold uppercase tracking-wider mt-0.5">
                    Voice-First Personal AI Assistant &amp; Automation
                  </p>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#151922] text-slate-300 border border-white/10 self-start sm:self-auto">
              Proprietary Platform
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Category</p>
              <p className="text-slate-200 font-medium">AI Voice Assistant / Personal AI Operating System</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Operational Target</p>
              <p className="text-slate-200 font-medium">Autonomous Goal Planning &amp; Voice Tool Execution</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Live Platform Endpoint</p>
              <a
                href={COMPANY.products.logicVoice.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1.5 font-mono text-xs mt-0.5"
              >
                <span>{COMPANY.products.logicVoice.websiteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Source Repository</p>
              <a
                href="https://github.com/vikashsaravanann/logic-voice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white inline-flex items-center gap-1.5 font-mono text-xs mt-0.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-primary" />
                <span>vikashsaravanann/logic-voice</span>
              </a>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Architectural Boundaries &amp; Safety</p>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Logic Voice operates with explicit safety gates. Consequential tool execution (database mutations, external communications, third-party transactions) strictly requires authenticated confirmation. Inventions or unsupported claims regarding universal zero-setup integrations are prohibited in company technical literature.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/products/logic-voice"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary hover:text-[#6DE6E0] transition-colors"
            >
              <span>Explore Logic Voice Architecture &amp; Technical Specs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Product 2: LIT Healthcare */}
        <section className="bg-[#10131A] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 hover:border-primary/40 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1565C0]/20 border border-[#1565C0]/40 flex items-center justify-center text-[#45D9D2]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">LIT Healthcare</h2>
                  <p className="text-xs text-[#45D9D2] font-mono font-semibold uppercase tracking-wider mt-0.5">
                    Smart Hospital Management &amp; Clinical Intelligence
                  </p>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-[#151922] text-slate-300 border border-white/10 self-start sm:self-auto">
              Proprietary Platform
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Category</p>
              <p className="text-slate-200 font-medium">Healthcare Technology · Multi-Tenant HMS</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Deployment Scale</p>
              <p className="text-slate-200 font-medium">Clinics, Specialty Centers, Hospital Networks</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Live Platform Endpoint</p>
              <a
                href={COMPANY.products.healthcare.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#45D9D2] hover:underline inline-flex items-center gap-1.5 font-mono text-xs mt-0.5"
              >
                <span>{COMPANY.products.healthcare.websiteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Source Repository</p>
              <a
                href="https://github.com/vikashsaravanann/lit-smart-hospital-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white inline-flex items-center gap-1.5 font-mono text-xs mt-0.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-primary" />
                <span>vikashsaravanann/lit-smart-hospital-platform</span>
              </a>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <p className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Clinical Governance &amp; Data Isolation</p>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              LIT Healthcare implements multi-organization row-level security (RLS) separating clinical databases strictly per facility. Clinical intelligence tools function strictly in assistive advisory modes under licensed medical staff oversight; autonomous clinical diagnosis is prohibited.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/healthcare"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#45D9D2] hover:text-primary transition-colors"
            >
              <span>Explore LIT Healthcare Workspaces &amp; Subscription Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Closing CTA */}
        <CTASection
          title="See Our Proprietary Platforms in Action"
          subtitle="Explore Logic Voice and LIT Healthcare live, or schedule a technical walkthrough with our lead architects."
          primaryCta={{ label: "Explore All Products", href: "/products" }}
          secondaryCta={{ label: "Contact Enterprise Desk", href: "/contact" }}
        />
      </div>
    </div>
  );
}
