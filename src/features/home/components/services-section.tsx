"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  ShieldCheck,
  Mic,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/**
 * Homepage product band — flagship products of Logic Intelligence Technologies:
 * 1. LIT Healthcare (Hospital Management System)
 * 2. Logic Voice (AI Voice Assistant)
 * 3. OmniPublisher AI (Content Distribution & Automation)
 */
const PRODUCTS = [
  {
    id: "healthcare",
    name: "LIT Healthcare",
    badge: "Hospital Operations",
    href: "/healthcare",
    liveHref: "https://healthcare.logicintelligencetechnologies.in/",
    isExternal: true,
    cta: "Explore LIT Healthcare",
    liveCta: "Launch Platform",
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
    description:
      "Comprehensive hospital and clinic management platform engineered to unify clinical workflows, administrative operations, and facility management into a single organized workspace.",
    capabilities: [
      "Multi-organization and multi-facility architecture",
      "Role-based workspaces for doctors, nurses, and billing teams",
      "Integrated patient registration and clinical health records",
      "Healthcare intelligence with human oversight",
    ],
    suited: "Clinics, multispecialty clinics, hospitals, and healthcare groups",
    accent: "text-[#1FA9A2]",
    accentBg: "bg-[#1FA9A2]/10 border-[#1FA9A2]/25",
  },
  {
    id: "logic-voice",
    name: "Logic Voice",
    badge: "AI Voice Intelligence",
    href: "/products/logic-voice",
    liveHref: "https://logicvoice.logicintelligencetechnologies.in/",
    isExternal: true,
    cta: "Explore Logic Voice",
    liveCta: "Launch Live Voice",
    icon: Mic,
    description:
      "Voice-first personal AI assistant developed by Logic Intelligence Technologies, designed to let users interact naturally through speech, understanding, reasoning, planning, and executing approved tools under explicit authorization.",
    capabilities: [
      "Voice-first speech recognition and natural speech understanding",
      "Contextual reasoning, multi-step planning, and intelligent automation",
      "Approved tool execution with confirmations for sensitive actions",
      "Direction toward a personal AI operating system interface",
    ],
    suited: "Personal productivity, voice-driven workflows, intelligent automation",
    accent: "text-[#45D9D2]",
    accentBg: "bg-[#45D9D2]/10 border-[#45D9D2]/25",
  },
  {
    id: "omni-publisher",
    name: "OmniPublisher AI",
    badge: "Content Distribution",
    href: "/omni",
    liveHref: "/omni",
    isExternal: false,
    cta: "Explore OmniPublisher",
    liveCta: "Launch Studio",
    icon: Sparkles,
    description:
      "Autonomous multi-platform content distribution and social orchestration engine. Drafts, schedules, optimizes, and broadcasts enterprise content across social channels and technical publications with centralized governance.",
    capabilities: [
      "AI copy adaptation for LinkedIn, Twitter/X, and tech publications",
      "Automated UTM tracking & multi-touch lead attribution",
      "Dynamic trend analysis & brand alignment checks",
      "Multi-brand editorial workspace with human approval gates",
    ],
    suited: "Corporate marketing teams, executive comms, and fast-growing enterprises",
    accent: "text-[#60A5FA]",
    accentBg: "bg-[#1565C0]/15 border-[#1565C0]/35",
  },
] as const;

export default function ServicesSection() {
  return (
    <section
      id="products"
      className="relative py-20 md:py-28 overflow-hidden border-t border-white/[0.08]"
      aria-labelledby="home-products-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-14 md:mb-16 max-w-3xl">
          <p className="lit-eyebrow mb-4">Enterprise Product Ecosystem</p>
          <h2
            id="home-products-heading"
            className="font-display text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] font-bold text-white tracking-tight leading-[1.1] mb-5 uppercase"
          >
            Flagship Platforms.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2]">
              One Engineering Vision.
            </span>
          </h2>
          <p className="text-[#B5BECC] text-base sm:text-lg leading-relaxed">
            Logic Intelligence Technologies develops intelligent AI products, connected digital platforms, and automation solutions.
            Our flagship products operate independently with dedicated architectures while sharing core intelligence capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#45D9D2]/30 hover:bg-[#151922] hover:-translate-y-1"
              >
                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${p.accentBg}`}>
                      <Icon className={`h-5 w-5 ${p.accent}`} aria-hidden />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300 font-mono">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white mb-3 tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 text-[#B5BECC]">
                    {p.description}
                  </p>

                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-3 ${p.accent}`}>
                    Core capabilities
                  </h4>
                  <ul className="space-y-2.5 mb-6">
                    {p.capabilities.map((c) => (
                      <li key={c} className="flex gap-2.5 items-start">
                        <Sparkles className={`w-3.5 h-3.5 mt-1 shrink-0 ${p.accent}`} aria-hidden />
                        <span className="text-xs sm:text-[13px] text-zinc-200 leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-1.5 ${p.accent}`}>
                    Best suited for
                  </h4>
                  <p className="text-xs text-[#B5BECC]/80 leading-relaxed">{p.suited}</p>
                </div>

                <div className="mt-8 pt-5 border-t border-white/10 space-y-2.5">
                  {p.isExternal ? (
                    <a
                      href={p.liveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lit-btn lit-btn-md lit-btn-primary w-full justify-center"
                    >
                      <span>{p.liveCta}</span>
                      <ExternalLink className="w-4 h-4 ml-1.5" aria-hidden />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={p.liveHref}
                      className="lit-btn lit-btn-md lit-btn-primary w-full justify-center"
                    >
                      <span>{p.liveCta}</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden />
                    </Link>
                  )}
                  <Link
                    href={p.href}
                    className="flex min-h-[40px] items-center justify-center text-xs font-mono tracking-wider uppercase text-[#B5BECC] hover:text-[#45D9D2] transition-colors"
                  >
                    {p.cta} Specifications →
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
