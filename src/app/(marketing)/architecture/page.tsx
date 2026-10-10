import React from "react";
import { 
  Server, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  Database, 
  Lock, 
  Cpu, 
  Network, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Terminal
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Systems Architecture | Logic Intelligence Technologies",
  description: "Explore the enterprise-grade infrastructure, distributed inference engines, and zero-persistence security topology powering Logic Intelligence Technologies platforms.",
};

const PIPELINE_NODES = [
  {
    step: "01",
    title: "Edge Ingestion & Telemetry Node",
    subtitle: "Global Anycast WebSocket & gRPC",
    icon: Server,
    desc: "Raw audio streams and structured telemetry payloads are ingested via secure WebSocket and HTTP/3 edge nodes. Multi-region routing keeps round-trip transmission latency under 25ms globally.",
    metrics: "< 25ms Edge Latency",
  },
  {
    step: "02",
    title: "Stream Parsing & Feature Extraction",
    subtitle: "Deterministic In-Memory Tokenization",
    icon: Activity,
    desc: "Input streams are segmented into micro-frames in volatile RAM. Spectral audio features, semantic tokens, and clinical schema structures are parsed with strict boundary validation before inference dispatch.",
    metrics: "Volatile Memory Only",
  },
  {
    step: "03",
    title: "Hybrid Inference & RAG Synthesis",
    subtitle: "Orchestrated Multi-Model Routing",
    icon: BrainCircuit,
    desc: "Dynamic task dispatchers evaluate token intent against deterministic safety gates, enterprise knowledge bases, and domain-adapted foundation models with verified citation validation.",
    metrics: "Sub-200ms Processing",
  },
  {
    step: "04",
    title: "Policy Enforcement & Zero-Trust Delivery",
    subtitle: "Automated Audit Trails & Isolation",
    icon: ShieldCheck,
    desc: "Outputs pass through automated PII redaction filters and policy gates before downstream delivery. All audit logs record cryptographic verification without persisting sensitive customer payload data.",
    metrics: "Zero Disk Persistence",
  },
];

const ARCHITECTURE_SPECIFICATIONS = [
  {
    category: "Compute & Execution",
    icon: Cpu,
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
    points: [
      "Zero customer conversation or clinical data used for foundational model training",
      "Encrypted data in transit and managed KMS-backed database volumes at rest",
      "Role-Based Access Control (RBAC) enforced across every microservice API",
      "Strict compliance alignment with GDPR, ISO 27001, and SOC2 principles",
    ],
  },
];

const BENCHMARKS = [
  { label: "Edge Audio Ingestion Latency", value: "< 25ms", note: "Global Anycast median" },
  { label: "End-to-End Voice Inference", value: "< 280ms", note: "Speech-to-Speech pipeline" },
  { label: "High-Availability SLA Target", value: "99.95%", note: "Core infrastructure services" },
  { label: "Audio Disk Persistence", value: "0 bytes", note: "100% volatile memory processing" },
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

      <div className="pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Header Hero */}
        <div className="mt-8 mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <Layers className="w-3.5 h-3.5" />
            Distributed Systems Blueprint
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            High-Concurrency <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">AI Architecture</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Engineered for high concurrency, deterministic safety gates, and ultra-low latency across real-time voice intelligence, automated web agents, and clinical platforms.
          </p>
        </div>

        {/* Core Latency & Reliability Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {BENCHMARKS.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-white/10 bg-[#10131A] relative overflow-hidden group hover:border-cyan-500/40 transition-all"
            >
              <div className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                {item.value}
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mt-2 font-medium">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {item.note}
              </div>
              <div className="absolute top-0 right-0 h-1 w-12 bg-gradient-to-r from-transparent to-cyan-400/50" />
            </div>
          ))}
        </div>

        {/* Section: 4-Stage Core Ingestion & Execution Pipeline */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
                Execution Flow
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-heading">
                End-to-End Processing Topology
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              From raw audio packet reception at the edge to authenticated deterministic response generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PIPELINE_NODES.map((node) => (
              <div
                key={node.step}
                className="relative p-8 rounded-2xl border border-white/10 bg-[#151922] shadow-2xl hover:border-cyan-500/40 hover:bg-[#181d28] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(69,217,210,0.2)]">
                      <node.icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-mono font-bold text-white/20 group-hover:text-cyan-400/40 transition-colors">
                      {node.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white uppercase font-heading tracking-wide mb-1">
                    {node.title}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400/90 uppercase tracking-wider mb-4">
                    {node.subtitle}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                    {node.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Latency Target</span>
                  <span className="font-bold text-cyan-300">{node.metrics}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Architectural Specifications */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
              Engineering Standards
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-heading">
              Enterprise Resilience & Controls
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Built on battle-tested distributed protocols ensuring zero-downtime reliability and enterprise privacy compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {ARCHITECTURE_SPECIFICATIONS.map((spec, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-white/10 bg-[#10131A] shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 mb-6">
                    <spec.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase font-heading tracking-wide mb-6">
                    {spec.category}
                  </h3>
                  <ul className="space-y-4">
                    {spec.points.map((pt, pidx) => (
                      <li key={pidx} className="flex items-start gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Zero-Persistence Guarantee Banner */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#10131A] via-[#151922] to-[#10131A] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-semibold uppercase">
                <Lock className="w-3.5 h-3.5" />
                Zero-Persistence Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white uppercase tracking-tight">
                Complete RAM-Only Audio Stream Isolation
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Voice streams and sensitive telemetry are processed entirely in volatile memory. No audio bytes or personally identifiable biometric signatures are ever stored to physical disk storage during live inference, ensuring natural compliance with SOC2, GDPR, and HIPAA data segregation standards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
              <Link
                href="/docs/api"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(69,217,210,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Terminal className="w-4 h-4" />
                API Documentation
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-cyan-500/40 font-mono font-bold text-xs uppercase tracking-wider transition-all"
              >
                Security Overview
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
