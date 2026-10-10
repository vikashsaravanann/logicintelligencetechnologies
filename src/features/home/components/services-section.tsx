"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  ShieldCheck,
  Mic,
  Sparkles,
  ArrowRight,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const PRODUCTS = [
  {
    id: "healthcare",
    name: "LIT Healthcare",
    badge: "Smart Hospital Operating System",
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
    accent: "text-[#1FA9A2]",
    accentBg: "bg-[#1FA9A2]/10 border-[#1FA9A2]/30",
    gradientBorder: "hover:border-[#1FA9A2]/50",
  },
  {
    id: "logic-voice",
    name: "Logic Voice",
    badge: "Autonomous Voice Intelligence",
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
    accent: "text-[#45D9D2]",
    accentBg: "bg-[#45D9D2]/10 border-[#45D9D2]/30",
    gradientBorder: "hover:border-[#45D9D2]/50",
  },
  {
    id: "omni-publisher",
    name: "OmniPublisher AI",
    badge: "Autonomous Content Distribution",
    statusText: "Multi-Agent Syndication",
    href: "/products",
    liveHref: "/products",
    isExternal: false,
    cta: "Distribution Specs",
    liveCta: "Explore OmniPublisher",
    icon: Sparkles,
    tagline: "Cross-Platform Syndication & Automated Editorial Governance",
    description:
      "Autonomous multi-platform content distribution and social orchestration engine. Drafts, verifies brand safety, schedules, and syndicates high-authority technical content across enterprise channels.",
    capabilities: [
      "Multi-agent adaptation for LinkedIn, X/Twitter, and developer publications",
      "Automated UTM parameter generation & multi-touch lead attribution",
      "Deterministic brand safety audit gates before any broadcast",
      "Centralized editorial dashboard with human-in-the-loop review queues",
    ],
    technicalHighlights: "Multi-Agent Queue · Safe Attribution · Automated Social APIs",
    accent: "text-[#60A5FA]",
    accentBg: "bg-[#1565C0]/15 border-[#1565C0]/40",
    gradientBorder: "hover:border-[#60A5FA]/50",
  },
] as const;

export default function ServicesSection() {
  return (
    <section
      id="products"
      className="relative py-24 md:py-32 overflow-hidden bg-[#07090D] border-t border-white/[0.08]"
      aria-labelledby="home-products-heading"
    >
      {/* Background Subtle Mesh */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(69,217,210,0.06),transparent_80%)]"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131A] border border-[#45D9D2]/30 text-[#45D9D2] text-[11px] font-mono uppercase tracking-[0.18em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2] animate-pulse" />
            Flagship Product Ecosystem
          </div>
          
          <h2
            id="home-products-heading"
            className="font-display text-[clamp(2rem,1.4rem+3vw,3.5rem)] font-extrabold text-white tracking-tight leading-[1.08] mb-5"
          >
            Mission-Critical Platforms.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
              Engineered For Scale.
            </span>
          </h2>
          
          <p className="text-[#B5BECC] text-base sm:text-lg leading-relaxed">
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
                className={`group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300 ${p.gradientBorder} hover:bg-[#131722] hover:-translate-y-1.5`}
              >
                <div className="flex-grow">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${p.accentBg}`}>
                      <Icon className={`h-6 w-6 ${p.accent}`} aria-hidden />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300 font-mono">
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display text-2xl font-bold text-white mb-2 tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-xs font-mono text-[#45D9D2] mb-4 leading-snug">
                    {p.tagline}
                  </p>
                  
                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-6 text-[#B5BECC]">
                    {p.description}
                  </p>

                  {/* Technical Highlight Pill */}
                  <div className="mb-6 p-2.5 rounded-xl bg-[#07090D] border border-white/5 text-[11px] font-mono text-zinc-300">
                    <span className="text-[#45D9D2] font-semibold uppercase block text-[9px] tracking-wider mb-1">
                      Architecture Stack:
                    </span>
                    {p.technicalHighlights}
                  </div>

                  {/* Capabilities List */}
                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-3 ${p.accent}`}>
                    Core Capabilities
                  </h4>
                  <ul className="space-y-2.5 mb-6">
                    {p.capabilities.map((c) => (
                      <li key={c} className="flex gap-2.5 items-start">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${p.accent}`} aria-hidden />
                        <span className="text-xs sm:text-[13px] text-zinc-300 leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Footer */}
                <div className="mt-8 pt-5 border-t border-white/10 space-y-3">
                  {p.isExternal ? (
                    <a
                      href={p.liveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#07090D] shadow-sm transition-all hover:brightness-110"
                    >
                      <span>{p.liveCta}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-2" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={p.liveHref}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#07090D] shadow-sm transition-all hover:brightness-110"
                    >
                      <span>{p.liveCta}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-2" aria-hidden />
                    </Link>
                  )}
                  
                  <Link
                    href={p.href}
                    className="flex min-h-[38px] items-center justify-center text-xs font-mono tracking-wider uppercase text-[#B5BECC] hover:text-[#45D9D2] transition-colors"
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
