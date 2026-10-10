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
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import KnowledgeBaseGlossary, { GlossaryTerm } from "./components/KnowledgeBaseGlossary";

export const metadata: Metadata = {
  title: "AI & Engineering Knowledge Hub | Logic Intelligence Technologies",
  description:
    "Centralized technical knowledge base for enterprise AI concepts, latency optimization, architecture blueprints, security standards, and engineering glossaries.",
  alternates: {
    canonical: "/knowledge-base",
  },
  openGraph: {
    title: "AI Engineering Knowledge Hub | Logic Intelligence Technologies",
    description:
      "Architectural deep-dives, latency optimization protocols, security standards, and comprehensive glossaries for engineering enterprise AI.",
    images: [
      {
        url: "/api/og?title=AI+Knowledge+Hub&category=Architecture+Reference",
        width: 1200,
        height: 630,
        alt: "LIT AI Knowledge Hub",
      },
    ],
  },
};

const HUB_ARTICLES = [
  {
    title: "Healthcare Platform Architecture",
    desc: "Deployment blueprint for multi-tenant clinical intelligence, FHIR-compliant record bridges, and modular hospital workflows.",
    icon: Shield,
    href: "/healthcare",
    tag: "Clinical Systems",
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    title: "Understanding LLM Inference Latency",
    desc: "System engineering patterns for achieving sub-200ms time-to-first-token on distributed GPU edge clusters.",
    icon: Zap,
    href: "/architecture",
    tag: "Performance",
    accent: "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]",
  },
  {
    title: "Zero-Persistence Audio Topology",
    desc: "Volatile memory pipeline mechanics that process real-time voice streams with zero persistent disk footprints.",
    icon: Brain,
    href: "/security",
    tag: "Security",
    accent: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]",
  },
  {
    title: "Enterprise Agentic Automation",
    desc: "Autonomous multi-agent workflows with deterministic human-in-the-loop approvals and automated rollback safety nets.",
    icon: Layers,
    href: "/products/ai-website-agents",
    tag: "Agents",
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
  {
    title: "Real-Time Speech Synthesis & WebRTC",
    desc: "Acoustic modeling, turn-taking latency reduction, and full-duplex conversational audio protocols for browser streams.",
    icon: Cpu,
    href: "/products/logic-voice",
    tag: "Voice AI",
    accent: "bg-[#E0F7FA] text-[#00838F] border-[#B2EBF2]",
  },
  {
    title: "REST & WebSocket API Standards",
    desc: "Authentication protocols, webhook integration patterns, and typed client SDK implementation examples.",
    icon: Terminal,
    href: "/docs/api",
    tag: "API Reference",
    accent: "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]",
  },
];

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Acoustic Verification",
    category: "Voice AI",
    definition:
      "Algorithms that analyze spectral voice characteristics in volatile memory to detect anomalies or synthetic audio generation before processing user requests.",
    keyTakeaway: "Volatile RAM analysis < 40ms",
  },
  {
    term: "Inference Latency (TTFT)",
    category: "Performance",
    definition:
      "Time to First Token: the elapsed duration between receiving user speech or text input and streaming the initial synthesized response across edge CDNs.",
    keyTakeaway: "Target: Sub-200ms edge streaming",
  },
  {
    term: "Retrieval-Augmented Generation (RAG)",
    category: "Architecture",
    definition:
      "Architectural pattern where foundation models query private enterprise vector databases to ground responses in verified, auditable organizational knowledge.",
    keyTakeaway: "Zero hallucination deterministic retrieval",
  },
  {
    term: "Deterministic Safety Gates",
    category: "Security",
    definition:
      "Rule-based and semantic validation filters that intercept raw LLM outputs to guarantee schema conformance, redact PII, and prevent hallucinations.",
    keyTakeaway: "Enforced prior to client dispatch",
  },
  {
    term: "Row-Level Security (RLS)",
    category: "Security",
    definition:
      "Database-level access control enforcing isolated tenancy, ensuring no tenant query can inspect or mutate another organization's records.",
    keyTakeaway: "Cryptographic tenant isolation",
  },
  {
    term: "Zero-Persistence Processing",
    category: "Security",
    definition:
      "Execution model where real-time payloads exist exclusively in temporary RAM buffers and are immediately discarded upon connection termination.",
    keyTakeaway: "DPDP & HIPAA compliant ephemeral state",
  },
  {
    term: "Multi-Tenant Data Isolation",
    category: "Architecture",
    definition:
      "Logical and physical partitioning separating tenant compute, cache tiers, and database instances to prevent noisy neighbor crosstalk.",
    keyTakeaway: "Dedicated schema partitioning",
  },
  {
    term: "Synthetic Benchmark Guardrails",
    category: "Performance",
    definition:
      "Automated regression test suites verifying model response consistency, factual accuracy, and latency variance across updates.",
    keyTakeaway: "Continuous CI/CD model verification",
  },
  {
    term: "WebRTC Voice Pipeline",
    category: "Voice AI",
    definition:
      "Full-duplex bidirectional audio streaming protocol enabling real-time human-agent turn taking without noticeable delay or clipping.",
    keyTakeaway: "Opus audio codec at 48kHz",
  },
  {
    term: "Vector Quantization",
    category: "Architecture",
    definition:
      "Lossy compression techniques applied to high-dimensional embedding vectors reducing memory footprint while retaining semantic recall fidelity.",
    keyTakeaway: "4x memory reduction with 99% recall",
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

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Home" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technical Documentation &amp; Knowledge Hub</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Enterprise AI &amp; Software Knowledge Hub
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-[var(--lit-teal,#1FA9A2)] max-w-2xl mx-auto">
              Architectural deep-dives, latency optimization protocols, security standards, and engineering glossaries.
            </p>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              Clear engineering specifications and foundational concepts for teams building, integrating, and operating mission-critical AI systems.
            </p>

            {/* Interactive Search Bar */}
            <form action="/search" method="get" className="pt-4 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[var(--lit-blue,#1565C0)] absolute left-4 pointer-events-none" />
                <input
                  name="q"
                  placeholder="Search technical guides, latency, APIs..."
                  className="w-full rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white pl-12 pr-28 py-3.5 text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:border-[var(--lit-blue,#1565C0)] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/10 shadow-sm transition-all"
                  aria-label="Search knowledge base"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
                >
                  Search Hub
                </button>
              </div>
            </form>
          </div>

          {/* Categories & Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
            {HUB_ARTICLES.map((article, idx) => {
              const IconComp = article.icon;
              return (
                <Link
                  key={idx}
                  href={article.href}
                  className="p-7 sm:p-8 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm hover:border-[#1565C0]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] group-hover:scale-105 transition-transform shadow-sm">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-full border shadow-sm font-semibold uppercase tracking-wider ${article.accent}`}
                      >
                        {article.tag}
                      </span>
                    </div>

                    <h2 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-blue,#1565C0)] transition-colors mb-2.5 leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light mb-6">
                      {article.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs font-semibold text-[var(--lit-blue,#1565C0)] group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Technical Specs</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Enterprise AI Glossary Section */}
          <div className="mb-20">
            <KnowledgeBaseGlossary terms={GLOSSARY_TERMS} />
          </div>

          {/* Canonical Enterprise CTA */}
          <CTASection
            title="Need Direct Architectural Guidance for Your System?"
            subtitle="Our principal engineers conduct technical evaluations on latency reduction, model orchestration, and zero-persistence architectures."
            primaryCta={{
              label: "Book Architecture Review",
              href: "/book-consultation",
            }}
            secondaryCta={{
              label: "Explore API Docs",
              href: "/docs/api",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
