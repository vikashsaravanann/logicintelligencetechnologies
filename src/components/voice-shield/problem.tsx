"use client";

import React from "react";
import { PhoneCall, TrendingUp, Users, Building2, AlertCircle } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const THREATS = [
  {
    icon: PhoneCall,
    title: "Voice Clone Fraud",
    description:
      "AI text-to-speech and voice conversion tools can synthesize a person's voice from minutes of audio. These clones are used in phone-based social engineering, impersonating executives, bank customers, or government officials.",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: TrendingUp,
    title: "Telephony Attack Surface",
    description:
      "Call centres, banking IVRs, and enterprise VOIP systems process millions of calls daily. A single undetected voice clone can bypass voice authentication systems and compromise accounts.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Users,
    title: "Social Engineering at Scale",
    description:
      "AI voice generation has made scaled social engineering viable. Attackers can generate contextually appropriate speech in real time, making traditional detection approaches insufficient.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Building2,
    title: "Enterprise & BFSI Exposure",
    description:
      "Banking, financial services, and large enterprises face acute exposure. Voice-activated systems and call-based authentication are vulnerable to synthetic voice attacks.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
] as const;

export default function VoiceShieldProblem() {
  return (
    <section
      className="py-24 px-6 relative"
      aria-labelledby="vs-problem-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section label */}
        <div className="mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
            The Threat Landscape
          </span>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2
            id="vs-problem-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md"
          >
            Voice fraud is{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              an unsolved problem
            </span>{" "}
            for telephony.
          </h2>

          <p className="text-cyan-50/80 text-lg max-w-3xl mb-16 leading-relaxed">
            Advances in generative AI have made high-quality voice synthesis accessible
            and affordable. Traditional voice authentication systems — built for human
            imposters — are not designed to detect machine-generated voices. VoiceShield
            addresses this gap with purpose-built anti-spoofing technology.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          {THREATS.map((threat, i) => (
            <GlassSurface key={threat.title} variant="liquid" className="p-6 h-full border-white/5 hover:border-white/10 transition-colors">
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 border ${threat.bg}`}
              >
                <threat.icon className={`w-5 h-5 ${threat.color}`} aria-hidden />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{threat.title}</h3>
              <p className="text-sm text-cyan-100/60 leading-relaxed">{threat.description}</p>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
