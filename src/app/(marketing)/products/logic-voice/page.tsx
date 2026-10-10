import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { logicVoiceProductNode } from "@/lib/seo/schema";
import BackButton from "@/components/navigation/back-button";
import AudioThreatSimulator from "@/components/voice-shield/audio-threat-simulator";
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
  Lock,
  CheckCircle2,
  Clock,
  Key,
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
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <BackButton fallbackHref="/products" label="Back to Products" inline />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [logicVoiceProductNode()],
          }),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-20">
        {/* Hero Section */}
        <section className="text-center pt-4 sm:pt-8 space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.16em] bg-[#1FA9A2]/10 text-[#0E7A74] border border-[#1FA9A2]/25 shadow-2xs">
            <Mic className="w-3.5 h-3.5 text-[#1FA9A2]" />
            <span>A Logic Intelligence Technologies Product · Personal AI OS</span>
          </div>

          <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.08] uppercase">
            Logic Voice
          </h1>

          <p className="text-xl sm:text-2xl font-serif italic text-[var(--lit-blue,#1565C0)] font-normal">
            Voice-first personal AI assistant &amp; intelligent automation
          </p>

          <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-3xl mx-auto font-normal">
            Logic Voice is engineered to allow users to interact naturally through speech. Built
            around low-latency speech recognition, contextual reasoning, multi-step goal planning,
            and approved tool execution with controlled authorization gates for consequential actions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="https://logicvoice.logicintelligencetechnologies.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 shadow-sm min-h-[48px]"
            >
              <Zap className="w-4 h-4 text-[#45D9D2]" />
              <span>Launch Logic Voice</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#45D9D2]" />
            </a>
            <a
              href="https://github.com/vikashsaravanann/logic-voice"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[#DFE7EF] bg-white hover:bg-[#F7F9FC] text-[var(--lit-navy,#0B2545)] font-mono text-xs tracking-wider uppercase transition-colors shadow-2xs min-h-[48px]"
            >
              <Terminal className="w-4 h-4 text-[#1FA9A2]" />
              <span>View GitHub Repository</span>
            </a>
          </div>
        </section>

        {/* Product Visual / Interactive Threat & Waveform Console Preview */}
        <section className="relative rounded-3xl overflow-hidden border border-[#DFE7EF] shadow-sm bg-white p-2 sm:p-6">
          <AudioThreatSimulator />
          <div className="flex flex-wrap items-center justify-between gap-4 mt-5 px-3 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1FA9A2] animate-pulse" />
              <span>LIVE VOCAL TELEMETRY & IN-BAND VERIFICATION ENGINE</span>
            </div>
            <div className="flex items-center gap-4">
              <span>ZERO UNAUTHORIZED MUTATIONS</span>
              <span>·</span>
              <span>SUB-400MS LATENCY TARGET</span>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          aria-label="Logic Voice Highlights"
        >
          {[
            {
              value: "Voice-First",
              label: "Speech understanding & vocal response",
              badgeColor: "bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/20",
              indicator: "bg-[#1FA9A2]",
            },
            {
              value: "Reasoning",
              label: "Multi-step planning & context memory",
              badgeColor: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
              indicator: "bg-[#1565C0]",
            },
            {
              value: "Controlled",
              label: "Confirmations for sensitive tool actions",
              badgeColor: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
              indicator: "bg-[#7C3AED]",
            },
            {
              value: "Long-Term",
              label: "Personal AI Operating System direction",
              badgeColor: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
              indicator: "bg-[#B45309]",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#DFE7EF] rounded-2xl p-6 sm:p-7 shadow-xs hover:border-[#1FA9A2]/40 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${item.indicator}`} />
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold uppercase ${item.badgeColor}`}>
                  {item.value}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)] mb-1">
                {item.value}
              </div>
              <div className="text-xs font-medium text-[var(--lit-text-muted,#52677C)]">
                {item.label}
              </div>
            </div>
          ))}
        </section>

        {/* Product Architecture & Capabilities */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
              System Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Architecture &amp; Product Direction
            </h2>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto">
              How Logic Voice operates deterministically across speech recognition, cognitive planning, and safety gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: "Listening & Speech Recognition",
                desc: "Low-latency acoustic capture converting natural spoken commands into contextual input tokens without requiring manual typing.",
                accent: "bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/20",
              },
              {
                icon: Brain,
                title: "Natural-Language Reasoning & Planning",
                desc: "Understands intent, breaks down compound requests into executable stages, and maintains conversational context throughout the session.",
                accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
              },
              {
                icon: ShieldCheck,
                title: "Controlled Authorization & Tool Boundaries",
                desc: "Consequential and sensitive actions strictly require explicit user confirmation before any tool or integration performs state modification.",
                accent: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
              },
              {
                icon: Sparkles,
                title: "Research & Knowledge Synthesis",
                desc: "Researches targeted information, synthesizes verified answers, and delivers concise summaries through clear vocal responses.",
                accent: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
              },
              {
                icon: Cpu,
                title: "Intelligent Automation Workflows",
                desc: "Executes approved automation pipelines deterministically, eliminating repetitive operational digital tasks under user oversight.",
                accent: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
              },
              {
                icon: Layers,
                title: "Personal AI Operating System Vision",
                desc: "Being actively developed toward a unified, voice-first AI interface capable of understanding the user and acting through approved tools across services.",
                accent: "bg-[#FCEAF3] text-[#BE185D] border-[#FBCFE8]",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[#DFE7EF] rounded-3xl p-7 sm:p-8 shadow-xs hover:border-[#1FA9A2]/40 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${f.accent} group-hover:scale-105 transition-transform duration-200`}
                  >
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-3 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Architecture Specs Strip */}
        <section className="bg-white border border-[#DFE7EF] rounded-3xl p-8 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#DFE7EF]">
            <div className="space-y-2 md:pr-6">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1565C0] uppercase">
                <Clock className="w-4 h-4" />
                <span>Audio Streaming</span>
              </div>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                WebSocket chunked audio streaming for low-latency conversational feedback.
              </p>
            </div>
            <div className="space-y-2 pt-4 md:pt-0 md:px-6">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0E7A74] uppercase">
                <Brain className="w-4 h-4" />
                <span>Context Window</span>
              </div>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                Persistent multi-turn session memory with deterministic stage checkpoints.
              </p>
            </div>
            <div className="space-y-2 pt-4 md:pt-0 md:px-6">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#7C3AED] uppercase">
                <Key className="w-4 h-4" />
                <span>Zero-Trust Auth</span>
              </div>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                Sensitive tool mutations isolated behind cryptographically signed confirmation tokens.
              </p>
            </div>
            <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#059669] uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Deterministic Exec</span>
              </div>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                Strict JSON schema validations preventing hallucinated arguments or invalid API calls.
              </p>
            </div>
          </div>
        </section>

        {/* Defensible Capability Disclosure Notice */}
        <section className="rounded-3xl border border-[#DDD6FE] bg-[#F1ECFF]/40 p-8 sm:p-10 max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-3 text-[#7C3AED]">
            <Lock className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Development &amp; Integration Governance
            </h3>
          </div>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
            Logic Voice is actively evolving. In alignment with Logic Intelligence Technologies&apos;
            engineering principles, capabilities in active development are disclosed transparently.
            Integrations operate strictly via approved APIs and user authorization. We do not make
            unsupported claims regarding unverified third-party services or universal connectivity.
          </p>
        </section>

        {/* CTA Card */}
        <section className="relative rounded-3xl overflow-hidden bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-14 text-center shadow-md">
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <span className="inline-block px-3.5 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-mono font-semibold uppercase tracking-wider text-[#45D9D2]">
              Interactive Voice AI Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Experience Logic Voice
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              Explore the official Logic Voice application or review the open codebase on GitHub.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://logicvoice.logicintelligencetechnologies.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1FA9A2] text-slate-950 font-bold text-xs tracking-widest uppercase hover:bg-[#45D9D2] transition-colors duration-200 min-h-[48px] shadow-sm"
              >
                <span>Open Application</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/vikashsaravanann/logic-voice"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white font-mono text-xs tracking-widest uppercase hover:bg-white/20 transition-colors duration-200 min-h-[48px]"
              >
                <span>GitHub Source</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3 pt-6 border-t border-white/10 text-[11px] font-mono text-slate-400 uppercase">
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
