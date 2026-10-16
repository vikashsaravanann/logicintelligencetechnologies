"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Terminal,
  Code2,
} from "lucide-react";

export default function WhyUsSection() {
  const points = [
    {
      title: "Direct Engineering Access",
      desc: "Direct communication with AI & systems engineers who write production code, completely bypassing non-technical sales intermediaries.",
      icon: Code2,
      accent: "text-[var(--lit-blue)]",
      bg: "bg-[var(--lit-light-blue)]",
      border: "border-[#BFDBFE]",
    },
    {
      title: "Deterministic AI Pipelines",
      desc: "Constrained retrieval architectures, strict schema validation, and gated model execution that systematically eliminate hallucinations.",
      icon: CheckCircle2,
      accent: "text-[var(--lit-teal)]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
    },
    {
      title: "Sub-Second Response Latency",
      desc: "Micro-bundle optimization, edge caching, and streaming WebRTC channels delivering instantaneous user interactions.",
      icon: Zap,
      accent: "text-[#D97706]",
      bg: "bg-[var(--lit-light-gold)]",
      border: "border-[#FDE68A]",
    },
    {
      title: "Zero-Trust Data Protection",
      desc: "Row-level database security, end-to-end secret sanitization, and compliance-ready data handling on every commit.",
      icon: ShieldCheck,
      accent: "text-[#7C3AED]",
      bg: "bg-[var(--lit-light-purple)]",
      border: "border-[#DDD6FE]",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden border-b border-[#E2E8F0]">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-purple)] border border-[var(--lit-soft-lilac)] text-[#6B21A8] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                Engineering Differentiation
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] leading-[1.08] tracking-tight">
                Why Technology Leaders <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[#7C3AED]">
                  Build With LIT.
                </span>
              </h2>

              <p className="font-serif italic text-[var(--lit-blue)] text-lg mt-3">
                &ldquo;Engineering rigour over agency markups.&rdquo;
              </p>
            </div>

            <p className="text-[var(--lit-text-muted)] text-base sm:text-lg leading-relaxed">
              We eliminate opaque agency markups, outsourced subcontractors, and fragile prompt scripts. Every system begins with workflow analysis, followed by rigorous architecture that ships on schedule and remains maintainable for years.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {points.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white transition-all duration-300 shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-lg ${point.bg} border ${point.border} flex items-center justify-center shrink-0 ${point.accent}`}>
                    <point.icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-[var(--lit-ink)] font-display font-bold text-sm mb-1">{point.title}</h3>
                    <p className="text-[var(--lit-text-muted)] text-xs leading-relaxed">{point.desc}</p>
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
            className="lg:col-span-5 relative rounded-2xl border border-[#E2E8F0] bg-white p-6 lg:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"
          >
            {/* Terminal Chrome */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-mono text-[var(--lit-text-muted)] ml-2 flex items-center gap-1.5 font-medium">
                  <Terminal className="w-3.5 h-3.5 text-[var(--lit-blue)]" /> lit-core:infrastructure
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Verified Active
              </span>
            </div>

            {/* Diagnostic Metrics Matrix */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[10px] font-mono text-[var(--lit-text-muted)] uppercase tracking-wider font-semibold">Edge TTFB</p>
                  <p className="text-xl font-display font-bold text-[var(--lit-ink)] mt-1">38ms</p>
                  <p className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">Global Anycast</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[10px] font-mono text-[var(--lit-text-muted)] uppercase tracking-wider font-semibold">Database RLS</p>
                  <p className="text-xl font-display font-bold text-[var(--lit-blue)] mt-1">100%</p>
                  <p className="text-[10px] font-mono text-[var(--lit-text-muted)] mt-0.5">Zero Unauthenticated</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--lit-text-muted)] font-mono">Build Verification</span>
                  <span className="font-mono text-emerald-700 font-bold">112/112 Pages SSG/SSR</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[var(--lit-teal)] h-full w-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white pb-1.5 border-b border-slate-800">
                  <span className="text-[var(--lit-cyan)]">{`> SYSTEM PROTOCOLS`}</span>
                  <span className="text-slate-400">production</span>
                </div>
                <p className="text-emerald-400">{`[OK] Strict TypeScript 5.8: 0 Errors`}</p>
                <p className="text-emerald-400">{`[OK] 260 Unit & Security Contracts Passing`}</p>
                <p className="text-emerald-400">{`[OK] ISO/IEC 27001 Data Sanitization Active`}</p>
                <p className="text-[var(--lit-cyan)]">{`[OK] Prototype Demonstration: READY`}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
