import React from "react";
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  Zap, 
  Shield, 
  Brain, 
  Layers, 
  Cpu, 
  Terminal,
  ExternalLink 
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "AI Knowledge Hub | Logic Intelligence Technologies",
  description: "Centralized technical resource hub for understanding enterprise AI concepts, latency optimization, architecture blueprints, and product guides.",
};

const HUB_ARTICLES = [
  {
    title: "Healthcare Platform Architecture",
    desc: "Deployment blueprint for multi-tenant clinical intelligence, FHIR-compliant record bridges, and modular hospital workflows.",
    icon: Shield,
    href: "/healthcare",
    tag: "Clinical Systems",
  },
  {
    title: "Understanding LLM Inference Latency",
    desc: "System engineering patterns for achieving sub-200ms time-to-first-token on distributed GPU edge clusters.",
    icon: Zap,
    href: "/architecture",
    tag: "Performance",
  },
  {
    title: "Zero-Persistence Audio Topology",
    desc: "Volatile memory pipeline mechanics that process real-time voice streams with zero disk footprints.",
    icon: Brain,
    href: "/security",
    tag: "Security",
  },
  {
    title: "Enterprise Agentic Automation",
    desc: "Autonomous multi-agent workflows with deterministic human-in-the-loop approvals and rollback safety nets.",
    icon: Layers,
    href: "/products/ai-website-agents",
    tag: "Agents",
  },
  {
    title: "Real-Time Speech Synthesis & WebRTC",
    desc: "Acoustic modeling, turn-taking latency reduction, and full-duplex conversational audio protocols.",
    icon: Cpu,
    href: "/products/logic-voice",
    tag: "Voice AI",
  },
  {
    title: "REST & WebSocket API Standards",
    desc: "Authentication protocols, webhook integration patterns, and typed client SDK implementation examples.",
    icon: Terminal,
    href: "/docs/api",
    tag: "API Reference",
  },
];

const GLOSSARY = [
  {
    term: "Acoustic Verification",
    definition: "Algorithms that analyze spectral voice characteristics in volatile memory to detect anomalies or synthetic audio generation before processing requests.",
  },
  {
    term: "Inference Latency (TTFT)",
    definition: "Time to First Token: the elapsed duration between receiving user speech or text input and streaming the initial synthesized response. Our edge pipeline targets < 200ms.",
  },
  {
    term: "Retrieval-Augmented Generation (RAG)",
    definition: "Architectural pattern where foundation models query private enterprise vector databases to ground responses in verified, auditable organizational facts.",
  },
  {
    term: "Deterministic Safety Gates",
    definition: "Rule-based and semantic validation filters that intercept raw LLM outputs to guarantee schema conformance, redact PII, and prevent hallucinations.",
  },
  {
    term: "Row-Level Security (RLS)",
    definition: "Database-level access control enforcing isolated tenancy, ensuring no tenant query can inspect or mutate another organization's records.",
  },
  {
    term: "Zero-Persistence Processing",
    definition: "Execution model where real-time payloads exist exclusively in temporary RAM buffers and are immediately discarded upon connection termination.",
  },
];

export default function KnowledgeBasePage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Knowledge Hub", path: "/knowledge-base" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Hero Section */}
        <div className="mt-8 mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <BookOpen className="w-3.5 h-3.5" />
            Technical Documentation & Knowledge Hub
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            AI Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">Knowledge Hub</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Architectural deep-dives, latency optimization protocols, security standards, and comprehensive glossaries for engineering enterprise AI.
          </p>

          {/* Interactive Search Bar */}
          <form action="/search" method="get" className="mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-cyan-400 absolute left-4 pointer-events-none" />
              <input
                name="q"
                placeholder="Search technical guides, latency, APIs..."
                className="w-full rounded-2xl border border-white/10 bg-[#10131A] pl-12 pr-28 py-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#151922] focus:outline-none focus:ring-1 focus:ring-cyan-400/50 shadow-2xl transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(69,217,210,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Categories & Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {HUB_ARTICLES.map((article, idx) => (
            <Link
              key={idx}
              href={article.href}
              className="p-8 rounded-2xl border border-white/10 bg-[#151922] shadow-xl hover:border-cyan-500/40 hover:bg-[#181d28] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(69,217,210,0.2)]">
                    <article.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider">
                    {article.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white uppercase font-heading tracking-wide mb-2 group-hover:text-cyan-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                  {article.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Explore Technical Specs</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Enterprise AI Glossary Section */}
        <div className="mb-24 rounded-3xl border border-white/10 bg-[#10131A] p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
              Lexicon & Definitions
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-heading">
              Enterprise AI Terminology
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Standardized vocabulary and foundational concepts underlying modern production AI deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GLOSSARY.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/5 bg-[#151922] flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    {item.term}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {item.definition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#10131A] via-[#151922] to-[#10131A] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase font-heading">
              Need Direct Architectural Assistance?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our engineering team conducts technical consultations on latency reduction, model orchestration, and HIPAA/GDPR zero-persistence setups.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/book-consultation"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(69,217,210,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Book Technical Consultation
            </Link>
            <Link
              href="/support/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-cyan-500/40 font-mono font-bold text-xs uppercase tracking-wider transition-all"
            >
              Open Support Ticket
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
