import React from "react";
import { Scale, Fingerprint, EyeOff, Users, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible AI Guidelines | Logic Intelligence Technologies",
  description: "Our strict ethical frameworks, privacy protocols, and bias mitigation strategies for enterprise AI.",
};

export default function AIEthicsPage() {
  const principles = [
    {
      title: "Data Privacy & Ephemerality",
      icon: EyeOff,
      desc: "Our primary architecture (like VoiceShield) relies on zero-persistence RAM-only processing. We do not store, log, or train on your customer's voice data. When the connection drops, the data ceases to exist.",
    },
    {
      title: "Algorithmic Fairness",
      icon: Scale,
      desc: "Our foundational models are trained on highly diverse, globally representative datasets. We continuously audit our neural networks to prevent demographic bias, ensuring equal accuracy across all accents and dialects.",
    },
    {
      title: "Identity Protection",
      icon: Fingerprint,
      desc: "We build AI to protect human identity, not mimic it. We actively refuse contracts or requests involving non-consensual voice cloning or deceptive generative technologies.",
    },
    {
      title: "Human-in-the-Loop",
      icon: Users,
      desc: "Our security APIs generate probabilistic risk scores, not absolute black-and-white automated bans. We empower human agents and security teams to make the final, nuanced decisions.",
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.05),_transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-20 text-center space-y-6">
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            Responsible AI
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            At Logic Intelligence Technologies, we believe artificial intelligence must be constrained by strict ethical frameworks. Innovation without responsibility is a liability.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {principles.map((p, idx) => (
            <div key={idx} className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-4 -translate-y-4">
                <p.icon className="w-32 h-32 text-emerald-500" />
              </div>
              
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <p.icon className="w-6 h-6 text-emerald-400" />
              </div>
              
              <h3 className="text-lg font-mono font-bold tracking-widest text-white uppercase mb-4">
                {p.title}
              </h3>
              
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Compliance Footer */}
        <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-8 flex items-center justify-center gap-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
            Designed to support SOC2, GDPR, and emerging global AI regulations.
          </p>
        </div>

      </div>
    </div>
  );
}
