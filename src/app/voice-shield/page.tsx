import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { voiceShieldProductNode } from "@/lib/seo/schema";
import LiquidBackground from "@/components/voice-shield/liquid-background";
import { 
  ShieldCheck, 
  Activity, 
  Lock, 
  Zap, 
  ArrowRight,
  Radio,
  Mic,
  Waves as Waveform,
  Globe,
  Server,
  Database,
  Terminal
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.logicintelligencetechnologies.in";

export const metadata: Metadata = {
  title: "VoiceShield | AI Voice Security & Compliance | LIT",
  description: "VoiceShield is an AI-powered voice security and compliance intelligence product by Logic Intelligence Technologies Pvt. Ltd. Defend against deepfakes in real-time.",
  alternates: { canonical: `${SITE_URL}/voice-shield` },
};

import BackToHome from "@/components/ui/back-to-home";

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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        
        {/* HERO */}
        <section className="text-center pt-16 lg:pt-24 space-y-8 animate-in fade-in zoom-in-95 duration-1000 ease-out fill-mode-both">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.15)] mx-auto">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              A Logic Intelligence Technologies Product | AI Security & Voice Fraud Intelligence
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-xl max-w-5xl mx-auto">
            Production-Grade Telephony Voice Anti-Spoofing
          </h1>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Detect the clone. Protect the conversation.
          </h2>

          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Real-time AI voice cloning detection and active prevention for Indian telecommunication and BFSI networks. Sub-250ms latency with zero disk retention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link
              href="/voice-shield/request"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] backdrop-blur-md"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-mono font-bold tracking-widest text-cyan-100 uppercase text-sm">Start Live Demo</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          {[
            { value: "< 250 ms", label: "END-TO-END LATENCY", color: "text-cyan-400" },
            { value: "< 5.4%", label: "TELEPHONY EER (G.711)", color: "text-violet-400" },
            { value: "0 BYTES", label: "AUDIO ON DISK (DPDP)", color: "text-emerald-400" },
            { value: "100%", label: "RLS AUDIT LOGGED", color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-xl hover:border-slate-700 transition-colors">
              <div className={`text-3xl md:text-4xl font-black font-mono mb-2 ${stat.color} drop-shadow-md`}>{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* DEFENSE ARCHITECTURE */}
        <section id="architecture" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              Defense Architecture
            </h2>
            <p className="text-sm font-mono tracking-[0.2em] text-cyan-400 uppercase">
              Engineered for Indian Voice Security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Radio,
                title: "STREAMING WEBSOCKET INFERENCE",
                desc: "333ms raw PCM audio hops evaluated via hybrid DSP and deep attention heads in volatile RAM without blocking.",
                color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20"
              },
              {
                icon: Mic,
                title: "EXPLAINABLE AI SPECTROGRAM",
                desc: "Waterfall spectral heatmaps surface plain-English anomaly markers like unnatural high-frequency energy and phase variance.",
                color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20"
              },
              {
                icon: Globe,
                title: "MULTILINGUAL CHALLENGE-RESPONSE",
                desc: "Unpredictable phonemic phrases in Hindi, Tamil, and English that commercial voice clones cannot articulate in real time.",
                color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20"
              },
              {
                icon: Server,
                title: "RESILIENT JITTERED FALLBACK",
                desc: "4-second circular ring buffer prevents packet loss during network severance, resuming seamlessly with monotonic chunk tracking.",
                color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20"
              },
              {
                icon: Database,
                title: "APPEND-ONLY RLS AUDIT TRAIL",
                desc: "Every detection event, connection drop, and auth challenge logged to Supabase Postgres protected by strict Row-Level Security.",
                color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20"
              },
              {
                icon: ShieldCheck,
                title: "ZERO RAW AUDIO PERSISTENCE",
                desc: "Strict compliance with Digital Personal Data Protection (DPDP) Act. All feature tensors processed in ephemeral RAM.",
                color: "text-red-400", bg: "bg-red-500/10 border-red-500/20"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${feature.bg}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM FOOTER CTA */}
        <section className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl p-8 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Ready to secure your telephony infrastructure?
            </h2>
            <p className="text-cyan-200/70 max-w-2xl mx-auto font-mono text-sm tracking-wide">
              Real-time telephony middleware mitigating AI synthetic voice clones and conversational deepfake fraud within 269ms.
            </p>
            <div className="pt-6">
              <Link
                href="/voice-shield/request"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-sm tracking-widest uppercase transition-all hover:bg-cyan-50"
              >
                <Terminal className="w-5 h-5" />
                Request Beta Access
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8 pt-8 border-t border-white/10 text-[10px] font-mono text-slate-500 uppercase">
              <span>DPDP Act 2023 Compliant</span>
              <span>•</span>
              <span>G.711 / AMR Support</span>
              <span>•</span>
              <span>Zero Raw Audio Storage</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
