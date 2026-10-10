"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Code, Rocket, CheckCircle2 } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "Discovery & Blueprint",
      badge: "Days 1–2",
      desc: "We analyze your exact workflows, system architecture, and user journeys to establish a deterministic implementation plan.",
      deliverable: "Architecture Blueprint & Schema Map",
      icon: Search,
    },
    {
      id: "02",
      title: "Prototype Demonstration",
      badge: "Days 3–5",
      desc: "We build a functioning interactive prototype demonstration so you verify look, feel, and performance before financial commitment.",
      deliverable: "Live Working Prototype (Zero Cost)",
      icon: PenTool,
    },
    {
      id: "03",
      title: "Full-Stack Engineering",
      badge: "Sprint Milestone",
      desc: "Engineered with Next.js App Router, TypeScript, and hardened AI APIs, enforcing strict schema validation and test coverage.",
      deliverable: "Production Codebase & Test Suites",
      icon: Code,
    },
    {
      id: "04",
      title: "Deployment & Handover",
      badge: "Final Delivery",
      desc: "Comprehensive automated test suites, link verification, and performance profiling before continuous delivery on enterprise cloud infrastructure.",
      deliverable: "Full IP Vesting & Cloud Deployment",
      icon: Rocket,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#07090D] border-t border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131A] border border-[#45D9D2]/30 text-[#45D9D2] text-[11px] font-mono uppercase tracking-[0.18em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2]" />
            Deterministic Execution Pipeline
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-[1.08]">
            From Blueprint to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
              Production.
            </span>
          </h2>
          <p className="mt-4 text-[#B5BECC] text-base leading-relaxed">
            A milestone-governed delivery process with complete transparency, daily development updates, and zero financial surprises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#45D9D2]/40 hover:bg-[#131722] hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#141923] border border-white/10 flex items-center justify-center text-[#45D9D2] group-hover:border-[#45D9D2]/40 group-hover:bg-[#45D9D2]/10 transition-colors">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#45D9D2] bg-[#45D9D2]/10 border border-[#45D9D2]/25 px-2.5 py-1 rounded-full">
                    PHASE {step.id}
                  </span>
                </div>
                
                <h3 className="text-lg font-display font-bold text-white mb-1.5 group-hover:text-[#45D9D2] transition-colors">
                  {step.title}
                </h3>
                <span className="text-[11px] font-mono text-[#B5BECC]/80 block mb-3">
                  {step.badge}
                </span>

                <p className="text-xs sm:text-[13px] text-[#B5BECC] leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <span className="text-[10px] font-mono text-[#45D9D2] uppercase tracking-wider block mb-1">
                  Deliverable:
                </span>
                <span className="text-xs font-medium text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#45D9D2] shrink-0" />
                  {step.deliverable}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
