"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  ShieldCheck,
  Mic,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const PRODUCTS = [
  {
    id: "healthcare",
    name: "LIT Healthcare",
    badge: "Hospital Operating System",
    statusText: "Live Production Platform",
    href: "/healthcare",
    liveHref: "https://healthcare.logicintelligencetechnologies.in/",
    isExternal: true,
    cta: "Architecture Specs",
    liveCta: "Launch Hospital OS",
    icon: Activity,
    tagline: "Clinical Operations & Multi-Facility Workflow Infrastructure",
    description:
      "Enterprise hospital management platform engineered to unify clinical workflows, in-patient triage, facility management, and diagnostic records into a secure, deterministic operating system.",
    capabilities: [
      "Multi-organization and multi-facility hospital hierarchy",
      "Role-partitioned doctor, nurse, and admin workspaces",
      "Integrated patient EHR with automated clinical telemetry",
      "Zero-data-leakage architecture aligned with healthcare standards",
    ],
    technicalHighlights: "Next.js 15 · PostgreSQL RLS · HIPAA Aligned · Sub-50ms Sync",
    accent: "text-[var(--lit-teal)]",
    accentBg: "bg-[#ECFDF5] border-[#A7F3D0]",
    badgeStyle: "bg-[var(--lit-light-blue)] text-[var(--lit-blue)] border-[#BFDBFE]",
  },
  {
    id: "logic-voice",
    name: "Logic Voice",
    badge: "Voice Intelligence Engine",
    statusText: "Low-Latency Audio Engine",
    href: "/products/logic-voice",
    liveHref: "https://logicvoice.logicintelligencetechnologies.in/",
    isExternal: true,
    cta: "Voice Engine Specs",
    liveCta: "Launch Live Voice",
    icon: Mic,
    tagline: "Natural Speech Reasoning & Sub-90ms Autonomous Execution",
    description:
      "Voice-first personal and enterprise AI assistant engineered for high-concurrency natural speech understanding, contextual reasoning, and gated tool execution with strict authorization.",
    capabilities: [
      "WebRTC 48kHz audio streaming with sub-90ms round-trip latency",
      "Deterministic tool routing (calendars, CRM sync, enterprise databases)",
      "Strict authorization checkpoints on all sensitive execution workflows",
      "Speech-to-intent pipeline eliminating LLM hallucination risk",
    ],
    technicalHighlights: "WebRTC Audio · Whisper Turbo · Fast Claude Reasoning · Neural TTS",
    accent: "text-[var(--lit-blue)]",
    accentBg: "bg-[var(--lit-light-blue)] border-[#BFDBFE]",
    badgeStyle: "bg-[var(--lit-light-purple)] text-[#6B21A8] border-[#DDD6FE]",
  },
  {
    id: "voice-shield",
    name: "Voice Shield",
    badge: "AI Deepfake Defense",
    statusText: "Enterprise Ready",
    href: "/voice-shield",
    liveHref: "/voice-shield",
    isExternal: false,
    cta: "Architecture Specs",
    liveCta: "Explore Voice Shield",
    icon: ShieldCheck,
    tagline: "Sub-15ms Acoustic Threat Firewall & Telephony Verification",
    description:
      "Enterprise audio security firewall engineered to protect contact centers, SIP trunking, and executive communications from real-time synthetic voice clones, AI impersonation, and deepfake wire fraud.",
    capabilities: [
      "Sub-15ms zero-LLM fast path acoustic frequency & spectral phase verification",
      "Real-time synthetic voice cloning & deepfake anomaly detection",
      "Dynamic acoustic challenge-response liveness validation",
      "DPDP Act 2023 & HIPAA compliant zero-retention raw audio processing",
    ],
    technicalHighlights: "<15ms Latency · 99.4% Accuracy · Zero Disk Storage",
    accent: "text-[#7C3AED]",
    accentBg: "bg-[var(--lit-light-purple)] border-[#DDD6FE]",
    badgeStyle: "bg-[#ECFDF5] text-[#0D9488] border-[#A7F3D0]",
  },
] as const;

export default function ServicesSection() {
  return (
    <section
      id="products"
      className="relative py-24 md:py-32 overflow-hidden bg-white border-b border-[#E2E8F0]"
      aria-labelledby="home-products-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-16 md:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-blue)] border border-[#BFDBFE] text-[var(--lit-blue)] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-blue)] animate-pulse" />
            Flagship Product Ecosystem
          </div>

          <h2
            id="home-products-heading"
            className="font-display text-[clamp(2rem,1.4rem+3vw,3.5rem)] font-extrabold text-[var(--lit-ink)] tracking-tight leading-[1.08] mb-4"
          >
            Mission-Critical Platforms.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[#7C3AED]">
              Engineered For Scale.
            </span>
          </h2>

          <p className="font-serif italic text-[var(--lit-blue)] text-lg mb-3">
            &ldquo;Decoupled architectures. Rigorous security models. Deterministic pipelines.&rdquo;
          </p>

          <p className="text-[var(--lit-text-muted)] text-base sm:text-lg leading-relaxed">
            Logic Intelligence Technologies builds production-grade software platforms with decoupled architectures, rigorous security models, and deterministic execution pipelines.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#CBD5E1] hover:-translate-y-1.5"
              >
                <div className="flex-grow">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${p.accentBg}`}>
                      <Icon className={`h-6 w-6 ${p.accent}`} aria-hidden="true" />
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] font-mono ${p.badgeStyle}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display text-2xl font-bold text-[var(--lit-ink)] mb-2 tracking-tight group-hover:text-[var(--lit-blue)] transition-colors">
                    {p.name}
                  </h3>
                  <p className={`text-xs font-mono font-semibold mb-4 leading-snug ${p.accent}`}>
                    {p.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-6 text-[var(--lit-text-muted)]">
                    {p.description}
                  </p>

                  {/* Technical Highlight Pill */}
                  <div className="mb-6 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-mono text-[var(--lit-ink)]">
                    <span className="text-[var(--lit-blue)] font-bold uppercase block text-[9px] tracking-wider mb-1">
                      Architecture Stack:
                    </span>
                    {p.technicalHighlights}
                  </div>

                  {/* Capabilities List */}
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3 text-[var(--lit-ink)]">
                    Core Capabilities
                  </h4>
                  <ul className="space-y-2.5 mb-6">
                    {p.capabilities.map((c) => (
                      <li key={c} className="flex gap-2.5 items-start">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${p.accent}`} aria-hidden="true" />
                        <span className="text-xs sm:text-[13px] text-[var(--lit-text-muted)] leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Footer */}
                <div className="mt-8 pt-5 border-t border-[#E2E8F0] space-y-3">
                  {p.isExternal ? (
                    <a
                      href={p.liveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md"
                    >
                      <span>{p.liveCta}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-2" aria-hidden="true" />
                    </a>
                  ) : (
                    <Link
                      href={p.liveHref}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md"
                    >
                      <span>{p.liveCta}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-2" aria-hidden="true" />
                    </Link>
                  )}

                  <Link
                    href={p.href}
                    className="flex min-h-[38px] items-center justify-center text-xs font-mono tracking-wider uppercase text-[var(--lit-text-muted)] hover:text-[var(--lit-blue)] font-semibold transition-colors"
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
