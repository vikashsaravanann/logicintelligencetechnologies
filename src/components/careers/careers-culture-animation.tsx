"use client";

import React, { useState, useEffect } from "react";
import { Terminal, CheckCircle2, GitBranch, Cpu, ShieldCheck, Zap, Activity } from "lucide-react";

export default function CareersCultureAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "Strict Typecheck & Schemas", detail: "tsc --noEmit // 0 errors across 113 routes", status: "PASS" },
    { title: "Deterministic Test Suite", detail: "npm run test:unit // 260 of 260 unit suites green", status: "100%" },
    { title: "Turbopack Edge Build", detail: "Compiled production SSR bundle in 12.4s", status: "OPTIMIZED" },
    { title: "Zero-Downtime Deployment", detail: "Sub-50ms live reachability on global edge mesh", status: "ONLINE" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-[#DFE7EF] bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 text-left">
      {/* Window Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DFE7EF] mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] ml-2 flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            lit-engineering://culture.pipeline
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>High-Autonomy Culture</span>
        </div>
      </div>

      {/* Pipeline Status Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {steps.map((s, idx) => {
          const isActive = idx === activeStep;
          return (
            <div
              key={s.title}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                isActive
                  ? "border-[var(--lit-teal,#1FA9A2)] bg-[#F0FDF4] shadow-xs"
                  : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--lit-navy,#0B2545)]">
                  0{idx + 1}. Step
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--lit-ink,#121826)] mb-1 leading-snug">
                {s.title}
              </p>
              <p className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] truncate">
                {s.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Engineering Principles Matrix */}
      <div className="p-4 rounded-xl bg-[#0B1528] text-slate-200 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <GitBranch className="w-3.5 h-3.5" />
            <span>branch: main // commit-gate: strict-deterministic</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>0 Sales Intermediaries</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">OWNERSHIP STANDARD</span>
            <span className="text-white font-bold text-sm">Direct P&amp;L Authority</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Real trial · Real equity</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">ENGINEERING BAR</span>
            <span className="text-white font-bold text-sm">Deterministic State</span>
            <span className="text-[10px] text-cyan-400 block mt-1">No brittle prompt wrappers</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">TEAM VELOCITY</span>
            <span className="text-white font-bold text-sm">&lt; 48hr Execution</span>
            <span className="text-[10px] text-purple-400 block mt-1">From discovery to prototype</span>
          </div>
        </div>
      </div>
    </div>
  );
}
