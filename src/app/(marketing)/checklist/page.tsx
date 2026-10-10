"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Download,
  Layers,
  Bot,
  Workflow,
  Shield,
  Code2,
  Sparkles,
  Check,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";
import CTASection from "@/components/ui/cta-section";

const PHASES = [
  {
    id: "01",
    title: "Strategic Discovery & Requirement Engineering",
    items: [
      "Define the north-star business objective before code or interface design begins",
      "Audience persona mapping — at least three realistic operational use cases",
      "Competitor UX teardown (features, Core Web Vitals, user-journey friction)",
      "Brand & aesthetic tokens locked (clinical surfaces, teal accents, fluid typography)",
    ],
  },
  {
    id: "02",
    title: "Information Architecture & Experience Design",
    items: [
      "Sitemap and user-flow specifications for primary conversion funnels",
      "Wireframes for mobile-first critical viewpoints down to 320px screen width",
      "High-fidelity UI components built with production design tokens",
      "Accessibility baseline (WCAG AAA contrast, keyboard focus rings, screen reader labels)",
    ],
  },
  {
    id: "03",
    title: "Full-Stack Engineering & Deterministic AI",
    items: [
      "Next.js App Router · React · TypeScript frontend with strict type contracts",
      "FastAPI / Node microservices with parameterized data access and schema validation",
      "PostgreSQL schemas with row-level security (RLS) and automatic migrations",
      "Strict type-safe scaffolding around every probabilistic LLM call to prevent hallucinations",
    ],
  },
  {
    id: "04",
    title: "Quality Assurance & Production Hardening",
    items: [
      "Cross-browser and responsive regression pass across mobile, tablet, and ultra-wide screens",
      "Form submission, authentication, webhook, and email delivery smoke test suites",
      "Performance budget enforcement (sub-2s LCP, sub-100ms INP, zero CLS)",
      "Security hardening: secret sanitization, CORS restrictions, and input validation",
    ],
  },
  {
    id: "05",
    title: "Deployment, Handoff & Observability",
    items: [
      "Production deployment with zero-downtime canary rollback posture",
      "Real-time health monitoring, error telemetry, and automated backup routines",
      "Comprehensive client handoff documentation and administrative ownership transfer",
      "Post-launch warranty window and direct engineering escalation desk",
    ],
  },
];

const PILLARS = [
  {
    icon: Code2,
    title: "Full-Stack Engineering",
    body: "Next.js · React · TypeScript · FastAPI · PostgreSQL",
    color: "text-[var(--lit-blue,#1565C0)] bg-[#E7F3FF] border-[#B9DCFF]",
  },
  {
    icon: Bot,
    title: "Autonomous AI Workflows",
    body: "LLM orchestration · Vector RAG pipelines · MCP agent tools",
    color: "text-[#6E44FF] bg-[#F1ECFF] border-[#D7C9FF]",
  },
  {
    icon: Workflow,
    title: "Robotic Automation",
    body: "Playwright headless automation executing at computational speed",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    icon: Shield,
    title: "Transparent Pricing",
    body: "Published rates with working interactive prototypes before payment",
    color: "text-[var(--lit-teal,#1FA9A2)] bg-[#E0F7F6] border-[#A7ECE8]",
  },
  {
    icon: Sparkles,
    title: "Engineering-First Culture",
    body: "Principal architects write production code directly on every project",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    icon: Layers,
    title: "Deterministic AI",
    body: "Strict schema constraints and type validation around all generative nodes",
    color: "text-[var(--lit-blue,#1565C0)] bg-[#E7F3FF] border-[#B9DCFF]",
  },
];

export default function ChecklistLeadMagnet() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        signal: AbortSignal.timeout(25000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "lead_magnet" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.message || "Could not process checklist request. Please try again."
        );
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] text-xs font-mono font-medium tracking-wider uppercase mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            Production Engineering Protocol
          </div>
          <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight mb-4">
            Website & App{" "}
            <span className="text-[var(--lit-blue,#1565C0)]">
              Development Checklist
            </span>
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[var(--lit-teal,#1FA9A2)] mb-3">
            Five comprehensive phases and 30+ production gates ensuring zero architectural technical debt.
          </p>
          <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto">
            From strategic discovery to zero-downtime canary deployment — our battle-tested engineering protocol for high-performance enterprise applications.
          </p>
        </div>

        {/* 6 Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${p.color}`}
              >
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="font-poppins text-sm font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">
                {p.title}
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-sans">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {[
            { k: "5 Phases", v: "End-to-End Quality Gates" },
            { k: "30+ Checkpoints", v: "Architecture Verification Rules" },
            { k: "Zero Debt", v: "Type-Safe Strict Scaffolding" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 text-center shadow-xs"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--lit-blue,#1565C0)] font-mono mb-1">
                {s.k}
              </div>
              <div className="text-xs text-[var(--lit-navy,#0B2545)] uppercase font-mono tracking-wider font-semibold">
                {s.v}
              </div>
            </div>
          ))}
        </div>

        {/* 5 Phases Detailed */}
        <div className="space-y-6 mb-16">
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
                <span className="text-[var(--lit-blue,#1565C0)] font-mono font-bold text-xs tracking-wider uppercase px-3 py-1 rounded-lg bg-[#E7F3FF] border border-[#B9DCFF]">
                  Phase {phase.id}
                </span>
                <h2 className="font-poppins text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                  {phase.title}
                </h2>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)] font-medium leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lead Magnet Box */}
        <div className="rounded-3xl border border-[#B9DCFF] bg-gradient-to-br from-[#E7F3FF] via-white to-[#F1ECFF] p-8 sm:p-12 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--lit-blue,#1565C0)] uppercase tracking-wider font-semibold mb-3">
                <Download className="w-4 h-4" />
                <span>Executive Framework Dispatch</span>
              </div>
              <h2 className="font-poppins text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-3">
                Get the Full Production QA Framework
              </h2>
              <p className="font-serif italic text-sm text-[var(--lit-teal,#1FA9A2)] mb-3">
                Complete engineering protocol delivered to your inbox.
              </p>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                A granular, production-ready specification of every architectural phase, automated test gate, and deployment checklist for engineering leaders and CTOs.
              </p>
            </div>
            <div>
              {sent ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-900 shadow-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                    Checklist Dispatched Successfully
                  </p>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                    Please check your email inbox for the complete engineering quality framework PDF.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">
                      Corporate Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@organization.com"
                      className="w-full rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] px-4 py-3 text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:ring-2 focus:ring-[#1565C0]/15 transition-all shadow-2xs"
                    />
                  </div>
                  {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Sending…"
                    ) : (
                      <>
                        <span>Email Me the Complete Checklist</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                    Zero spam. Direct dispatch to your verified corporate email.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <CTASection
        title="Ready to Apply This Production Standard to Your Stack?"
        subtitle="Schedule an architecture session with our engineering directors to benchmark your current deployment against our 30+ quality gates."
        primaryCta={{
          label: "Book Strategy Session",
          href: "/book-consultation",
        }}
        secondaryCta={{
          label: "Take Discovery Questionnaire",
          href: "/discovery",
        }}
      />
    </main>
  );
}
