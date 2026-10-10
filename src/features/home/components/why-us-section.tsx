"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, Server, Activity, Terminal } from "lucide-react";

export default function WhyUsSection() {
  const points = [
    {
      title: "Enterprise Architecture",
      desc: "Scalable, resilient, and decoupled foundations engineered to expand alongside operational demands.",
      icon: Server,
    },
    {
      title: "Sub-Second Performance",
      desc: "Optimized Core Web Vitals, minimal client bundles, and intelligent caching strategies out of the box.",
      icon: Zap,
    },
    {
      title: "Zero-Trust Security",
      desc: "Strict schema validation, row-level database security, and end-to-end secret sanitation on every build.",
      icon: ShieldCheck,
    },
    {
      title: "Deterministic AI Workflows",
      desc: "Constrained retrieval pipelines and strictly gated model orchestration that eliminate hallucinations.",
      icon: CheckCircle2,
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-transparent relative overflow-hidden border-t border-white/[0.08]">
      {/* Background radial accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#45D9D2]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            <div>
              <span className="lit-eyebrow mb-4 block">System Principles</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                Why modern teams <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
                  build with LIT.
                </span>
              </h2>
            </div>
            
            <p className="text-[#B5BECC] text-base sm:text-lg leading-relaxed">
              You get a direct line to an AI &amp; Data Science engineer who writes production code, not agency sales decks. Every platform begins with deep workflow analysis, followed by rigorous architecture that ships on time and remains maintainable for years.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {points.map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-[#10131A] border border-white/10 hover:border-[#45D9D2]/30 hover:bg-[#151922] transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center shrink-0 text-[#45D9D2]">
                    <point.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-display font-bold text-sm mb-1">{point.title}</h4>
                    <p className="text-[#B5BECC] text-xs leading-relaxed">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative rounded-2xl border border-white/10 bg-[#10131A] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            {/* Terminal / telemetry header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
                <span className="text-xs font-mono text-[#B5BECC] ml-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#45D9D2]" /> lit-core-mesh:telemetry
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping inline-block" /> Active
              </span>
            </div>

            {/* Metrics display */}
            <div className="space-y-5">
              <div className="bg-[#151922] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-[#B5BECC]">Edge Request Latency</span>
                  <span className="text-[#45D9D2] font-bold">18ms (p99)</span>
                </div>
                <div className="h-1.5 w-full bg-[#07090D] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] w-[94%]" />
                </div>
              </div>

              <div className="bg-[#151922] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-[#B5BECC]">Model Guardrail Alignment</span>
                  <span className="text-[#45D9D2] font-bold">100% Deterministic</span>
                </div>
                <div className="h-1.5 w-full bg-[#07090D] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#45D9D2] to-[#60A5FA] w-[100%]" />
                </div>
              </div>

              <div className="bg-[#151922] p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-[#B5BECC]">Automated Test Coverage</span>
                  <span className="text-[#45D9D2] font-bold">260 Passing Suites</span>
                </div>
                <div className="h-1.5 w-full bg-[#07090D] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1FA9A2] to-[#10B981] w-[100%]" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#B5BECC]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#45D9D2]" />
                  <span>Continuous Verification</span>
                </div>
                <span className="text-white">IST +5:30 Synced</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 rounded-xl border border-white/5 bg-[#07090D]/60 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#45D9D2]" />
                <span className="text-xs font-mono text-[#F8FAFC]">System Status: Operational</span>
              </div>
              <span className="text-xs font-mono text-[#45D9D2]">Production Ready</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
