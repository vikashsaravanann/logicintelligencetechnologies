"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import PageShell from "@/components/layout/page-shell";

const PHASES = [
  {
    id: "01",
    title: "Strategic Discovery & Requirement Engineering",
    items: [
      "Define the north-star business objective before code or interface design begins",
      "Audience persona mapping — at least three realistic operational use cases",
      "Competitor UX teardown (features, Core Web Vitals, user-journey friction)",
      "Brand & aesthetic tokens locked (dark luxury surfaces, cyan/teal accents, fluid type)",
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
  { icon: Code2, title: "Full-Stack Engineering", body: "Next.js · React · TypeScript · FastAPI · PostgreSQL" },
  { icon: Bot, title: "Autonomous AI Workflows", body: "LLM orchestration · Vector RAG pipelines · MCP agent tools" },
  { icon: Workflow, title: "Robotic Automation", body: "Playwright headless automation executing at computational speed" },
  { icon: Shield, title: "Transparent Pricing", body: "Published rates with working interactive prototypes before payment" },
  { icon: Sparkles, title: "Engineering-First Culture", body: "Principal architects write production code directly on every project" },
  { icon: Layers, title: "Deterministic AI", body: "Strict schema constraints and type validation around all generative nodes" },
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
        throw new Error(data?.message || "Could not process checklist request. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Production Engineering Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase mb-6 leading-tight">
            Website & App <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              Development Checklist
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-light">
            Five comprehensive phases from strategic discovery to continuous deployment — 30+ production quality gates ensuring zero architectural technical debt.
          </p>
        </div>

        {/* 6 Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-white/10 bg-[#10131A] p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{p.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { k: "5 Phases", v: "End-to-End Quality Gates" },
            { k: "30+ Checkpoints", v: "Architecture Verification Rules" },
            { k: "Zero Debt", v: "Type-Safe Strict Scaffolding" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-white/10 bg-[#10131A] p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono mb-1">{s.k}</div>
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-wider">{s.v}</div>
            </div>
          ))}
        </div>

        {/* 5 Phases Detailed */}
        <div className="space-y-6 mb-16">
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-cyan-400 font-mono font-bold text-xs tracking-widest uppercase px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                  Phase {phase.id}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-tight">
                  {phase.title}
                </h2>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#07090D] border border-white/5 text-xs text-zinc-300 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lead Magnet Box */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-[#10131A] to-blue-500/10 p-8 sm:p-12 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
                <Download className="w-4 h-4" />
                <span>Executive Framework Download</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mb-3">
                Get the Full Production QA Framework
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">
                A granular, production-ready specification of every architectural phase, automated test gate, and deployment checklist for engineering leaders.
              </p>
            </div>
            <div>
              {sent ? (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-center text-sm text-cyan-300">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                  <p className="font-bold text-white mb-1">Checklist Dispatched</p>
                  <p className="text-xs text-zinc-400">
                    Check your email inbox (and spam folder) for the complete engineering quality framework.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@vance.io"
                    className="w-full rounded-xl bg-[#07090D] border border-white/15 px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#07090D] transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)] disabled:opacity-50"
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
                  <p className="text-center text-xs text-zinc-500 font-mono">
                    Zero spam. Direct PDF dispatch to your verified corporate email.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
