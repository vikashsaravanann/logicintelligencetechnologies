import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { voiceShieldProductNode } from "@/lib/seo/schema";
import LiquidBackground from "@/components/voice-shield/liquid-background";
import {
  ShieldCheck,
  Lock,
  Zap,
  ArrowRight,
  Radio,
  Mic,
  Server,
  Database,
  Terminal,
  Activity,
} from "lucide-react";
import BackToHome from "@/components/ui/back-to-home";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "VoiceShield | AI Voice Security | Logic Intelligence Technologies",
  description:
    "VoiceShield is an AI security product by Logic Intelligence Technologies Pvt. Ltd. Analyze eligible voice interactions for configurable fraud-risk, synthetic-voice and security signals with structured evidence.",
  alternates: { canonical: `${SITE_URL}/voice-shield` },
};

export default function VoiceShieldProductPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-slate-100 overflow-x-hidden font-sans">
      <LiquidBackground />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [voiceShieldProductNode()],
          }),
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24 md:space-y-32">
        <section className="text-center pt-12 lg:pt-20 space-y-8">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md mx-auto">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              A Logic Intelligence Technologies Product · AI Voice Security
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            VoiceShield
          </h1>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI voice security & risk intelligence
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Analyze eligible voice interactions for configurable fraud-risk signals,
            synthetic-voice indicators, security anomalies and structured evidence.
            Real-time detection path without an LLM in the hot loop; async forensic
            analysis where deeper review is required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/voice-shield/request"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 transition-all backdrop-blur-md"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-mono font-bold tracking-widest text-cyan-100 uppercase text-sm">
                Request access
              </span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 text-slate-200 font-mono text-sm uppercase tracking-widest hover:border-slate-500 transition-colors text-center"
            >
              View pricing
            </Link>
          </div>
        </section>

        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          aria-label="Product capabilities"
        >
          {[
            {
              value: "Real-time",
              label: "Detection path (no LLM in loop)",
              color: "text-cyan-400",
            },
            {
              value: "Async",
              label: "Forensic + structured evidence",
              color: "text-violet-400",
            },
            {
              value: "Configurable",
              label: "Retention & access controls",
              color: "text-emerald-400",
            },
            {
              value: "API-first",
              label: "Enterprise integration",
              color: "text-amber-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 text-center backdrop-blur-md"
            >
              <div
                className={`text-2xl md:text-3xl font-black font-mono mb-2 ${stat.color}`}
              >
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-400 tracking-[0.12em] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        <section id="architecture" className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Architecture principles
            </h2>
            <p className="text-sm font-mono tracking-[0.15em] text-cyan-400 uppercase">
              Security signals · evidence · enterprise controls
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Radio,
                title: "Streaming analysis path",
                desc: "Audio features evaluated for risk signals without placing an LLM in the real-time detection loop.",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                icon: Activity,
                title: "Async forensic lab",
                desc: "Queued analysis for transcription, structured evidence and human-review workflows when configured.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10 border-cyan-500/20",
              },
              {
                icon: Mic,
                title: "Explainable indicators",
                desc: "Findings tied to segments, timestamps and model outputs — not opaque single scores presented as truth.",
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
              },
              {
                icon: Server,
                title: "Resilient session design",
                desc: "Session-oriented processing with recoverable buffering intended for telephony-oriented deployments.",
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Database,
                title: "Audit-oriented records",
                desc: "Detection and access events designed for append-style audit trails with role-based access controls.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
              {
                icon: Lock,
                title: "Privacy-aware processing",
                desc: "Designed to support privacy requirements including applicable DPDP Act 2023 considerations, depending on deployment and contract.",
                color: "text-red-400",
                bg: "bg-red-500/10 border-red-500/20",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${feature.bg}`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-slate-900/80 backdrop-blur-md p-8 md:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Request VoiceShield access
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Submit a business access request. After review, approved teams receive
              secure console instructions. The live console is not publicly open.
            </p>
            <div className="pt-4">
              <Link
                href="/voice-shield/request"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-sm tracking-widest uppercase hover:bg-cyan-50 transition-colors"
              >
                <Terminal className="w-5 h-5" />
                Request access
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-6 border-t border-white/10 text-[10px] font-mono text-slate-500 uppercase">
              <span>Logic Intelligence Technologies Pvt. Ltd.</span>
              <span>·</span>
              <span>Configurable retention</span>
              <span>·</span>
              <span>Evidence-oriented design</span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl mx-auto pt-2">
              Contact: {COMPANY.emails.hello}
            </p>
          </div>
        </section>

        <div className="flex justify-center pb-8">
          <BackToHome />
        </div>
      </div>
    </main>
  );
}
