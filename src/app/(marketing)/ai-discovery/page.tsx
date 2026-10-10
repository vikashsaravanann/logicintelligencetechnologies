import React from "react";
import {
  Search,
  Compass,
  Cpu,
  Cog,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Structured AI Implementation & Discovery | Logic Intelligence Technologies",
  description:
    "Explore our 3-phase enterprise AI discovery, deterministic modeling, latency benchmarking, and zero-downtime integration methodology.",
};

export default function AIDiscoveryPage() {
  const phases = [
    {
      step: "01",
      duration: "Week 1",
      title: "Infrastructure & Stack Assessment",
      icon: Search,
      iconColor: "text-[var(--lit-blue,#1565C0)]",
      iconBg: "bg-[#E7F3FF] border-[#B9DCFF]",
      desc: "We perform an in-depth audit of your existing technology stack, database schemas, API latencies, and legacy workflows. We pinpoint the exact operational bottlenecks where deterministic AI orchestration delivers measurable ROI.",
      focus: [
        "Data pipeline and database schema inspection",
        "Authentication, RBAC, and boundary isolation",
        "Real-world API latency and throughput benchmarks",
        "Legacy operational cost and labor baseline modeling",
      ],
      deliverable: "Architecture Audit Report & Integration Topology Blueprint",
    },
    {
      step: "02",
      duration: "Weeks 2–3",
      title: "Strategy, Modeling & Deterministic Scaffolding",
      icon: Cpu,
      iconColor: "text-[#6E44FF]",
      iconBg: "bg-[#F1ECFF] border-[#D7C9FF]",
      desc: "Our systems architects design the solution topology. Whether deploying localized edge inference, private RAG vector indices, or multi-agent state machines, we construct strict validation bounds to eliminate hallucinations.",
      focus: [
        "Model evaluation matrix (Gemini, Claude, Llama 3, DeepSeek)",
        "Strict Pydantic / Zod JSON schema validation contracts",
        "Safety guardrail circuits and hallucination filters",
        "Vector embedding indices with hybrid semantic search",
      ],
      deliverable: "Model Selection Matrix, Latency Benchmarks & Schema Contracts",
    },
    {
      step: "03",
      duration: "Weeks 4–6",
      title: "Zero-Downtime Staged Integration",
      icon: Cog,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-50 border-emerald-200",
      desc: "Using blue-green deployments and canary routing, we inject AI middleware into your production pipeline with zero disruption to active users. Full observability, structured logging, and fallback circuits come standard.",
      focus: [
        "Canary deployment with automated error budget gates",
        "Deterministic fallback pathways on upstream API outage",
        "OpenTelemetry tracing, token usage, and latency tracking",
        "Comprehensive documentation and operational SLA handover",
      ],
      deliverable: "Live Production Deployment, Telemetry Dashboards & SLA Handover",
    },
  ];

  const guarantees = [
    {
      icon: Lock,
      title: "Zero Data Leakage",
      desc: "Customer data never enters public model training pools. Private VPC endpoints and encrypted in-flight tokens safeguard intellectual property.",
    },
    {
      icon: Zap,
      title: "Deterministic Validation",
      desc: "Rigid type contracts reject hallucinated outputs before responses reach your users, UI, or transactional databases.",
    },
    {
      icon: Activity,
      title: "End-to-End Observability",
      desc: "Granular token accounting, latency metrics, and semantic drift monitoring integrated directly into your existing APM stack.",
    },
    {
      icon: ShieldCheck,
      title: "Guaranteed Availability",
      desc: "Dual-provider failover routing prevents vendor lock-in and protects application uptime during model provider outages.",
    },
  ];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-20">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] text-xs font-mono font-medium tracking-wider uppercase mb-5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            Enterprise AI Implementation Roadmap
          </div>
          <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight mb-4">
            Structured AI{" "}
            <span className="text-[var(--lit-blue,#1565C0)]">
              Discovery Process
            </span>
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[var(--lit-teal,#1FA9A2)] mb-3">
            Deterministic modeling, zero-hallucination guardrails, and seamless production integration.
          </p>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto">
            A battle-tested 3-phase engineering methodology for introducing transformative intelligence into mission-critical applications without compromising security, uptime, or data privacy.
          </p>
        </div>

        {/* 3 Phases Process Stack */}
        <div className="space-y-6 max-w-4xl mx-auto mb-20">
          {phases.map((phase) => (
            <div
              key={phase.step}
              className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div
                  className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl border ${phase.iconBg} ${phase.iconColor} shadow-xs`}
                >
                  <phase.icon className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-[var(--lit-blue,#1565C0)] uppercase tracking-wider">
                      Phase {phase.step} • {phase.duration}
                    </span>
                    <div className="h-px w-8 bg-[var(--lit-border-light,#DFE7EF)]" />
                  </div>

                  <h2 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] mb-3">
                    {phase.title}
                  </h2>

                  <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-5">
                    {phase.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {phase.focus.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-[var(--lit-navy,#0B2545)] font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)]">
                    <span className="font-mono font-bold text-[var(--lit-blue,#1565C0)] uppercase">
                      Primary Output:
                    </span>
                    <span className="font-medium">{phase.deliverable}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantees Grid */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="font-poppins text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-2">
              Enterprise Engineering Guardrails
            </h2>
            <p className="font-serif italic text-sm text-[var(--lit-teal,#1FA9A2)]">
              Rigorous architectural standards applied to every AI engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {guarantees.map((g, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFF] text-[var(--lit-blue,#1565C0)] flex items-center justify-center mb-4">
                  <g.icon className="w-5 h-5" />
                </div>
                <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)] mb-1.5">
                  {g.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#B9DCFF] bg-gradient-to-br from-[#E7F3FF] via-white to-[#F1ECFF] p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#B9DCFF] flex items-center justify-center text-[var(--lit-blue,#1565C0)] mx-auto mb-5 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] mb-3">
            Ready to Architect Your AI Pipeline?
          </h2>
          <p className="font-serif italic text-base text-[var(--lit-teal,#1FA9A2)] mb-3">
            Begin with a zero-obligation systems consultation.
          </p>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-xl mx-auto mb-8">
            Book an initial technical review with our principal architects. We evaluate your current systems topology and return a concrete feasibility and ROI assessment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/book-consultation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discovery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>Take Discovery Questionnaire</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <CTASection
        title="Deploy Autonomous Enterprise AI with Confidence"
        subtitle="Speak directly with our solutions architects to design a bespoke AI implementation plan for your data stack."
        primaryCta={{
          label: "Schedule Architecture Call",
          href: "/book-consultation",
        }}
        secondaryCta={{
          label: "Explore AI Voice Agents",
          href: "/products/ai-voice-agents",
        }}
      />
    </main>
  );
}
