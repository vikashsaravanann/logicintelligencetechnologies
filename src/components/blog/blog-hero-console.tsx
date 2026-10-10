"use client";

import React from "react";
import { Terminal, ShieldCheck, Cpu, Activity, FileText, CheckCircle2 } from "lucide-react";

interface BlogHeroConsoleProps {
  slug: string;
  title: string;
  category: string;
  readingTime: string;
}

export default function BlogHeroConsole({
  slug,
  title,
  category,
  readingTime,
}: BlogHeroConsoleProps) {
  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-[#DFE7EF] bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 text-left mb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DFE7EF] mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] ml-2 flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            lit-research://article.{slug}.spec
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Peer-Reviewed Engineering Memo</span>
        </div>
      </div>

      {/* Terminal Architecture Inspection Canvas */}
      <div className="p-4 rounded-xl bg-[#0B1528] text-slate-200 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400">
            <FileText className="w-3.5 h-3.5" />
            <span>category: {category.toUpperCase()} // architectural-analysis</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>{readingTime} Technical Read</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">TECHNICAL DEPTH</span>
            <span className="text-white font-bold text-sm">Principal Architect</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Verified production patterns</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">CODE INTEGRITY</span>
            <span className="text-white font-bold text-sm">100% Deterministic</span>
            <span className="text-[10px] text-cyan-400 block mt-1">Reproducible implementation</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">PEER REVIEW</span>
            <span className="text-white font-bold text-sm">Staff Eng Approved</span>
            <span className="text-[10px] text-purple-400 block mt-1">Zero commercial marketing fluff</span>
          </div>
        </div>
      </div>
    </div>
  );
}
