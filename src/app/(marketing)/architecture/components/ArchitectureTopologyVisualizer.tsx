"use client";

import React, { useState } from "react";
import {
  Server,
  Activity,
  BrainCircuit,
  ShieldCheck,
  Database,
  Lock,
  Cpu,
  Network,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface TopologyNode {
  id: string;
  label: string;
  role: string;
  latency: string;
  protocol: string;
  memory: string;
  encryption: string;
  description: string;
}

interface TopologyMode {
  id: string;
  name: string;
  tag: string;
  description: string;
  nodes: TopologyNode[];
}

const MODES: TopologyMode[] = [
  {
    id: "voice-stream",
    name: "Zero-Persistence Voice Streaming",
    tag: "Real-Time Audio",
    description:
      "End-to-end full-duplex acoustic pipeline operating strictly inside volatile RAM. Raw microphone buffers are processed and discarded within 40ms without ever writing an audio byte to disk.",
    nodes: [
      {
        id: "v1",
        label: "Edge Client WebRTC",
        role: "Client Ingress",
        latency: "< 12ms",
        protocol: "WebRTC / Opus 48kHz",
        memory: "Client Browser",
        encryption: "DTLS / SRTP",
        description: "Captures full-duplex audio stream via browser media devices with echo cancellation and noise suppression.",
      },
      {
        id: "v2",
        label: "Anycast Edge Router",
        role: "Regional Gate",
        latency: "< 18ms",
        protocol: "HTTP/3 & gRPC",
        memory: "Stateless Ingress",
        encryption: "TLS 1.3 Strict",
        description: "Routes audio packets to closest GPU availability zone with Geo-DNS latency optimization.",
      },
      {
        id: "v3",
        label: "Volatile Audio Ring Buffer",
        role: "In-Memory Parsing",
        latency: "< 5ms",
        protocol: "Shared Memory IPC",
        memory: "RAM Only (0B Disk)",
        encryption: "In-Memory XOR Masking",
        description: "Buffers 20ms audio frames in volatile RAM for DNN spectral analysis. Automatically flushed on stream close.",
      },
      {
        id: "v4",
        label: "DNN Acoustic Engine",
        role: "Inference Core",
        latency: "< 35ms",
        protocol: "CUDA / TensorRT",
        memory: "GPU HBM3 VRAM",
        encryption: "Confidential Compute",
        description: "Executes speaker verification, synthetic audio detection, and speech-to-intent inference simultaneously.",
      },
      {
        id: "v5",
        label: "Synthesizer & Audio Return",
        role: "Stream Egress",
        latency: "< 15ms",
        protocol: "WebRTC Full Duplex",
        memory: "Streaming Buffer",
        encryption: "SRTP AES-256-GCM",
        description: "Dispatches synthesized neural audio frames directly back to client speakers with zero perceptual delay.",
      },
    ],
  },
  {
    id: "agentic-rag",
    name: "Enterprise Agentic & RAG Pipeline",
    tag: "Autonomous Orchestration",
    description:
      "Multi-agent dialogue execution pipeline with deterministic safety guardrails, private vector knowledge retrieval, and human-in-the-loop approvals.",
    nodes: [
      {
        id: "a1",
        label: "Multi-Channel Inbound Gateway",
        role: "User Ingress",
        latency: "< 10ms",
        protocol: "REST & WebSockets",
        memory: "Stateless Gateway",
        encryption: "TLS 1.3 / mTLS",
        description: "Receives user prompts from web portals, mobile apps, and third-party integrations with rate-limiting token buckets.",
      },
      {
        id: "a2",
        label: "Deterministic Safety Gate",
        role: "Pre-Execution Guard",
        latency: "< 8ms",
        protocol: "Rule Engine & AST",
        memory: "In-Memory Cache",
        encryption: "Encrypted Token State",
        description: "Scans prompt for prompt-injections, PII leakage, and compliance policy violations before LLM processing.",
      },
      {
        id: "a3",
        label: "Enterprise Vector Store (RAG)",
        role: "Knowledge Retrieval",
        latency: "< 22ms",
        protocol: "gRPC Vector Search",
        memory: "Dedicated HNSW Index",
        encryption: "AES-256 Rest & Transit",
        description: "Queries customer-isolated embeddings across private databases with strict Row-Level Security (RLS).",
      },
      {
        id: "a4",
        label: "LLM Reasoning Orchestrator",
        role: "Agent Planning Core",
        latency: "< 140ms",
        protocol: "TensorRT LLM Engine",
        memory: "Isolated GPU Cluster",
        encryption: "Confidential Enclave",
        description: "Formulates step-by-step action plans, generates structured JSON tool invocations, and streams tokens.",
      },
      {
        id: "a5",
        label: "Verified ERP/CRM Tool Execution",
        role: "Action Dispatch",
        latency: "< 45ms",
        protocol: "Signed Webhooks / OpenAPI",
        memory: "Audit Log DB",
        encryption: "HMAC-SHA256 Signed",
        description: "Executes verified transactional actions against client systems with automated rollback safety nets.",
      },
    ],
  },
  {
    id: "hybrid-cloud",
    name: "High-Availability Multi-Region Cloud",
    tag: "Infrastructure Resilience",
    description:
      "Active-active geographical deployment across Tier-1 edge data centers with automated health checks, sub-second failover, and zero-downtime SLA.",
    nodes: [
      {
        id: "h1",
        label: "Global Geo-DNS Anycast",
        role: "Traffic Distribution",
        latency: "< 5ms",
        protocol: "BGP Anycast / DNS",
        memory: "Edge CDN POPs",
        encryption: "DNSSEC / TLS 1.3",
        description: "Distributes inbound customer traffic to the geographically nearest healthy cloud region.",
      },
      {
        id: "h2",
        label: "Primary Region (Mumbai)",
        role: "Active Region A",
        latency: "< 20ms",
        protocol: "K8s Microservices",
        memory: "Auto-scaled Nodes",
        encryption: "VPC Peering KMS",
        description: "Handles primary production traffic with 48 active GPU accelerator nodes and warm failover caches.",
      },
      {
        id: "h3",
        label: "Cross-Region Sync Bridge",
        role: "Zero-Data-Loss Sync",
        latency: "< 35ms",
        protocol: "Encrypted Direct Connect",
        memory: "Kafka Event Log",
        encryption: "mTLS 256-bit",
        description: "Synchronizes configuration states, audit logs, and encrypted database replicas asynchronously.",
      },
      {
        id: "h4",
        label: "Standby Region (Frankfurt)",
        role: "Hot Standby Region B",
        latency: "< 25ms",
        protocol: "Mirror Cluster",
        memory: "Warm GPU Standby",
        encryption: "Dedicated Vault",
        description: "Maintains real-time mirror capacity capable of assuming 100% load within 1.2 seconds of regional failure.",
      },
      {
        id: "h5",
        label: "Continuous Health & Telemetry",
        role: "SLA Observer",
        latency: "< 2ms",
        protocol: "OpenTelemetry / Prometheus",
        memory: "Time-Series Store",
        encryption: "Audit Sealed",
        description: "Monitors p95 latency, GPU memory saturation, and synthetic transaction integrity 24/7/365.",
      },
    ],
  },
];

export default function ArchitectureTopologyVisualizer() {
  const [activeModeId, setActiveModeId] = useState<string>("voice-stream");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("v3");

  const currentMode = MODES.find((m) => m.id === activeModeId) || MODES[0];
  const currentNode =
    currentMode.nodes.find((n) => n.id === selectedNodeId) || currentMode.nodes[0];

  const handleModeChange = (modeId: string) => {
    setActiveModeId(modeId);
    const newMode = MODES.find((m) => m.id === modeId) || MODES[0];
    setSelectedNodeId(newMode.nodes[2]?.id || newMode.nodes[0].id);
  };

  return (
    <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
      {/* Visualizer Top Bar & Topology Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Topology Visualizer</span>
          </div>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)]">
            {currentMode.name}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1 max-w-2xl">
            {currentMode.description}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-[var(--lit-cloud,#F7F9FC)] p-1.5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)]">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-poppins font-bold transition-all ${
                activeModeId === mode.id
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                  : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
              }`}
            >
              {mode.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Topology Node Diagram Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
          <span>PIPELINE DATA FLOW</span>
          <span className="text-[var(--lit-teal,#1FA9A2)] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--lit-teal,#1FA9A2)] animate-pulse" />
            Live Hardware Verification
          </span>
        </div>

        {/* Interactive Node Flow Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {currentMode.nodes.map((node, index) => {
            const isSelected = node.id === currentNode.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between min-h-[140px] ${
                  isSelected
                    ? "bg-[#E7F3FF] border-[#1565C0] shadow-md ring-2 ring-[#1565C0]/20"
                    : "bg-[var(--lit-cloud,#F7F9FC)] border-[var(--lit-border-light,#DFE7EF)] hover:bg-white hover:border-[#BBDEFB]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-[#1565C0] text-white"
                          : "bg-white text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)]"
                      }`}
                    >
                      STEP 0{index + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--lit-teal,#1FA9A2)]">
                      {node.latency}
                    </span>
                  </div>
                  <h4
                    className={`font-poppins text-xs font-bold leading-snug line-clamp-2 ${
                      isSelected
                        ? "text-[#1565C0]"
                        : "text-[var(--lit-navy,#0B2545)]"
                    }`}
                  >
                    {node.label}
                  </h4>
                </div>

                <div className="pt-2 text-[10px] font-mono text-[var(--lit-text-muted,#52677C)] truncate border-t border-[var(--lit-border-light,#DFE7EF)]/60 mt-2">
                  {node.role}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Dive Inspector */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[#0B2545] text-white p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#45D9D2]/20 text-[#45D9D2] border border-[#45D9D2]/30 uppercase">
                {currentNode.role}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Latency: {currentNode.latency}
              </span>
            </div>
            <h3 className="font-poppins text-lg sm:text-xl font-bold text-white">
              {currentNode.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {currentNode.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch lg:self-auto">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-xs font-mono text-[#E7F3FF] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#45D9D2]" />
              <span>Verified Topology Standard</span>
            </div>
          </div>
        </div>

        {/* Node Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Wire Protocol
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-[#45D9D2]">
              {currentNode.protocol}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Memory Footprint
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-white">
              {currentNode.memory}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Cryptographic Cipher
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold text-[#A5D6A7]">
              {currentNode.encryption}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
