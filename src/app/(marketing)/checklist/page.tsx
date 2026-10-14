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
    title: "Phase 1: Architecture & Scope Validation",
    items: [
      "01. Architecture & Requirements Baseline — Documented system architecture covering frontend, backend, databases, auth, and external APIs with traceability matrix",
      "02. GitHub Repository & Branch Protection — Main branch protection, required status checks, CODEOWNERS, and clean PR review workflows",
      "03. Environment Separation (Dev / Staging / Prod) — Isolated environments with environment-scoped secrets and distinct data stores",
      "04. Cloud Infrastructure & Account Provisioning — Cloud platform provisioning (Vercel, Render, Supabase) with billing limits and resource mappings",
      "05. Technical Risk & Dependency Assessment — Register of external-service dependencies, operational risks, data sensitivity, and failure mitigations",
    ],
  },
  {
    id: "02",
    title: "Phase 2: Frontend Engineering & UX",
    items: [
      "06. Next.js & React Production Architecture — Strict server/client boundary segregation, route error boundaries, metadata, and zero-defect builds",
      "07. TypeScript & Component Architecture — Strict TypeScript with zero-any policy, reusable typed components, and boundary validation",
      "08. Tailwind Design Tokens & Brand Consistency — Centralized design tokens for typography, spacing, accessible contrast, and visual states",
      "09. Responsive & Cross-Browser Compatibility — Verified across modern mobile, tablet, and desktop viewports and major browser engines",
      "10. Core Web Vitals & Frontend Performance — Sub-1.8s LCP, sub-100ms INP, zero CLS, image optimization, and bundle budgets under 120KB",
      "11. Accessibility & Inclusive Interaction — WCAG 2.2 AA compliance, keyboard navigation, screen-reader semantics, and focus management",
      "12. Forms, API Wiring & User Feedback — Input validation, authorized submission, idempotency guards, and truthful user feedback",
    ],
  },
  {
    id: "03",
    title: "Phase 3: Backend & Database Integrity",
    items: [
      "13. FastAPI Service Architecture & API Contracts — Typed request/response schemas, standardized status codes, and OpenAPI specifications",
      "14. PostgreSQL Schema Design & Referential Integrity — Typed identifiers, primary/foreign keys, normalized tables, and versioned migrations",
      "15. Supabase Row-Level Security & Tenant Isolation — Strict RLS policies on every exposed table enforcing least privilege and tenant separation",
      "16. Connection Pooling & Resource Management — Connection pooling, connection lifecycle management, and transaction timeouts for serverless scale",
      "17. Idempotent Operations & Duplicate Prevention — Idempotency keys, unique constraints, and transactional deduplication on critical mutations",
      "18. Transaction Integrity, Backup & Recovery — ACID transaction boundaries, scheduled backups, and tested restoration procedures",
      "19. Server-Side Validation & Auditability — Authoritative server-side validation and immutable audit events for privileged operations",
    ],
  },
  {
    id: "04",
    title: "Phase 4: AI & Data Pipeline Integration",
    items: [
      "20. AI Provider Selection & Credential Management — Model provider selection, credential isolation, regional requirements, and fallback handling",
      "21. Knowledge Ingestion & Data Provenance — Document validation, source metadata, content checksums, duplicate detection, and deletion workflows",
      "22. pgvector Semantic Search & Index Validation — Embedding generation validation, vector dimensions, index tuning, and recall benchmarking",
      "23. Retrieval-Augmented Generation Architecture — Semantic chunking, retrieval ranking, permission filtering, and citation integrity",
      "24. Prompt Injection & Tool-Use Protection — Trusted vs untrusted prompt separation, adversarial injection guards, and human-in-the-loop approval gates",
      "25. AI Response Quality & Factual Verification — Evaluation datasets for factual accuracy, completeness, hallucination resistance, and source citations",
      "26. AI Latency, Streaming & Resource Optimization — Time-to-first-token tracking, streaming response delivery, context window budgeting, and caching",
      "27. AI Privacy, Memory & Retention Controls — Per-user isolation, conversation history retention policies, and zero-retention compliance verification",
    ],
  },
  {
    id: "05",
    title: "Phase 5: Telephony & Real-Time WebSockets",
    items: [
      "28. Audio Capture, Sampling & Encoding Validation — Microphone capture, 16 kHz mono PCM sampling rate conversion, frame sizing, and audio validation",
      "29. Non-Blocking Real-Time Audio Pipeline — Non-blocking I/O, bounded async queues, backpressure handling, and latency-optimized loops",
      "30. WebSocket Session Lifecycle & Reliability — Authenticated session handshakes, heartbeat ping/pong, reconnect handling, and graceful teardown",
      "31. STT → LLM → TTS Orchestration — Streaming transcription, LLM processing, speech synthesis, interruptibility, and error recovery",
      "32. End-to-End Voice Latency & Quality — Real-time turnaround benchmarking, transcription accuracy, jitter mitigation, and acoustic clarity",
    ],
  },
  {
    id: "06",
    title: "Phase 6: Security & Compliance",
    items: [
      "33. Authentication, Authorization & MFA — Secure login, role-based access control, session rotation, and server-side boundary enforcement",
      "34. API Rate Limiting & Abuse Protection — Granular rate-limiting per IP/token, request size boundaries, and DDoS/brute-force mitigation",
      "35. Secrets Management & Credential Rotation — Secrets held in approved environment vaults with automated secret scanning and zero leaks",
      "36. TLS, DNS, Security Headers & Transport Protection — HTTPS enforcement, HSTS, Content Security Policy, X-Frame-Options, and secure cookies",
      "37. Sensitive Data Protection & Encryption — End-to-end encryption in transit and at rest, access-controlled storage, and data minimization",
      "38. Vulnerability & Compliance Review — Dependency vulnerability scanning, SAST checks, and privacy impact assessments (DPDP / GDPR / SOC 2)",
    ],
  },
  {
    id: "07",
    title: "Phase 7: QA, Testing & Telemetry",
    items: [
      "39. Automated Unit & Integration Testing — Comprehensive unit tests, mocked external dependencies, and component test coverage",
      "40. End-to-End User Journey Verification — Staging smoke tests validating auth, forms, account activation, and transactional workflows",
      "41. Error Boundaries & Failure Recovery — Frontend error boundaries, backend exception handling, circuit breakers, and truthful failure states",
      "42. Observability, Logging & Error Monitoring — Structured logs with correlation IDs, real-time error telemetry (Sentry), and incident alert routing",
      "43. Performance, Load & Scalability Testing — Representative concurrency testing, throughput measurement, and latency under stress",
      "44. Security Regression & Production-Readiness Testing — Access control regression tests, abuse prevention tests, and release gating criteria",
    ],
  },
  {
    id: "08",
    title: "Phase 8: DevOps, CI/CD & Handoff",
    items: [
      "45. GitHub Actions CI/CD Pipeline Validation — Automated linting, type checking, security checks, and build validation gating deployment",
      "46. Vercel Frontend Production Deployment — Production domain verification, environment variable sync, and post-deployment smoke validation",
      "47. Render Backend Production Deployment — Service configuration, health check endpoints, background worker monitoring, and zero-downtime boots",
      "48. DNS, Domains, CDN & Search Visibility — DNS records, canonical HTTPS redirects, sitemap.xml, robots.txt, and search engine console verification",
      "49. Rollback & Operational Monitoring — Documented release identifiers, one-click rollback procedures, and post-launch telemetry dashboards",
      "50. IP, Documentation & Client Handover — Complete source repository transfer, OpenAPI documentation, architecture specs, and 30-day warranty support",
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
            The 50-Point Enterprise{" "}
            <span className="text-[var(--lit-blue,#1565C0)]">
              Deployment Checklist
            </span>
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[var(--lit-teal,#1FA9A2)] mb-3">
            Eight comprehensive phases and 50 production quality gates ensuring zero architectural technical debt.
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
            { k: "8 Phases", v: "End-to-End Quality Gates" },
            { k: "50 Checkpoints", v: "Architecture Verification Rules" },
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

        {/* 8 Phases Detailed */}
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
                Get the 50-Point Enterprise SOP Framework
              </h2>
              <p className="font-serif italic text-sm text-[var(--lit-teal,#1FA9A2)] mb-3">
                Official 21-page engineering protocol delivered directly to your inbox.
              </p>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                A granular, production-ready specification across 8 architectural phases, 50 automated test gates, and deployment checkpoints for engineering leaders and CTOs.
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
                    Please check your email inbox for the complete 50-point engineering quality framework PDF.
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
                        <span>Email Me the 50-Point Checklist PDF</span>
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
        subtitle="Schedule an architecture session with our engineering directors to benchmark your current deployment against our 50 quality gates across 8 phases."
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
