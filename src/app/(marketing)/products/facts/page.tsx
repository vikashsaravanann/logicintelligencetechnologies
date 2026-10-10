import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { Cpu, Mic, Heart, ExternalLink, GitBranch, ArrowRight } from "lucide-react";

import CTASection from "@/components/ui/cta-section";
export const metadata: Metadata = {
  title: "Product Facts | Logic Intelligence Technologies",
  description:
    "Authoritative public fact sheet for Logic Voice and LIT Healthcare — products developed by Logic Intelligence Technologies",
};

export default function ProductFactsPage() {
  return (
    <div className="min-h-screen bg-[#0A1530] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <BackToHome />

        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Authoritative Product Register
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Public Product Fact Sheet
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Authoritative technical and governance facts for products developed by Logic Intelligence Technologies
          </p>
        </div>

        {/* Essential Corporate Governance Notice */}
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-sm text-blue-200 leading-relaxed">
          <strong>Corporate Notice:</strong> Both <strong>Logic Voice</strong> and <strong>LIT Healthcare</strong> are official products of <strong>Logic Intelligence Technologies</strong> Neither product is an independent legal entity or company.
        </div>

        {/* Product 1: Logic Voice */}
        <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Logic Voice</h2>
              </div>
              <p className="text-sm text-cyan-400 font-semibold mt-1">
                Voice-First Personal AI Assistant
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto font-medium">
              Product of Logic Intelligence Technologies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Category</p>
              <p className="text-slate-200 mt-1">AI Voice Assistant / Personal AI Assistant</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Long-Term Vision</p>
              <p className="text-slate-200 mt-1">Personal AI Operating System</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Public Website</p>
              <a
                href={COMPANY.products.logicVoice.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 mt-1 font-mono text-xs"
              >
                {COMPANY.products.logicVoice.websiteUrl} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Repository</p>
              <p className="flex items-center gap-1 mt-1 font-mono text-xs text-slate-300">
                Private repository <GitBranch className="w-3.5 h-3.5" aria-hidden />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Product Capabilities & Pipeline</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Logic Voice is designed for natural speech interaction, speech recognition, reasoning, planning, approved tool execution, research, and intelligent automation. Capabilities are gated behind explicit user confirmations for sensitive actions. Integrations under active development are structured in safe stages without fabricating unsupported connections.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/products/logic-voice"
              className="inline-flex items-center gap-2 text-sm text-cyan-400 font-bold hover:underline"
            >
              Explore Logic Voice Architecture & Specs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Product 2: LIT Healthcare */}
        <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">LIT Healthcare</h2>
              </div>
              <p className="text-sm text-teal-400 font-semibold mt-1">
                Smart Hospital Management & Healthcare Intelligence
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 self-start sm:self-auto font-medium">
              Product of Logic Intelligence Technologies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Category</p>
              <p className="text-slate-200 mt-1">Healthcare Technology · Hospital Management System (HMS)</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Target Environments</p>
              <p className="text-slate-200 mt-1">Clinics, Multispecialty Clinics, Hospitals, Healthcare Groups</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Public Website</p>
              <a
                href={COMPANY.products.healthcare.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:underline flex items-center gap-1 mt-1 font-mono text-xs"
              >
                {COMPANY.products.healthcare.websiteUrl} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Repository</p>
              <p className="flex items-center gap-1 mt-1 font-mono text-xs text-slate-300">
                Private repository <GitBranch className="w-3.5 h-3.5" aria-hidden />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Architecture Flow & Defensible Positioning</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              LIT Healthcare provides a multi-organization, role-based workspace architecture: <em>Patient Registration → Clinical Records → Pharmacy → Billing & Operations</em>.
              The platform centralizes facility administration while ensuring intelligence features operate under strict human oversight without autonomously replacing clinical judgment.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/healthcare"
              className="inline-flex items-center gap-2 text-sm text-teal-400 font-bold hover:underline"
            >
              Explore LIT Healthcare Features & Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
      <CTASection title="See the products in action" subtitle="Explore Logic Voice and LIT Healthcare, or talk to us about your use case." primaryCta={{ label: "Explore products", href: "/products" }} secondaryCta={{ label: "Contact us", href: "/contact" }} />
    </div>
  );
}
