import React from "react";
import { Search, Compass, Cpu, Cog, ShieldCheck, ArrowRight, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Structured AI Implementation & Discovery | Logic Intelligence Technologies",
  description: "Learn about our 3-phase AI discovery, modeling, and zero-downtime integration methodology for modern enterprises.",
};

export default function AIDiscoveryPage() {
  const phases = [
    {
      step: "01",
      title: "Infrastructure & Stack Assessment",
      icon: Search,
      desc: "We perform an in-depth audit of your existing technology stack, database schemas, API latencies, and legacy workflows. We pinpoint the exact operational bottlenecks where deterministic AI orchestration delivers measurable ROI.",
      deliverable: "Architecture Audit Report & Integration Topology Blueprint",
    },
    {
      step: "02",
      title: "Strategy, Modeling & Deterministic Scaffolding",
      icon: Cpu,
      desc: "Our systems architects design the solution topology. Whether deploying localized edge inference, private RAG vector indices, or multi-agent state machines, we construct strict validation bounds to eliminate hallucinations.",
      deliverable: "Model Selection Matrix, Latency Benchmarks & Schema Contracts",
    },
    {
      step: "03",
      title: "Zero-Downtime Staged Integration",
      icon: Cog,
      desc: "Using blue-green deployments and canary routing, we inject AI middleware into your production pipeline with zero disruption to active users. Full observability, structured logging, and fallback circuits come standard.",
      deliverable: "Live Production Deployment, Telemetry Dashboards & SLA Handover",
    },
  ];

  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
            <Compass className="w-3.5 h-3.5" />
            <span>Enterprise Implementation Roadmap</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase mb-6 leading-tight">
            Structured AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              Discovery Process
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
            A battle-tested 3-phase engineering methodology for introducing transformative intelligence into mission-critical applications without compromising security, uptime, or data privacy.
          </p>
        </div>

        {/* 3 Phases Grid */}
        <div className="space-y-6 max-w-4xl mx-auto mb-16">
          {phases.map((phase) => (
            <div
              key={phase.step}
              className="relative rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row gap-6 md:gap-8 items-start hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-[#07090D] border border-cyan-500/30 text-cyan-400 shadow-xl">
                <phase.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    Phase {phase.step}
                  </span>
                  <div className="h-px w-8 bg-cyan-500/30" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase mb-3">
                  {phase.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {phase.desc}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07090D] border border-white/5 text-xs font-mono text-zinc-300">
                  <span className="text-cyan-400 font-bold">Key Output:</span>
                  <span>{phase.deliverable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-[#10131A] to-blue-500/10 p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-6 shadow-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase mb-4">
            Ready to Architect Your AI Pipeline?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto mb-8 font-light">
            Book an initial technical review with our principal architects. We evaluate your current systems topology and return a concrete feasibility assessment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book-consultation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)]"
            >
              <span>Schedule Architecture Review</span> <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discovery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl border border-white/10 bg-[#07090D] hover:bg-white/[0.06] text-white font-bold text-xs tracking-widest uppercase transition-all"
            >
              <span>Take Discovery Questionnaire</span>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
