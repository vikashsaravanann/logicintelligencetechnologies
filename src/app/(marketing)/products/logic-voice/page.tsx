import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { logicVoiceProductNode } from "@/lib/seo/schema";
import BackToHome from "@/components/ui/back-to-home";
import {
  Mic,
  Brain,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "Logic Voice | Voice-First Personal AI Assistant | Logic Intelligence Technologies",
  description:
    "Logic Voice is a product of Logic Intelligence Technologies A voice-first personal AI assistant engineered for speech recognition, reasoning, planning, and approved tool execution.",
  alternates: { canonical: `${SITE_URL}/products/logic-voice` },
  openGraph: {
    title: "Logic Voice | Voice-First Personal AI Assistant",
    description:
      "A voice-first personal AI assistant by Logic Intelligence Technologies. Natural speech interaction, reasoning, planning, and approved tool execution.",
    url: `${SITE_URL}/products/logic-voice`,
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: "Logic Voice" }],
  },
};

export default function LogicVoiceProductPage() {
  return (
    <div className="relative min-h-screen bg-[#0A1530] text-slate-100 overflow-x-hidden font-sans pt-28 pb-20">
      <BackToHome href="/products" label="Back to Products" />

      {/* Decorative Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/20 via-cyan-500/15 to-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [logicVoiceProductNode()],
          }),
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-32">
        {/* Hero Section */}
        <section className="text-center pt-8 sm:pt-14 space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-950/60 border border-cyan-500/30 backdrop-blur-md mx-auto">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              A Logic Intelligence Technologies Product · Personal AI
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Logic Voice
          </h1>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Voice-first personal AI assistant &amp; intelligent automation
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Logic Voice is designed to let users interact naturally through speech. Built
            around natural-language understanding, contextual reasoning, multi-step planning,
            and approved tool execution with controlled authorization for consequential actions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="https://logicvoice.logicintelligencetechnologies.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-[#0D1B3E] hover:bg-[#6DE6E0] hover:opacity-95  font-bold text-sm tracking-wider uppercase transition-all "
            >
              <Zap className="w-4 h-4" />
              <span>Launch Logic Voice</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="https://github.com/vikashsaravanann/logic-voice"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono text-sm uppercase tracking-wider transition-colors"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>View GitHub Repository</span>
            </a>
          </div>
        </section>

        {/* Core Pillars */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          aria-label="Logic Voice Highlights"
        >
          {[
            {
              value: "Voice-First",
              label: "Speech understanding & vocal response",
              color: "text-cyan-400",
            },
            {
              value: "Reasoning",
              label: "Multi-step planning & context memory",
              color: "text-indigo-400",
            },
            {
              value: "Controlled",
              label: "Confirmations for sensitive tool actions",
              color: "text-primary",
            },
            {
              value: "Long-Term",
              label: "Personal AI Operating System direction",
              color: "text-accent",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 text-center backdrop-blur-md"
            >
              <div
                className={`text-2xl md:text-3xl font-bold font-mono mb-2 ${item.color}`}
              >
                {item.value}
              </div>
              <div className="text-xs font-bold text-slate-400 tracking-[0.12em] uppercase">
                {item.label}
              </div>
            </div>
          ))}
        </section>

        {/* Product Architecture & Capabilities */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
              Architecture &amp; Product Direction
            </h2>
            <p className="text-sm font-mono tracking-[0.15em] text-cyan-400 uppercase">
              How Logic Voice operates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: "Listening & Speech Recognition",
                desc: "Low-latency acoustic capture converting natural spoken commands into contextual input tokens without requiring manual typing.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10 border-cyan-500/20",
              },
              {
                icon: Brain,
                title: "Natural-Language Reasoning & Planning",
                desc: "Understands intent, breaks down compound requests into executable stages, and maintains conversational context throughout the session.",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                icon: ShieldCheck,
                title: "Controlled Authorization & Tool Boundaries",
                desc: "Consequential and sensitive actions strictly require explicit user confirmation before any tool or integration performs state modification.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                icon: Sparkles,
                title: "Research & Knowledge Synthesis",
                desc: "Researches targeted information, synthesizes verified answers, and delivers concise summaries through clear vocal responses.",
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: Cpu,
                title: "Intelligent Automation Workflows",
                desc: "Executes approved automation pipelines deterministically, eliminating repetitive operational digital tasks under user oversight.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
              },
              {
                icon: Layers,
                title: "Personal AI Operating System Vision",
                desc: "Being actively developed toward a unified, voice-first AI interface capable of understanding the user and acting through approved tools across services.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${f.bg}`}
                >
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Defensible Capability Disclosure Notice */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              Development &amp; Integration Governance
            </h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Logic Voice is actively evolving. In alignment with Logic Intelligence Technologies&apos;
            engineering principles, capabilities in active development are disclosed transparently.
            Integrations operate strictly via approved APIs and user authorization. We do not make
            unsupported claims regarding unverified third-party services or universal connectivity.
          </p>
        </section>

        {/* CTA Card */}
        <section className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-slate-900/80 backdrop-blur-md p-8 md:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">
              Experience Logic Voice
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Explore the official Logic Voice application or review the open codebase on GitHub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://logicvoice.logicintelligencetechnologies.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-sm tracking-widest uppercase hover:bg-cyan-50 transition-colors"
              >
                <span>Open Application</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/vikashsaravanann/logic-voice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                <span>GitHub Source</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-white/10 text-[10px] font-mono text-slate-500 uppercase">
              <span>Logic Intelligence Technologies</span>
              <span>·</span>
              <span>Personal AI Assistant</span>
              <span>·</span>
              <span>Voice-First Architecture</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
