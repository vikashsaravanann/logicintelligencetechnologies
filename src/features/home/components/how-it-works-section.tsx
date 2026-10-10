"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Code, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "Discovery & Blueprint",
      desc: "We analyze your exact workflows, system architecture, and user journeys to establish a deterministic implementation plan.",
      icon: Search,
    },
    {
      id: "02",
      title: "Editorial UI/UX Design",
      desc: "Our design system crafts high-converting, accessible interfaces with dark luxury aesthetic, responsive micro-interactions, and clear hierarchy.",
      icon: PenTool,
    },
    {
      id: "03",
      title: "Engineering & AI Integration",
      desc: "We engineer your platform with Next.js App Router, TypeScript, and hardened AI APIs, enforcing strict schema validation and test coverage.",
      icon: Code,
    },
    {
      id: "04",
      title: "Automated QA & Deployment",
      desc: "Comprehensive automated test suites, link verification, and performance profiling before continuous delivery on enterprise cloud infrastructure.",
      icon: Rocket,
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-[#07090D] border-y border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="lit-eyebrow mb-4 block">Execution Roadmap</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            From Blueprint to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
              Production.
            </span>
          </h2>
        </div>

        <div className="relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#45D9D2]/30 hover:bg-[#151922] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#151922] border border-white/10 flex items-center justify-center text-[#45D9D2] group-hover:border-[#45D9D2]/30 group-hover:bg-[#45D9D2]/10 transition-colors">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#45D9D2] bg-[#45D9D2]/10 border border-[#45D9D2]/20 px-2.5 py-1 rounded-full">
                    PHASE {step.id}
                  </span>
                </div>
                
                <h3 className="text-lg font-display font-bold text-white mb-2.5 group-hover:text-[#45D9D2] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#B5BECC] leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
