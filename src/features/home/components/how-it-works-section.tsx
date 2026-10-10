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
      accent: "text-[var(--lit-blue)]",
      bg: "bg-[var(--lit-light-blue)]",
      border: "border-[#BFDBFE]",
    },
    {
      id: "02",
      title: "Prototype Demonstration",
      badge: "Days 3–5",
      desc: "We build a functioning interactive prototype demonstration so you verify look, feel, and performance before financial commitment.",
      deliverable: "Live Working Prototype (Zero Cost)",
      icon: PenTool,
      accent: "text-[var(--lit-teal)]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
    },
    {
      id: "03",
      title: "Full-Stack Engineering",
      badge: "Sprint Milestone",
      desc: "Engineered with Next.js App Router, TypeScript, and hardened AI APIs, enforcing strict schema validation and test coverage.",
      deliverable: "Production Codebase & Test Suites",
      icon: Code,
      accent: "text-[#7C3AED]",
      bg: "bg-[var(--lit-light-purple)]",
      border: "border-[#DDD6FE]",
    },
    {
      id: "04",
      title: "Deployment & Handover",
      badge: "Final Delivery",
      desc: "Comprehensive automated test suites, link verification, and performance profiling before continuous delivery on enterprise cloud infrastructure.",
      deliverable: "Full IP Vesting & Cloud Deployment",
      icon: Rocket,
      accent: "text-[#D97706]",
      bg: "bg-[var(--lit-light-gold)]",
      border: "border-[#FDE68A]",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[var(--lit-cloud)] border-b border-[#E2E8F0] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-gold)] border border-[#FDE68A] text-[#92400E] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            Deterministic Execution Pipeline
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] tracking-tight leading-[1.08]">
            From Blueprint to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[#7C3AED]">
              Production.
            </span>
          </h2>

          <p className="font-serif italic text-[var(--lit-blue)] text-lg mt-3">
            &ldquo;Verifiable milestones. Zero financial surprises.&rdquo;
          </p>

          <p className="mt-4 text-[var(--lit-text-muted)] text-base leading-relaxed">
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
              className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#CBD5E1] hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center ${step.accent} transition-transform group-hover:scale-105`}>
                    <step.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--lit-blue)] bg-[var(--lit-light-blue)] border border-[#BFDBFE] px-2.5 py-1 rounded-full">
                    PHASE {step.id}
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-[var(--lit-ink)] mb-1.5 group-hover:text-[var(--lit-blue)] transition-colors">
                  {step.title}
                </h3>
                <span className="text-[11px] font-mono text-[var(--lit-text-muted)] block mb-3 font-medium">
                  {step.badge}
                </span>

                <p className="text-xs sm:text-[13px] text-[var(--lit-text-muted)] leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] font-mono text-[var(--lit-blue)] uppercase tracking-wider block mb-1 font-semibold">
                  Deliverable:
                </span>
                <span className="text-xs font-semibold text-[var(--lit-ink)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
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
