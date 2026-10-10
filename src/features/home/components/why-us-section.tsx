"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Server,
  Activity,
  Terminal,
  Cpu,
  Lock,
  Layers,
  Code2,
} from "lucide-react";

export default function WhyUsSection() {
  const points = [
    {
      title: "Direct Engineering Access",
      desc: "Direct communication with AI & systems engineers who write production code, completely bypassing non-technical sales intermediaries.",
      icon: Code2,
    },
    {
      title: "Deterministic AI Pipelines",
      desc: "Constrained retrieval architectures, strict schema validation, and gated model execution that systematically eliminate hallucinations.",
      icon: CheckCircle2,
    },
    {
      title: "Sub-Second Response Latency",
      desc: "Micro-bundle optimization, edge caching, and streaming WebRTC channels delivering instantaneous user interactions.",
      icon: Zap,
    },
    {
      title: "Zero-Trust Data Protection",
      desc: "Row-level database security, end-to-end secret sanitization, and compliance-ready data handling on every commit.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#07090D] relative overflow-hidden border-t border-white/[0.08]">
      {/* Background ambient lighting */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#45D9D2]/5 blur-[150px] pointer-events-none rounded-full"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Text & Value Props */}
          <motion.div 
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131A] border border-[#45D9D2]/30 text-[#45D9D2] text-[11px] font-mono uppercase tracking-[0.18em] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2]" />
                Engineering Differentiation
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-[1.08] tracking-tight">
                Why Technology Leaders <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
                  Build With LIT.
                </span>
              </h2>
            </div>
            
            <p className="text-[#B5BECC] text-base sm:text-lg leading-relaxed">
              We eliminate opaque agency markups, outsourced subcontractors, and fragile prompt scripts. Every system begins with workflow analysis, followed by rigorous architecture that ships on schedule and remains maintainable for years.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {points.map((point, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-[#0E121B] border border-white/10 hover:border-[#45D9D2]/30 hover:bg-[#131722] transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center shrink-0 text-[#45D9D2]">
                    <point.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-white font-display font-bold text-sm mb-1">{point.title}</h3>
                    <p className="text-[#B5BECC] text-xs leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Live Telemetry Screen */}
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-5 relative rounded-2xl border border-white/10 bg-[#0E121B] p-6 lg:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {/* Terminal Chrome */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-[#B5BECC] ml-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#45D9D2]" /> lit-core:infrastructure
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Verified Active
              </span>
            </div>

            {/* Diagnostic Metrics Matrix */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#141923] border border-white/5">
                  <p className="text-[10px] font-mono text-[#B5BECC] uppercase tracking-wider">Edge TTFB</p>
                  <p className="text-xl font-display font-bold text-white mt-1">38ms</p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-0.5">Global Anycast</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141923] border border-white/5">
                  <p className="text-[10px] font-mono text-[#B5BECC] uppercase tracking-wider">Database RLS</p>
                  <p className="text-xl font-display font-bold text-[#45D9D2] mt-1">100%</p>
                  <p className="text-[10px] font-mono text-[#B5BECC] mt-0.5">Zero Unauthenticated</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141923] border border-white/5 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#B5BECC] font-mono">Build Verification</span>
                  <span className="font-mono text-emerald-400 font-bold">107/107 Pages SSG/SSR</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#45D9D2] h-full w-full" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#07090D] border border-white/5 font-mono text-[11px] text-zinc-300 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white pb-1 border-b border-white/5">
                  <span className="text-[#45D9D2]">{`> SYSTEM PROTOCOLS`}</span>
                  <span className="text-zinc-500">v2.4.0-stable</span>
                </div>
                <p className="text-emerald-400">{`[OK] Strict TypeScript 5.8: 0 Errors`}</p>
                <p className="text-emerald-400">{`[OK] 260 Unit & Security Contracts Passing`}</p>
                <p className="text-emerald-400">{`[OK] ISO/IEC 27001 Data Sanitization Active`}</p>
                <p className="text-[#45D9D2]">{`[OK] Prototype Demonstration: READY`}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
