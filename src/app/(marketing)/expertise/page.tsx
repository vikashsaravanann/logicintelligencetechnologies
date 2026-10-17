import { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/navigation/back-button";
import FloatingElements from "@/components/motion/floating-elements";
import { FOUNDER } from "@/config/founder";
import CTASection from "@/components/ui/cta-section";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import {
  Code2,
  Database,
  Layout,
  Cloud,
  Bot,
  Network,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Technical Expertise | Logic Intelligence Technologies",
  description:
    "Explore the core technical competencies, engineering capabilities, and architectural expertise at Logic Intelligence Technologies.",
  openGraph: {
    title: "Technical Expertise — Logic Intelligence Technologies",
    description:
      "A comprehensive overview of our engineering capabilities spanning AI orchestration, full-stack web development, and cloud architecture.",
    images: [
      {
        url: "/api/og?title=Technical%20Expertise&category=Logic%20Intelligence%20Technologies",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies Technical Expertise",
      },
    ],
  },
};

interface ExpertiseDomain {
  title: string;
  items: readonly string[];
  icon: typeof Bot;
  iconBg: string;
  accentBorder: string;
  tagline: string;
  description: string;
}

const EXPERTISE_DOMAINS: ExpertiseDomain[] = [
  {
    title: "Automation & AI Systems",
    items: FOUNDER.expertise.automationAndAi,
    icon: Bot,
    iconBg: "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]",
    accentBorder: "hover:border-[#0284C7]/40",
    tagline: "Autonomous Agent Orchestration",
    description:
      "Designing deterministic AI architectures, headless browser automation, real-time voice intelligence, and agentic tool-use pipelines.",
  },
  {
    title: "Backend & API Engineering",
    items: FOUNDER.expertise.backendAndApiEngineering,
    icon: Database,
    iconBg: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
    accentBorder: "hover:border-[#1565C0]/40",
    tagline: "High-Throughput Services",
    description:
      "Architecting structured, high-throughput backends, transactional PostgreSQL schemas, and low-latency asynchronous data processing pipelines.",
  },
  {
    title: "Frontend Engineering",
    items: FOUNDER.expertise.frontendEngineering,
    icon: Layout,
    iconBg: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    accentBorder: "hover:border-[#059669]/40",
    tagline: "Sub-Second Reactive UIs",
    description:
      "Engineering fluid, sub-second web interfaces with Next.js App Router, React 19, TypeScript, and accessible Tailwind CSS design systems.",
  },
  {
    title: "Core Programming",
    items: FOUNDER.expertise.programmingLanguages,
    icon: Code2,
    iconBg: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
    accentBorder: "hover:border-[#7C3AED]/40",
    tagline: "Deterministic Computation",
    description:
      "Foundational statically typed and systems languages utilized across the entire stack for deterministic, verifiable execution.",
  },
  {
    title: "Cloud & Infrastructure",
    items: FOUNDER.expertise.databaseAndCloudInfrastructure,
    icon: Cloud,
    iconBg: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
    accentBorder: "hover:border-[#B45309]/40",
    tagline: "Continuous Delivery & Scale",
    description:
      "Production CI/CD deployment pipelines, automated migration workflows, and zero-downtime cloud hosting architectures.",
  },
  {
    title: "Network & Systems Topology",
    items: FOUNDER.expertise.networkAndSystems,
    icon: Network,
    iconBg: "bg-[#FCEAF3] text-[#BE185D] border-[#FBCFE8]",
    accentBorder: "hover:border-[#BE185D]/40",
    tagline: "Hardened Security Boundaries",
    description:
      "Physical routing boundaries, enterprise network configuration, and hardened security topologies for sovereign data workloads.",
  },
];

const ARCHITECTURAL_PILLARS = [
  {
    icon: Lock,
    title: "Type Safety & Schema Integrity",
    description:
      "End-to-end typing from database schemas through API contracts and UI states. Runtime validation with Zod guarantees zero corrupted state.",
  },
  {
    icon: Terminal,
    title: "Deterministic AI Boundaries",
    description:
      "Probabilistic LLMs are strictly bounded by deterministic tool schemas, guardrails, human confirmations, and structured outputs.",
  },
  {
    icon: Layers,
    title: "Auditable & Observable",
    description:
      "Structured telemetry, centralized logging, and immutable audit trails for every critical state mutation and external API invocation.",
  },
];

export default function ExpertisePage() {
  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0]">
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Technical Expertise", path: "/expertise" },
        ])}
      />
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#FAFBFF] to-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto mb-6">
          <BackButton fallbackHref="/about" label="Back to About" inline />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.16em] bg-[#1FA9A2]/10 text-[#0E7A74] border border-[#1FA9A2]/25 mb-4 shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-[#1FA9A2]" />
            <span>Technical Capabilities & Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--lit-navy,#0B2545)] mb-6 leading-[1.12] tracking-tight">
            Engineering{" "}
            <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
              Expertise
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] max-w-3xl mx-auto leading-relaxed">
            Our engineering foundation is purpose-built to deliver production reliability — from low-level network topology and hardened relational databases to autonomous agent orchestration and voice intelligence.
          </p>
        </div>
      </section>

      {/* Facts / Metrics Strip */}
      <section className="py-8 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Core Domains", value: "6 Areas", note: "Full-Stack & Systems" },
            { label: "Execution Standard", value: "Deterministic", note: "Typed Boundaries" },
            { label: "UI Performance", value: "Sub-Second", note: "Next.js App Router" },
            { label: "Infrastructure", value: "Zero Downtime", note: "CI/CD Automated" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-[#DFE7EF] bg-white p-5 sm:p-6 text-center shadow-xs hover:shadow-md hover:border-[#1FA9A2]/40 transition-all duration-200"
            >
              <p className="text-xl sm:text-2xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                {metric.value}
              </p>
              <p className="text-[11px] sm:text-xs font-mono text-[var(--lit-blue,#1565C0)] uppercase tracking-wider mt-1 font-semibold">
                {metric.label}
              </p>
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1 hidden sm:block">
                {metric.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Competency Grid */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-[#1FA9A2] mb-2">
            Production Stack
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--lit-navy,#0B2545)]">
            Verified Architectural Domains
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERTISE_DOMAINS.map((domain) => (
            <div
              key={domain.title}
              className={`group bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs hover:shadow-md ${domain.accentBorder} transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${domain.iconBg}`}
                  >
                    <domain.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider bg-[#F7F9FC] border border-[#DFE7EF] px-2.5 py-1 rounded-md">
                    {domain.tagline}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-display text-[var(--lit-navy,#0B2545)] mb-3 group-hover:text-[var(--lit-blue,#1565C0)] transition-colors">
                  {domain.title}
                </h3>
                <p className="text-[var(--lit-text-muted,#52677C)] text-sm mb-6 leading-relaxed">
                  {domain.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#DFE7EF]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-3">
                  Technologies & Frameworks
                </p>
                <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                  {domain.items.map((item) => (
                    <li
                      key={item}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7F9FC] border border-[#DFE7EF] text-[var(--lit-ink,#121826)] group-hover:border-[#1FA9A2]/40 transition-colors"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Philosophy Banner */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="p-8 sm:p-12 rounded-3xl border border-[#DFE7EF] bg-white shadow-xs relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
              <ShieldCheck className="w-4 h-4 text-[#059669]" /> Production Standard
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Deterministic Software Engineering First
            </h2>
            <p className="text-[var(--lit-text-muted,#52677C)] text-base sm:text-lg leading-relaxed">
              We wrap probabilistic AI models with strictly typed, deterministic execution boundaries. Every system we build guarantees state integrity, observable logging, and zero unchecked hallucinations in business-critical workflows.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {ARCHITECTURAL_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-xl border border-[#DFE7EF] bg-[#F7F9FC] p-4 text-left"
                >
                  <pillar.icon className="w-5 h-5 text-[#1FA9A2] mb-2" />
                  <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 flex flex-wrap gap-4">
              <Link
                href="/about/founder"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#133966] text-white text-sm font-semibold transition-all shadow-xs"
              >
                <span>Meet the Founder</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FloatingElements />
      <CTASection
        title="Put this engineering capability to work"
        subtitle="Book a consultation with our systems architect or review our live production architectures."
        primaryCta={{ label: "Book a consultation", href: "/book-consultation" }}
        secondaryCta={{ label: "Explore services", href: "/services" }}
      />
    </div>
  );
}
