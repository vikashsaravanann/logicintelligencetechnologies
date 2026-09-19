"use client";

import React from "react";
import { Building2, Phone, Scale, CreditCard, ShieldCheck, Radio } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const USE_CASES = [
  {
    icon: Building2,
    sector: "Banking & Financial Services",
    headline: "Voice Authentication Security",
    description:
      "Protect phone banking IVR and call-centre authentication from synthetic voice attacks. Detect when a caller presents a cloned voice to bypass voice-print verification.",
    signals: ["IVR authentication", "Call centre fraud", "Voice biometric bypass"],
    color: "text-cyan-400",
  },
  {
    icon: Phone,
    sector: "Telecommunications",
    headline: "Telephony Fraud Detection",
    description:
      "Deploy real-time anti-spoofing at the network edge. Analyse call streams for synthetic voice signatures and flag suspicious sessions for human review.",
    signals: ["Live call analysis", "Network-level detection", "Session flagging"],
    color: "text-blue-400",
  },
  {
    icon: Scale,
    sector: "Legal & Compliance",
    headline: "Voice Evidence Forensics",
    description:
      "Generate forensic reports for recorded audio evidence. Identify splice regions, synthetic insertions, and phase discontinuities. Export Section 65B-compatible reports.",
    signals: ["Evidence authentication", "Court-admissible reports", "Splice detection"],
    color: "text-violet-400",
  },
  {
    icon: CreditCard,
    sector: "Enterprise Security",
    headline: "Executive Impersonation Detection",
    description:
      "Detect AI-generated voice impersonation of executives in phone-based authorisation flows. Protect wire transfer approvals and sensitive data access.",
    signals: ["CEO fraud", "Wire transfer fraud", "Social engineering"],
    color: "text-emerald-400",
  },
  {
    icon: ShieldCheck,
    sector: "Security Operations",
    headline: "SOC Voice Threat Intelligence",
    description:
      "Integrate VoiceShield detection signals into Security Operations Centre workflows. Real-time risk scoring, challenge-response triggers, and session audit logs.",
    signals: ["Risk scoring", "Challenge-response", "Audit logs"],
    color: "text-amber-400",
  },
  {
    icon: Radio,
    sector: "Broadcasting & Media",
    headline: "Media Authenticity Verification",
    description:
      "Verify whether broadcast audio or podcast content contains AI-generated voice segments. Detect synthetic insertions into recorded media for editorial integrity.",
    signals: ["Content verification", "Synthetic detection", "Integrity reports"],
    color: "text-rose-400",
  },
] as const;

export default function VoiceShieldUseCases() {
  return (
    <section className="py-24 px-6 relative" aria-labelledby="vs-usecases-heading">
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
            Use Cases
          </span>
        </div>

        <div className="mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2
            id="vs-usecases-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md"
          >
            Sector applications
          </h2>
          <p className="text-cyan-50/80 text-lg max-w-3xl leading-relaxed">
            VoiceShield is applicable wherever voice authenticity matters.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          {USE_CASES.map((uc, i) => (
            <GlassSurface key={uc.headline} variant="liquid" className="p-6 h-full border-white/5 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <uc.icon className={`w-5 h-5 ${uc.color}`} aria-hidden />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${uc.color}`}>
                  {uc.sector}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{uc.headline}</h3>
              <p className="text-xs text-cyan-100/60 leading-relaxed mb-4">{uc.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {uc.signals.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-cyan-100/80 shadow-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
