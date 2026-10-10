"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  Mic,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/**
 * Homepage product band — two launched flagship products of Logic Intelligence Technologies:
 * 1. LIT Healthcare (Hospital Management System)
 * 2. Logic Voice (AI Voice Assistant)
 */
const PRODUCTS = [
  {
    id: "healthcare",
    name: "LIT Healthcare",
    badge: "Hospital Management",
    href: "/healthcare",
    liveHref: "https://healthcare.logicintelligencetechnologies.in/",
    cta: "Explore LIT Healthcare",
    liveCta: "Healthcare Platform",
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
    description:
      "LIT Healthcare is a comprehensive hospital and clinic management platform designed to connect clinical workflows, administrative operations, and facility management into a single organized workspace.",
    capabilities: [
      "Multi-organization and multi-facility architecture",
      "Role-based workspaces for doctors, nurses, and billing teams",
      "Integrated patient registration and clinical records",
      "Healthcare intelligence with human oversight",
    ],
    suited: "Clinics, multispecialty clinics, hospitals, and healthcare groups",
    accent: "text-[#1FA9A2]",
    accentBg: "bg-[#1FA9A2]/10 border-[#1FA9A2]/25",
  },
  {
    id: "logic-voice",
    name: "Logic Voice",
    badge: "AI Voice Assistant",
    href: "/products/logic-voice",
    liveHref: "https://logicvoice.logicintelligencetechnologies.in/",
    cta: "Explore Logic Voice",
    liveCta: "Launch Live Product",
    icon: Mic,
    description:
      "A voice-first personal AI assistant developed by Logic Intelligence Technologies, designed to let users interact naturally through speech, understanding, reasoning, planning, and executing approved tools under explicit authorization.",
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
] as const;
export default function ServicesSection() {
  return (
    <section
      id="products"
      className="relative py-20 md:py-28 overflow-hidden border-t border-white/[0.06]"
      aria-labelledby="home-products-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-14 md:mb-16 max-w-3xl">
          <p className="lit-eyebrow mb-5">Flagship Products</p>
          <h2
            id="home-products-heading"
            className="font-display text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] font-bold text-white tracking-tight leading-[1.1] mb-5 uppercase"
          >
            Two Launched Products.{" "}
            <span className="text-primary">One Company.</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
            Logic Intelligence Technologies develops intelligent AI products, connected digital platforms, and automation solutions.
            Our two launched products operate independently with dedicated architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="lit-card lit-card-interactive group relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-9"
              >
                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-3 mb-7">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${p.accentBg}`}>
                      <Icon className={`h-6 w-6 ${p.accent}`} aria-hidden />
                    </div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-bold text-white mb-4 tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-sm sm:text-[15px] leading-relaxed mb-8 text-zinc-300">
                    {p.description}
                  </p>

                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-4 ${p.accent}`}>
                    Core capabilities
                  </h4>
                  <ul className="space-y-3 mb-7">
                    {p.capabilities.map((c) => (
                      <li key={c} className="flex gap-3 items-start">
                        <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${p.accent}`} aria-hidden />
                        <span className="text-sm text-zinc-200">{c}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className={`text-[11px] font-semibold uppercase tracking-[0.16em] mb-2 ${p.accent}`}>
                    Best suited for
                  </h4>
                  <p className="text-sm text-zinc-400">{p.suited}</p>
                </div>

                <div className="mt-9 pt-6 border-t border-white/10 space-y-2">
                  <a
                    href={p.liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lit-btn lit-btn-lg lit-btn-primary w-full"
                  >
                    <span>{p.liveCta}</span>
                    <ExternalLink className="w-4 h-4" aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <Link
                    href={p.href}
                    className="flex min-h-[44px] items-center justify-center text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-primary transition-colors"
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
