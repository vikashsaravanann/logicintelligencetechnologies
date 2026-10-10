"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Database, ShieldCheck, Cpu, Sparkles, CheckCircle2, Activity } from "lucide-react";

export default function AiNeuralPipelineVisualizer() {
  const [pulseStage, setPulseStage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPulseStage((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const stages = [
    { title: "Recursive Chunking", desc: "512-token semantic split", badge: "Metadata Tagged" },
    { title: "pgvector Indexing", desc: "1536-dim HNSW embeddings", badge: "Cosine > 0.88" },
    { title: "Grounding Guardrail", desc: "Deterministic hallucination gate", badge: "Zero Fabrication" },
    { title: "Streaming Delivery", desc: "Sub-20ms TTFT to client", badge: "RAM Ephemeral" },
  ];

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-[#DFE7EF] bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DFE7EF] mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] ml-2 flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            lit-neural://rag.embeddings.stream
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active · Sub-20ms Vector Retrieval</span>
        </div>
      </div>

      {/* 4 Pipeline Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stages.map((stg, i) => {
          const active = i === pulseStage;
          return (
            <div
              key={stg.title}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                active
                  ? "border-[var(--lit-teal,#1FA9A2)] bg-[#F0FDF4] shadow-xs"
                  : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--lit-navy,#0B2545)]">
                  0{i + 1}. Stage
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {stg.badge}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--lit-ink,#121826)] mb-1 leading-snug">
                {stg.title}
              </p>
              <p className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] truncate">
                {stg.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Terminal Telemetry Body */}
      <div className="p-4 rounded-xl bg-[#0B1528] text-slate-200 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400">
            <Database className="w-3.5 h-3.5" />
            <span>vector-table: enterprise_docs_chunks // indexed: 148,200 nodes</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>94.8 tokens/sec</span>
          </div>
        </div>

        {/* Live Vector Matches */}
        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-slate-800">
            <span className="text-slate-300 truncate">
              [Match 1] LIT-HIPAA-Clinical-Telemetry-Architecture.pdf
            </span>
            <span className="text-emerald-400 font-bold ml-2 shrink-0">Similarity: 0.942</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-slate-800">
            <span className="text-slate-300 truncate">
              [Match 2] Deterministic-State-Engine-Specifications-v2.md
            </span>
            <span className="text-sky-400 font-bold ml-2 shrink-0">Similarity: 0.915</span>
          </div>
        </div>
      </div>
    </div>
  );
}
