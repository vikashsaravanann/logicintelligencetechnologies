import React from "react";
import { Search, Compass, Cpu, Cog, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: "Structured AI Implementation | Logic Intelligence Technologies",
  description: "Learn about our 3-phase AI discovery and integration process tailored for enterprise clients.",
};

export default function AIDiscoveryPage() {
  const phases = [
    {
      step: "01",
      title: "Infrastructure Assessment",
      icon: Search,
      desc: "We perform a deep-dive audit into your existing tech stack, database schemas, and current VoIP or API architectures. We identify exact points of friction where AI can act as a force multiplier or security shield.",
    },
    {
      step: "02",
      title: "Strategy & Modeling",
      icon: Cpu,
      desc: "Our engineers design a custom AI solution. Whether deploying VoiceShield nodes at your network edge or fine-tuning an LLM for your internal knowledge base, we outline the exact topology and expected latencies.",
    },
    {
      step: "03",
      title: "Zero-Downtime Integration",
      icon: Cog,
      desc: "We utilize blue-green deployment strategies to safely inject the AI middleware into your production environment. You get full SOC2-compliant observability without risking a second of customer downtime.",
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <BackToHome />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_right,_rgba(16,185,129,0.08),_transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-16 space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mb-4">
            <Compass className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-[11px] font-mono font-bold tracking-[0.28em] text-emerald-400 uppercase">
            Enterprise Consulting
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            AI Discovery Process
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A precise, structured approach to integrating transformative AI into massive legacy systems. We mitigate risk while maximizing operational velocity.
          </p>
        </div>

        {/* Phases */}
        <div className="space-y-6 max-w-4xl mx-auto mb-16">
          {phases.map((phase, idx) => (
            <div key={idx} className="relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 shadow-xl flex flex-col md:flex-row gap-8 items-start hover:border-emerald-500/30 transition-colors">
              <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-[#0a0e17] border border-emerald-900/50 shadow-inner">
                <phase.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono font-bold text-emerald-500 mb-2 uppercase tracking-widest">Phase {phase.step}</div>
                <h3 className="text-xl font-mono font-bold tracking-widest text-white uppercase mb-3">
                  {phase.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-8 sm:p-10 shadow-2xl text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-2xl font-mono font-bold tracking-widest text-white uppercase mb-4">
            Ready to secure your infrastructure?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
            Book a consultation with our lead architects. We will provide a preliminary assessment of your systems at no initial cost.
          </p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs tracking-[0.15em] uppercase shadow-lg shadow-emerald-500/25 transition-all"
          >
            Schedule Discovery Call <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
