import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { 
  Scale, 
  Fingerprint, 
  EyeOff, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  FileCheck,
  Cpu,
  Lock,
  Layers,
  FileCode
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Responsible AI Principles & Safety Gates | Logic Intelligence Technologies",
  description: "Strict ethical frameworks, algorithmic fairness, identity preservation, zero-retraining policies, and deterministic safety gates governing enterprise AI at Logic Intelligence Technologies.",
};

const ETHICAL_COMMITMENTS = [
  {
    label: "Data Retraining Policy",
    value: "Zero Client Data Training",
    detail: "Customer audio, text, and records are never ingested into foundational models",
  },
  {
    label: "Execution Sandbox",
    value: "Ephemeral Volatile RAM",
    detail: "Micro-frame processing with immediate memory zeroization post-inference",
  },
  {
    label: "Output Guarantees",
    value: "Deterministic Schema Gates",
    detail: "Zod runtime contracts and strict hallucination mitigation filters",
  },
  {
    label: "Governance Control",
    value: "Human-in-the-Loop",
    detail: "Authoritative decision boundaries remain under certified human oversight",
  },
];

const ETHICAL_PRINCIPLES = [
  {
    title: "Data Ephemerality & Privacy by Design",
    subtitle: "Zero Model Retraining on Customer Data",
    icon: EyeOff,
    desc: "Our primary architecture relies on volatile memory processing for real-time audio and textual streams. We never retain, pool, or use your organization's confidential telemetry, clinical records, or customer conversations to train foundational models.",
    points: [
      "No customer data ingestion into shared foundation models",
      "Immediate memory zeroization after conversational inference",
      "Strict data segregation with dedicated cryptographic keys",
    ],
  },
  {
    title: "Algorithmic Rigor & Fair Representation",
    subtitle: "Demographic and Accent Equity",
    icon: Scale,
    desc: "Our conversational evaluation benchmarks and acoustic models are tested across diverse regional accents, vernacular speech patterns, and linguistic profiles to minimize bias and ensure consistent accuracy across all demographics.",
    points: [
      "Rigorous acoustic testing across diverse Indian and global accents",
      "Continuous demographic parity evaluations on ASR & NLU",
      "Bias mitigation filters embedded in intent classification pipelines",
    ],
  },
  {
    title: "Biometric & Identity Protection",
    subtitle: "Anti-Deceptive Media & Consent Enforcement",
    icon: Fingerprint,
    desc: "We build AI systems to assist and augment humans, not mimic them without explicit authorization. We categorically reject contracts or applications involving non-consensual voice replication, deepfake spoofing, or deceptive synthetic media.",
    points: [
      "Mandatory cryptographic provenance for all synthetic voice profiles",
      "Strict rejection of unauthenticated voice cloning requests",
      "Clear disclosure watermarks on automated interactive voice sessions",
    ],
  },
  {
    title: "Human-in-the-Loop Safeguards",
    subtitle: "Deterministic Bounds for Critical Decisions",
    icon: Users,
    desc: "In clinical environments and high-stakes operational workflows, our AI produces structured decision support, contextual summaries, and risk indicators. Final authoritative actions remain under certified human governance and control.",
    points: [
      "Deterministic fail-safes on ambiguous clinical or financial intent",
      "Seamless escalation paths to certified human specialists",
      "Immutable audit trails of model suggestions versus human decisions",
    ],
  },
];

const SAFETY_GATES = [
  {
    tier: "Gate 01",
    name: "Adversarial & Prompt Injection Defense",
    icon: ShieldCheck,
    desc: "Multi-layered semantic classifiers inspect inbound user prompts to neutralize jailbreak attempts, system prompt extraction, and instruction overrides before reaching reasoning engines.",
  },
  {
    tier: "Gate 02",
    name: "PII Sanitization & Ephemeral Masking",
    icon: Lock,
    desc: "Automated real-time tokenizers detect and redact personal identifiable information (PII), national IDs, and payment credentials prior to LLM inference.",
  },
  {
    tier: "Gate 03",
    name: "Grounding & Factuality Enforcement",
    icon: Cpu,
    desc: "Retrieval-Augmented Generation (RAG) pipelines enforce strict source attribution, rejecting unsupported extrapolations and flagging potential hallucinations.",
  },
  {
    tier: "Gate 04",
    name: "Schema-Constrained Output Verification",
    icon: FileCode,
    desc: "All generative responses must pass rigid Zod runtime type validations and policy filters before any data payload is delivered to client interfaces.",
  },
];

const COMPLIANCE_ITEMS = [
  {
    framework: "EU AI Act Alignment",
    tag: "Risk Classification",
    detail: "Clear classification of operational risk tiers with transparent algorithmic documentation, explainability logging, and mandatory risk mitigation dossiers.",
  },
  {
    framework: "HIPAA Data Segregation",
    tag: "Healthcare Compliance",
    detail: "Strict physical and logical isolation of Protected Health Information (PHI) with in-memory sanitization and zero unauthorized caching across hospital nodes.",
  },
  {
    framework: "GDPR Data Subject Rights",
    tag: "Privacy by Design",
    detail: "Guaranteed rights to automated erasure and telemetry transparency, backed by cryptographically signed immutable audit logs and zero-training policies.",
  },
  {
    framework: "ISO/IEC 42001 Preparedness",
    tag: "AI Management System",
    detail: "Adherence to international standards for Artificial Intelligence Management Systems (AIMS), ensuring continuous risk assessments and ethical governance.",
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

      <div className="bg-[var(--lit-cloud,#F7F9FC)] min-h-screen text-[var(--lit-ink,#121826)]">
        <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unified Back Navigation */}
          <BackButton fallbackHref="/" label="Home" inline className="mb-6" />

          {/* Hero Section */}
          <div className="mt-4 mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wide uppercase mb-4">
              <Sparkles className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Ethical Governance Framework
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading leading-tight">
              Responsible <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">AI Principles</span> & Safeguards
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              At Logic Intelligence Technologies, we believe artificial intelligence must be constrained by strict ethical guardrails. Innovation without deterministic safety, bias testing, and privacy discipline is an enterprise liability.
            </p>
          </div>

          {/* Quick Commitments Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {ETHICAL_COMMITMENTS.map((commitment, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all"
              >
                <div className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1">
                  {commitment.label}
                </div>
                <div className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-1">
                  {commitment.value}
                </div>
                <div className="text-xs text-[var(--lit-text-muted,#52677C)] leading-normal">
                  {commitment.detail}
                </div>
              </div>
            ))}
          </div>

          {/* 4 Ethical Principles Grid */}
          <div className="mb-20">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] text-xs font-semibold uppercase tracking-wider mb-2">
                Core Principles
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Four Pillars of Algorithmic Integrity
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
                Core ethical standards integrated directly into our codebase, inference endpoints, and deployment pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ETHICAL_PRINCIPLES.map((principle, idx) => (
                <div
                  key={idx}
                  className="p-8 sm:p-10 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] mb-6">
                      <principle.icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] font-heading tracking-tight mb-1">
                      {principle.title}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-[var(--lit-teal,#1FA9A2)] uppercase tracking-wider mb-4">
                      {principle.subtitle}
                    </p>
                    <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6">
                      {principle.desc}
                    </p>

                    <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]/60">
                      <ul className="space-y-2">
                        {principle.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5 text-xs text-[var(--lit-text-muted,#52677C)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deterministic Safety Gates */}
          <div className="mb-20 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-12 shadow-sm">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-soft-lilac,#EDE7F6)] text-[#6D28D9] text-xs font-semibold uppercase tracking-wider mb-2">
                Deterministic Execution
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Four-Stage Operational Safety Gates
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
                Every inference cycle passes through deterministic validation layers to prevent adversarial manipulation and hallucinated outputs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SAFETY_GATES.map((gate, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[var(--lit-teal,#1FA9A2)] px-2.5 py-1 rounded-md bg-[var(--lit-teal,#1FA9A2)]/10">
                        {gate.tier}
                      </span>
                      <gate.icon className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" />
                    </div>
                    <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-heading mb-2">
                      {gate.name}
                    </h4>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                      {gate.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Regulatory Alignment Matrix */}
          <div className="mb-20 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-12 shadow-sm">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-gold,#FFF4D9)] text-[#B45309] text-xs font-semibold uppercase tracking-wider mb-2">
                Regulatory Preparedness
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Governance & Regulatory Framework Alignment
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
                Engineered to satisfy current and emerging international legislation governing safe, auditable, and transparent algorithmic systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COMPLIANCE_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)]/70 bg-[var(--lit-cloud,#F7F9FC)] flex items-start gap-4"
                >
                  <FileCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-1" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                        {item.framework}
                      </h4>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)]">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Review Banner */}
          <div className="rounded-3xl border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-light-blue,#E7F3FF)]/40 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[var(--lit-teal,#1FA9A2)] text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Verified Safeguards & Auditing
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-heading">
                Have Specific Governance Questions or Requirements?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                Review our comprehensive security architecture or schedule a direct technical audit with our engineering leadership to inspect model safeguards and benchmark telemetry.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
              <Link
                href="/security"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-teal,#1FA9A2)] font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Security Architecture
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                Contact Engineering
                <ArrowRight className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              </Link>
            </div>
          </div>

          {/* Canonical CTA Section */}
          <CTASection
            title="Deploy Responsible AI with Deterministic Safety Controls"
            subtitle="Engage our AI architects to audit model safety gates, review bias mitigation benchmarks, or configure custom governance policies for your enterprise."
            primaryCta={{
              label: "Schedule Governance Review",
              href: "/contact",
            }}
            secondaryCta={{
              label: "Explore Security Controls",
              href: "/security",
            }}
          />

        </div>
      </div>
    </PageShell>
  );
}
