import React from "react";
import { 
  Scale, 
  Fingerprint, 
  EyeOff, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Responsible AI Guidelines | Logic Intelligence Technologies",
  description: "Strict ethical frameworks, algorithmic fairness, identity preservation, and privacy protocols governing enterprise AI at Logic Intelligence Technologies.",
};

const ETHICAL_PRINCIPLES = [
  {
    title: "Data Ephemerality & Privacy by Design",
    subtitle: "Zero Model Retraining on Customer Data",
    icon: EyeOff,
    desc: "Our primary architecture relies on volatile memory processing for real-time audio and textual streams. We never retain, pool, or use your organization's confidential telemetry, clinical records, or customer conversations to train foundational models.",
  },
  {
    title: "Algorithmic Rigor & Fair Representation",
    subtitle: "Demographic and Accent Equity",
    icon: Scale,
    desc: "Our conversational evaluation benchmarks and acoustic models are tested across diverse accents, vernacular speech patterns, and linguistic profiles to minimize bias and ensure consistent accuracy across all demographics.",
  },
  {
    title: "Biometric & Identity Protection",
    subtitle: "No Deceptive Cloning",
    icon: Fingerprint,
    desc: "We build AI systems to assist and augment humans, not mimic them without explicit authorization. We categorically reject contracts or applications involving non-consensual voice replication, deepfake spoofing, or deceptive synthetic media.",
  },
  {
    title: "Human-in-the-Loop Safeguards",
    subtitle: "Deterministic Bounds for Critical Decisions",
    icon: Users,
    desc: "In clinical environments and high-stakes operational workflows, our AI produces structured decision support, contextual summaries, and risk indicators. Final authoritative actions remain under human governance and control.",
  },
];

const COMPLIANCE_ITEMS = [
  {
    framework: "EU AI Act Alignment",
    detail: "Clear classification of high-risk operational tiers with transparent algorithmic documentation and risk mitigation procedures.",
  },
  {
    framework: "HIPAA Data Segregation",
    detail: "Strict isolation of Protected Health Information (PHI) with in-memory sanitization and zero unauthorized caching.",
  },
  {
    framework: "GDPR Data Subject Rights",
    detail: "Guaranteed rights to erasure and transparency, supported by append-only cryptographic audit histories.",
  },
  {
    framework: "Deterministic Safety Gates",
    detail: "Rigid prompt injection guards, toxic content blockers, and schema-constrained output validators.",
  },
];

export default function AIEthicsPage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "AI Ethics", path: "/ai-ethics" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Hero Section */}
        <div className="mt-8 mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            Ethical Governance Framework
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            Responsible <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">AI Principles</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            At Logic Intelligence Technologies, we believe artificial intelligence must be constrained by strict ethical guardrails. Innovation without deterministic safety and privacy discipline is an enterprise liability.
          </p>
        </div>

        {/* 4 Ethical Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {ETHICAL_PRINCIPLES.map((principle, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#151922] shadow-2xl relative overflow-hidden group hover:border-cyan-500/40 hover:bg-[#181d28] transition-all flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-4 -translate-y-4">
                <principle.icon className="w-36 h-36 text-cyan-400" />
              </div>

              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 mb-6 shadow-[0_0_15px_rgba(69,217,210,0.2)]">
                  <principle.icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-white uppercase font-heading tracking-wide mb-1">
                  {principle.title}
                </h3>
                <p className="text-xs font-mono text-cyan-400/90 uppercase tracking-wider mb-4">
                  {principle.subtitle}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed font-sans relative z-10">
                  {principle.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance & Regulatory Alignment Matrix */}
        <div className="mb-20 rounded-3xl border border-white/10 bg-[#10131A] p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
              Regulatory Readiness
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-heading">
              Governance & Regulatory Alignment
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed to anticipate and comply with international standards governing safe, transparent, and auditable algorithmic systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPLIANCE_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/5 bg-[#151922] flex items-start gap-4"
              >
                <FileCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading tracking-wide">
                    {item.framework}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1.5 font-sans">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#10131A] via-[#151922] to-[#10131A] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Verified Safeguards
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase font-heading">
              Have Questions Regarding Our Ethical Models?
            </h3>
            <p className="text-sm text-slate-300">
              Review our systems architecture or schedule a technical review with our engineering leadership to audit model behavior and safeguards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/security"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(69,217,210,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Security Architecture
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-cyan-500/40 font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              Contact Engineering
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
