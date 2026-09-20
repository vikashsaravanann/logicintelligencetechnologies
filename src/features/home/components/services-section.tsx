"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Shield,
  Mic,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/**
 * Homepage product band — three commercial products only:
 * AI Agent · AI Voice Agent · VoiceShield
 * AI Assistant (/ai) is the interactive experience under AI Agent — not a fourth product.
 * No invented accuracy, uptime, or latency claims.
 */
const PRODUCTS = [
  {
    id: "ai-agent",
    name: "AI Agent",
    badge: "Business Intelligence",
    href: "/products/ai-website-agents",
    experienceHref: "/ai",
    cta: "Explore AI Agent",
    icon: Brain,
    description:
      "An intelligent AI agent that understands your business, answers questions, works with approved knowledge, qualifies opportunities, and helps turn conversations into action.",
    capabilities: [
      "Business knowledge via RAG (approved content — not model training)",
      "Conversations, lead capture and qualification",
      "Tool-assisted workflows and human handoff where configured",
    ],
    suited: "SMB, professional services, SaaS, education, local services",
    cardClass:
      "bg-[#050B14] border-blue-900/50 shadow-[0_0_40px_rgba(5,15,40,0.8)]",
    gradient: "from-blue-900/30 via-[#050B14] to-[#050B14]",
    glow: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    iconWrap: "bg-blue-950/50 border-blue-800/50",
    iconColor: "text-cyan-400",
    badgeClass: "bg-blue-900/40 border-blue-800/50 text-cyan-400",
    textMuted: "text-blue-100/60",
    capTitle: "text-cyan-500",
    capIcon: "text-cyan-400",
    capText: "text-blue-50/80",
    suitedText: "text-blue-100/50",
    borderTop: "border-blue-900/50",
    btn: "text-blue-50 bg-blue-600/20 border-blue-500/30 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400",
  },
  {
    id: "ai-voice-agent",
    name: "AI Voice Agent",
    badge: "Phone Conversations",
    href: "/products/ai-voice-agents",
    cta: "Explore AI Voice Agent",
    icon: Mic,
    description:
      "Your AI-powered front desk for calls, enquiries and appointments — inbound handling, qualification and structured capture with human escalation.",
    capabilities: [
      "Inbound call handling and lead qualification",
      "Appointment and calendar workflows where integrated",
      "Transcription, structured extraction and human escalation",
    ],
    suited: "Contact centres, service businesses, high-enquiry teams",
    cardClass:
      "bg-[#0D0514] border-purple-900/50 shadow-[0_0_40px_rgba(20,5,35,0.8)]",
    gradient: "from-purple-900/40 via-[#0D0514] to-[#0D0514]",
    glow: "bg-fuchsia-600/10 group-hover:bg-fuchsia-600/20",
    iconWrap: "bg-purple-950/50 border-purple-800/50",
    iconColor: "text-fuchsia-400",
    badgeClass: "bg-purple-900/40 border-purple-800/50 text-fuchsia-400",
    textMuted: "text-purple-100/60",
    capTitle: "text-fuchsia-500",
    capIcon: "text-fuchsia-400",
    capText: "text-purple-50/80",
    suitedText: "text-purple-100/50",
    borderTop: "border-purple-900/50",
    btn: "text-purple-50 bg-purple-600/20 border-purple-500/30 group-hover:bg-fuchsia-500 group-hover:text-black group-hover:border-fuchsia-400",
  },
  {
    id: "voice-shield",
    name: "VoiceShield",
    badge: "AI Security",
    href: "/voice-shield",
    cta: "Explore VoiceShield",
    icon: Shield,
    description:
      "An AI security product by Logic Intelligence Technologies Pvt. Ltd. Analyze eligible voice interactions for configurable fraud-risk, security, compliance and quality signals.",
    capabilities: [
      "Real-time risk signals (detection path without LLM in the loop)",
      "Async analysis with structured evidence for enterprise workflows",
      "API-first integration and configurable retention",
    ],
    suited:
      "BPOs, contact centres, financial services, telecom, enterprise support",
    cardClass:
      "bg-[#05140D] border-emerald-900/50 shadow-[0_0_40px_rgba(5,40,20,0.8)]",
    gradient: "from-emerald-900/40 via-[#05140D] to-[#05140D]",
    glow: "bg-emerald-600/10 group-hover:bg-emerald-600/20",
    iconWrap: "bg-emerald-950/50 border-emerald-800/50",
    iconColor: "text-emerald-400",
    badgeClass: "bg-emerald-900/40 border-emerald-800/50 text-emerald-400",
    textMuted: "text-emerald-100/60",
    capTitle: "text-emerald-500",
    capIcon: "text-emerald-500",
    capText: "text-emerald-50/80",
    suitedText: "text-emerald-100/50",
    borderTop: "border-emerald-900/50",
    btn: "text-emerald-50 bg-emerald-600/20 border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400",
  },
] as const;

export default function ServicesSection() {
  return (
    <section
      id="products"
      className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-white/5"
      aria-labelledby="home-products-heading"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="h-px w-8 bg-white/20" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
              AI Products
            </span>
            <span className="h-px w-8 bg-white/20" />
          </motion.div>
          <motion.h2
            id="home-products-heading"
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6"
          >
            Three products.{" "}
            <span className="font-light opacity-90">One platform.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Logic Intelligence Technologies builds AI systems for real business
            operations — intelligent agents, voice conversations, and voice
            security intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative rounded-3xl p-8 lg:p-10 flex flex-col h-full border overflow-hidden hover:-translate-y-2 transition-transform duration-500 ${p.cardClass}`}
              >
                <div
                  className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${p.gradient} pointer-events-none`}
                />
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${p.glow} blur-[90px] rounded-full pointer-events-none transition-colors duration-700`}
                />

                <div className="relative z-10 flex-grow">
                  <div className="flex items-center justify-between mb-8">
                    <div
                      className={`w-14 h-14 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${p.iconWrap}`}
                    >
                      <Icon className={`w-7 h-7 ${p.iconColor}`} />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${p.badgeClass}`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                    {p.name}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed mb-8 font-medium ${p.textMuted}`}
                  >
                    {p.description}
                  </p>

                  <div className="mb-6">
                    <h4
                      className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${p.capTitle}`}
                    >
                      Core capabilities
                    </h4>
                    <div className="space-y-4">
                      {p.capabilities.map((c) => (
                        <div key={c} className="flex gap-3 items-start">
                          <Sparkles
                            className={`w-4 h-4 mt-0.5 shrink-0 ${p.capIcon}`}
                          />
                          <span className={`text-sm font-medium ${p.capText}`}>
                            {c}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4
                      className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${p.capTitle}`}
                    >
                      Best suited for
                    </h4>
                    <p className={`text-xs font-medium ${p.suitedText}`}>
                      {p.suited}
                    </p>
                  </div>
                </div>

                <div
                  className={`relative z-10 mt-10 pt-6 border-t space-y-3 ${p.borderTop}`}
                >
                  <Link
                    href={p.href}
                    className={`inline-flex items-center justify-center w-full gap-2 text-sm font-bold border rounded-xl py-4 transition-all duration-300 ${p.btn}`}
                  >
                    {p.cta}
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {"experienceHref" in p && p.experienceHref ? (
                    <Link
                      href={p.experienceHref}
                      className="block text-center text-xs font-mono tracking-wider uppercase text-zinc-500 hover:text-cyan-400 transition-colors"
                    >
                      Open AI Assistant experience →
                    </Link>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
