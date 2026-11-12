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
        {/* Editorial prototype and consultation panel */}
        <div className="mb-14 md:mb-18 grid overflow-hidden rounded-[1.65rem] border border-[#5478ae]/50 bg-[#f9f7f0] shadow-[0_16px_50px_rgba(43,67,105,.07)] md:grid-cols-[1.1fr_.9fr]">
          <div className="relative flex min-h-[250px] flex-col justify-center overflow-hidden border-b border-[#5478ae]/50 bg-[#d4e1f8] p-7 sm:p-10 md:border-b-0 md:border-r md:p-12">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#315f9c]/30 bg-white/45 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#315f9c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#315f9c]" />
              Built to be experienced
            </span>
            <h2
              id="home-products-heading"
              className="relative z-10 max-w-[620px] font-display text-[clamp(2rem,1.5rem+2.8vw,3.5rem)] font-semibold leading-[1.02] tracking-[-.045em] text-[#173f78]"
            >
              At last, review your working prototype before financial commitment.
            </h2>
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full border border-[#315f9c]/15 sm:h-64 sm:w-64" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-4 h-36 w-36 rounded-full border border-[#315f9c]/15 sm:h-48 sm:w-48" />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12">
            <p className="max-w-md font-serif text-lg leading-relaxed text-[#53534c] sm:text-xl">
              Before any financial commitment, book a consultation.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/book-consultation"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-normal rounded-full bg-[#315f9c] px-4 py-3 text-center text-[11px] font-semibold leading-snug tracking-wide text-white transition hover:bg-[#244a7d] sm:w-auto sm:px-5 sm:text-xs"
              >
                Book a technical consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/free-demo"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-normal rounded-full border border-[#315f9c]/45 bg-white/70 px-4 py-3 text-center text-[11px] font-semibold leading-snug tracking-wide text-[#244a7d] transition hover:bg-white sm:w-auto sm:px-5 sm:text-xs"
              >
                Request a free prototype demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
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
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.35rem] border border-[#25364f]/15 p-6 shadow-[0_8px_24px_rgba(26,37,52,.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(26,37,52,.10)] sm:p-7 ${i === 0 ? "bg-[#dce7f8]" : i === 1 ? "bg-[#f7dce0]" : "bg-[#f2efe6]"}`}
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
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#9bd8f5] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#12324a] shadow-sm transition-all hover:bg-[#83caee] hover:shadow-md"
                    >
                      <span>{p.liveCta}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-2" aria-hidden="true" />
                    </a>
                  ) : (
                    <Link
                      href={p.liveHref}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#9bd8f5] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#12324a] shadow-sm transition-all hover:bg-[#83caee] hover:shadow-md"
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
