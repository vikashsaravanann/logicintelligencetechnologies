import React from "react";
import {
  Server,
  Activity,
  BrainCircuit,
  ShieldCheck,
  Lock,
  Cpu,
  Network,
  CheckCircle2,
  ArrowRight,
  Layers,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import CTASection from "@/components/ui/cta-section";
import ArchitectureTopologyVisualizer from "./components/ArchitectureTopologyVisualizer";

export const metadata: Metadata = {
  title: "Systems Architecture | Logic Intelligence Technologies",
  description:
    "Explore the enterprise-grade infrastructure, distributed inference engines, and zero-persistence security topology powering Logic Intelligence Technologies platforms.",
  alternates: {
    canonical: "/architecture",
  },
  openGraph: {
    title: "Systems Architecture | Logic Intelligence Technologies",
    description:
      "Enterprise infrastructure blueprints, distributed edge inference topologies, and zero-persistence memory isolation powering real-time enterprise AI.",
    images: [
      {
        url: "/api/og?title=Systems+Architecture&category=Infrastructure+Blueprint",
        width: 1200,
        height: 630,
        alt: "LIT Systems Architecture",
      },
    ],
  },
};

const BENCHMARKS = [
  {
    label: "Edge Audio Ingestion Latency",
    value: "< 25ms",
    note: "Global Anycast median",
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    label: "End-to-End Voice Inference",
    value: "< 280ms",
    note: "Speech-to-Speech pipeline",
    accent: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
  },
  {
    label: "High-Availability SLA Target",
    value: "99.95%",
    note: "Core infrastructure services",
    accent: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]",
  },
  {
    label: "Audio Disk Persistence",
    value: "0 bytes",
    note: "100% volatile memory processing",
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
];

const PIPELINE_NODES = [
  {
    step: "01",
    title: "Edge Ingestion & Telemetry Node",
    subtitle: "Global Anycast WebSocket & gRPC",
    icon: Server,
    desc: "Raw audio streams and structured telemetry payloads are ingested via secure WebSocket and HTTP/3 edge nodes. Multi-region routing keeps round-trip transmission latency under 25ms globally.",
    metrics: "< 25ms Edge Latency",
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    step: "02",
    title: "Stream Parsing & Feature Extraction",
    subtitle: "Deterministic In-Memory Tokenization",
    icon: Activity,
    desc: "Input streams are segmented into micro-frames in volatile RAM. Spectral audio features, semantic tokens, and clinical schema structures are parsed with strict boundary validation before inference dispatch.",
    metrics: "Volatile Memory Only",
    accent: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
  },
  {
    step: "03",
    title: "Hybrid Inference & RAG Synthesis",
    subtitle: "Orchestrated Multi-Model Routing",
    icon: BrainCircuit,
    desc: "Dynamic task dispatchers evaluate token intent against deterministic safety gates, enterprise knowledge bases, and domain-adapted foundation models with verified citation validation.",
    metrics: "Sub-200ms Processing",
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
  {
    step: "04",
    title: "Policy Enforcement & Zero-Trust Delivery",
    subtitle: "Automated Audit Trails & Isolation",
    icon: ShieldCheck,
    desc: "Outputs pass through automated PII redaction filters and policy gates before downstream delivery. All audit logs record cryptographic verification without persisting sensitive customer payload data.",
    metrics: "Zero Disk Persistence",
    accent: "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]",
  },
];

const ARCHITECTURE_SPECIFICATIONS = [
  {
    category: "Compute & Execution",
    icon: Cpu,
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
    points: [
      "Distributed serverless execution topology with regional autoscaling",
      "Ephemeral memory-isolated containers preventing cross-tenant leakage",
      "Dynamic load balancing across geographically diverse inference clusters",
      "Optimized CUDA and TensorRT model compilation pipelines",
    ],
  },
  {
    category: "Network & Resilience",
    icon: Network,
    accent: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
    points: [
      "Edge routing across low-latency global Tier-1 network backbones",
      "Full TLS 1.3 cryptographic cipher enforcement with automated mTLS",
      "Automated failover with active-active redundant cloud availability zones",
      "Resilient retry policies with intelligent exponential backoff",
    ],
  },
  {
    category: "Governance & Privacy",
    icon: Lock,
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
    points: [
      "Zero customer conversation or clinical data used for foundational model training",
      "Encrypted data in transit and managed KMS-backed database volumes at rest",
      "Role-Based Access Control (RBAC) enforced across every microservice API",
      "Strict compliance alignment with DPDP, GDPR, ISO 27001, and SOC2 principles",
    ],
  },
];

export default function ArchitecturePage() {
  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Architecture", path: "/architecture" },
        ])}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* Back Navigation */}
          <div>
            <BackButton fallbackHref="/" label="Home" inline className="mb-6" />
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>Distributed Systems Blueprint • Production Architecture</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Enterprise AI &amp; Cloud Systems Architecture
            </h1>

            <p className="font-serif italic text-base sm:text-lg md:text-xl text-[var(--lit-teal,#1FA9A2)]">
              Deterministic safety gates, sub-40ms real-time voice intelligence, and zero-persistence memory isolation.
            </p>

            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto">
              Engineered for high concurrency, deterministic safety gates, and ultra-low latency across real-time voice intelligence, automated web agents, and clinical platforms.
            </p>
          </div>

          {/* Latency & Reliability Benchmarks Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BENCHMARKS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 sm:p-6 shadow-xs hover:border-[var(--lit-teal,#1FA9A2)]/50 transition-colors"
              >
                <div className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mt-2 font-semibold">
                  {item.label}
                </div>
                <div className="text-[11px] text-[var(--lit-text-muted,#52677C)]/80 mt-1">
                  {item.note}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Topology Visualizer */}
          <ArchitectureTopologyVisualizer />

          {/* Section: 4-Stage Ingestion & Processing Topology */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)] mb-1">
                  Execution Flow
                </p>
                <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)]">
                  End-to-End Processing Topology
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] max-w-md">
                From raw audio packet reception at the edge to authenticated deterministic response generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PIPELINE_NODES.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.step}
                    className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${node.accent}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--lit-border-light,#DFE7EF)]">
                          {node.step}
                        </span>
                      </div>

                      <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-1">
                        {node.title}
                      </h3>
                      <p className="text-xs font-mono text-[var(--lit-teal,#1FA9A2)] uppercase tracking-wider mb-3">
                        {node.subtitle}
                      </p>
                      <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6">
                        {node.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                      <span>Latency Target</span>
                      <span className="font-bold text-[var(--lit-navy,#0B2545)]">
                        {node.metrics}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Architectural Specifications */}
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)]">
                Engineering Standards
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)]">
                Enterprise Resilience &amp; Controls
              </h2>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
                Built on battle-tested distributed protocols ensuring zero-downtime reliability and enterprise privacy compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {ARCHITECTURE_SPECIFICATIONS.map((spec, idx) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-8 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 ${spec.accent}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-6">
                        {spec.category}
                      </h3>
                      <ul className="space-y-4">
                        {spec.points.map((pt, pidx) => (
                          <li
                            key={pidx}
                            className="flex items-start gap-3 text-sm text-[var(--lit-text-muted,#52677C)]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & Zero-Persistence Guarantee Banner */}
          <div className="rounded-3xl border border-[#0B2545] bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#45D9D2]/30 bg-[#45D9D2]/10 text-[#45D9D2] text-xs font-mono font-semibold uppercase">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Zero-Persistence Architecture</span>
                </div>
                <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Complete RAM-Only Audio Stream Isolation
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                  Voice streams and sensitive telemetry are processed entirely in volatile memory. No audio bytes or personally identifiable biometric signatures are ever stored to physical disk storage during live inference, ensuring natural compliance with SOC2, GDPR, and HIPAA data segregation standards.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                <Link
                  href="/docs/api"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[#188a84] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  <Terminal className="w-4 h-4" />
                  API Documentation
                </Link>
                <Link
                  href="/security"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <span>Security Overview</span>
                  <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Architected for Uncompromising Enterprise Standards"
            subtitle="Schedule an architectural deep dive with our Principal Systems Engineers or request custom deployment documentation."
            primaryCta={{
              label: "Schedule Architecture Review",
              href: "/book-consultation",
            }}
            secondaryCta={{
              label: "View API Specifications",
              href: "/docs/api",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
