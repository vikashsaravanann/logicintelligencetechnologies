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
  Lock,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "Logic Voice | Voice-First Personal AI Assistant | Logic Intelligence Technologies",
  description:
    "Logic Voice is an official product of Logic Intelligence Technologies. A voice-first personal AI assistant engineered for speech recognition, reasoning, planning, and approved tool execution.",
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
    <div className="relative min-h-screen bg-[#07090D] text-slate-100 overflow-x-hidden selection:bg-primary selection:text-slate-950 pt-32 pb-24">
      <BackToHome href="/products" label="Back to Products" />

      {/* Decorative atmospheric glow */}
      <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_rgba(69,217,210,0.12),_transparent_70%)] blur-[140px]" />

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
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#10131A] border border-primary/30 backdrop-blur-md mx-auto">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-primary uppercase">
              A Logic Intelligence Technologies Product · Personal AI OS
            </span>
          </div>

          <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] font-bold tracking-tight text-white leading-[1.05] uppercase">
            Logic Voice
          </h1>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-primary via-[#6DE6E0] to-[#1565C0] bg-clip-text text-transparent">
            Voice-first personal AI assistant &amp; intelligent automation
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-light">
            Logic Voice is engineered to allow users to interact naturally through speech. Built
            around low-latency speech recognition, contextual reasoning, multi-step goal planning,
            and approved tool execution with controlled authorization gates for consequential actions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="https://logicvoice.logicintelligencetechnologies.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-slate-950 hover:bg-[#6DE6E0] font-bold text-xs uppercase tracking-wider transition-all min-h-[48px]"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Logic Voice</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="https://github.com/vikashsaravanann/logic-voice"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl border border-white/15 bg-[#10131A] hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider transition-colors min-h-[48px]"
            >
              <Terminal className="w-4 h-4 text-primary" />
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
              color: "text-primary",
            },
            {
              value: "Reasoning",
              label: "Multi-step planning & context memory",
              color: "text-[#6DE6E0]",
            },
            {
              value: "Controlled",
              label: "Confirmations for sensitive tool actions",
              color: "text-white",
            },
            {
              value: "Long-Term",
              label: "Personal AI Operating System direction",
              color: "text-primary",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#10131A] border border-white/10 rounded-2xl p-6 md:p-8 text-center"
            >
              <div
                className={`text-2xl md:text-3xl font-bold font-mono mb-2 ${item.color}`}
              >
                {item.value}
              </div>
              <div className="text-xs font-semibold text-slate-400 tracking-[0.12em] uppercase">
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
            <p className="text-xs font-mono tracking-[0.2em] text-primary uppercase">
              How Logic Voice operates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: "Listening & Speech Recognition",
                desc: "Low-latency acoustic capture converting natural spoken commands into contextual input tokens without requiring manual typing.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                icon: Brain,
                title: "Natural-Language Reasoning & Planning",
                desc: "Understands intent, breaks down compound requests into executable stages, and maintains conversational context throughout the session.",
                color: "text-[#6DE6E0]",
                bg: "bg-[#6DE6E0]/10 border-[#6DE6E0]/20",
              },
              {
                icon: ShieldCheck,
                title: "Controlled Authorization & Tool Boundaries",
                desc: "Consequential and sensitive actions strictly require explicit user confirmation before any tool or integration performs state modification.",
                color: "text-white",
                bg: "bg-white/10 border-white/20",
              },
              {
                icon: Sparkles,
                title: "Research & Knowledge Synthesis",
                desc: "Researches targeted information, synthesizes verified answers, and delivers concise summaries through clear vocal responses.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                icon: Cpu,
                title: "Intelligent Automation Workflows",
                desc: "Executes approved automation pipelines deterministically, eliminating repetitive operational digital tasks under user oversight.",
                color: "text-[#6DE6E0]",
                bg: "bg-[#6DE6E0]/10 border-[#6DE6E0]/20",
              },
              {
                icon: Layers,
                title: "Personal AI Operating System Vision",
                desc: "Being actively developed toward a unified, voice-first AI interface capable of understanding the user and acting through approved tools across services.",
                color: "text-white",
                bg: "bg-white/10 border-white/20",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#10131A] border border-white/10 rounded-3xl p-8 hover:border-primary/40 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${f.bg} group-hover:scale-105 transition-transform`}
                >
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Defensible Capability Disclosure Notice */}
        <section className="rounded-3xl border border-white/10 bg-[#10131A] p-8 md:p-12 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Lock className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Development &amp; Integration Governance
            </h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-light">
            Logic Voice is actively evolving. In alignment with Logic Intelligence Technologies&apos;
            engineering principles, capabilities in active development are disclosed transparently.
            Integrations operate strictly via approved APIs and user authorization. We do not make
            unsupported claims regarding unverified third-party services or universal connectivity.
          </p>
        </section>

        {/* CTA Card */}
        <section className="relative rounded-3xl overflow-hidden border border-primary/30 bg-[#10131A] p-8 md:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">
              Experience Logic Voice
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
              Explore the official Logic Voice application or review the open codebase on GitHub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://logicvoice.logicintelligencetechnologies.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-slate-950 font-bold text-xs tracking-widest uppercase hover:bg-[#6DE6E0] transition-colors min-h-[48px]"
              >
                <span>Open Application</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/vikashsaravanann/logic-voice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-[#151922] text-white font-mono text-xs tracking-widest uppercase hover:bg-white/10 transition-colors min-h-[48px]"
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
