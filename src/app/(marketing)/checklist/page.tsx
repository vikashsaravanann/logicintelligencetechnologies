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
} from "lucide-react";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { GlassSurface } from "@/components/ui/glass-surface";

const PHASES = [
  {
    id: "01",
    title: "Strategic Discovery & Requirement Engineering",
    items: [
      "Define the north-star business objective before any design begins",
      "Audience persona mapping — at least three realistic use-case personas",
      "Competitor UX teardown (features, Lighthouse, journey friction)",
      "Brand & aesthetic guidelines locked (navy, cyan, typography, SVG logo)",
    ],
  },
  {
    id: "02",
    title: "Information Architecture & Experience Design",
    items: [
      "Sitemap and user-flow diagrams for primary conversion paths",
      "Wireframes for mobile-first critical screens",
      "High-fidelity UI with production design tokens",
      "Accessibility baseline (WCAG-oriented contrast, focus, labels)",
    ],
  },
  {
    id: "03",
    title: "Full-Stack Engineering & Deterministic AI",
    items: [
      "Next.js · React · TypeScript frontend with typed contracts",
      "FastAPI / Node backend with parameterized data access",
      "PostgreSQL schema, migrations, and RLS where applicable",
      "Strict scaffolding around every probabilistic LLM call",
    ],
  },
  {
    id: "04",
    title: "Quality Assurance & Hardening",
    items: [
      "Cross-browser and responsive regression pass",
      "Form submission, email, and auth path smoke tests",
      "Performance budget (Core Web Vitals oriented)",
      "Security checklist: secrets, CORS, auth, input validation",
    ],
  },
  {
    id: "05",
    title: "Deployment, Handoff & Observation",
    items: [
      "Production deploy (Vercel / container) with environment parity",
      "Monitoring, error reporting, and backup posture",
      "Client handoff docs and admin access",
      "Post-launch support window defined in writing",
    ],
  },
];

const PILLARS = [
  { icon: Code2, title: "Full-Stack Engineering", body: "Next.js · React · TypeScript · FastAPI · PostgreSQL" },
  { icon: Bot, title: "Autonomous AI Workflows", body: "LLM orchestration · RAG pipelines · MCP systems" },
  { icon: Workflow, title: "Robotic Process Automation", body: "Playwright headless bots at computational speed" },
  { icon: Shield, title: "Transparent Pricing", body: "Published rates. Free working prototype before payment commitment." },
  { icon: Sparkles, title: "Engineering-First Culture", body: "The founder writes production code personally on every client project." },
  { icon: Layers, title: "Deterministic AI", body: "Strictly typed scaffolding enforced around every probabilistic LLM call." },
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
        throw new Error(data?.message || "Could not send the checklist. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24">
      <BackToHome />
      <section className="relative py-16 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/jobs/studio-hero.jpg" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              Official Document · Production QA Framework
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
            >
              Website & App{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Development Checklist
              </span>
            </motion.h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
              Five phases from discovery to deployment — 30+ production quality gates. Zero technical debt by design.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {PILLARS.map((p) => (
              <GlassSurface key={p.title} variant="card" className="p-5">
                <p.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">{p.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.body}</p>
              </GlassSurface>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-14">
            {[
              { k: "5 Phases", v: "End-to-end QA" },
              { k: "30+", v: "Checklist items" },
              { k: "Zero", v: "Technical debt target" },
            ].map((s) => (
              <GlassSurface key={s.k} variant="strong" className="p-5 text-center">
                <div className="text-2xl md:text-3xl font-black text-primary">{s.k}</div>
                <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">{s.v}</div>
              </GlassSurface>
            ))}
          </div>

          <div className="space-y-5 mb-14">
            {PHASES.map((phase) => (
              <GlassSurface key={phase.id} variant="surface" className="p-6 md:p-7">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-primary font-black text-sm tracking-widest">PHASE {phase.id}</span>
                  <h2 className="text-lg md:text-xl font-bold text-white">{phase.title}</h2>
                </div>
                <ul className="space-y-2.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassSurface>
            ))}
          </div>

          <GlassSurface variant="strong" className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Get the full PDF checklist</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Production-grade quality assurance framework — five phases, mapped gates, written for founders who refuse rework.
                </p>
                <a
                  href="/resources/website-development-checklist.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF directly
                </a>
              </div>
              <div>
                {sent ? (
                  <div className="rounded-xl border border-accent/30 bg-accent/10 p-5 text-sm text-accent">
                    Checklist sent. Check your inbox (and spam) for the production QA framework.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-[#0A0D1A] hover:brightness-110 disabled:opacity-60 transition"
                    >
                      {isSubmitting ? "Sending…" : "Email me the checklist"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </GlassSurface>

          <p className="text-center text-xs text-zinc-500 mt-10 tracking-wide">
            Logic Intelligence Technologies · Vikash Saravanan · Coimbatore · logicintelligencetechnologies.in
          </p>
        </div>
      </section>
    </main>
  );
}
