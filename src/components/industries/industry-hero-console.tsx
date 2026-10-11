"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldCheck, Building2, Activity, CheckCircle2, Server, Lock } from "lucide-react";

interface IndustryHeroConsoleProps {
  slug: string;
  title: string;
  subtitle: string;
}

export default function IndustryHeroConsole({
  slug,
  title,
  subtitle,
}: IndustryHeroConsoleProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { name: "Residency Isolation", desc: "Data stored within sovereign borders (India / Local)", status: "COMPLIANT" },
    { name: "Zero-Trust Boundary", desc: "Mutual TLS & granular RBAC session authentication", status: "ENFORCED" },
    { name: "Deterministic Workflow", desc: "Typed state machines replacing brittle prompt loops", status: "VERIFIED" },
    { name: "Cryptographic Audit", desc: "Tamper-evident logs for external regulator inspection", status: "ACTIVE" },
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2700);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-[#DFE7EF] bg-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 text-left mb-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DFE7EF] mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] ml-2 flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            lit-industry://{slug}.engine
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Regulated Infrastructure Verified</span>
        </div>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {steps.map((stg, i) => {
          const active = i === activeStep;
          return (
            <div
              key={stg.name}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                active
                  ? "border-[var(--lit-teal,#1FA9A2)] bg-[#F0FDF4] shadow-xs"
                  : "border-[#E2E8F0] bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--lit-navy,#0B2545)]">
                  0{i + 1}. Gate
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {stg.status}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--lit-ink,#121826)] mb-1 leading-snug">
                {stg.name}
              </p>
              <p className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] truncate">
                {stg.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Vertical Domain Architecture Specs */}
      <div className="p-4 rounded-xl bg-[#0B1528] text-slate-200 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>vertical: {title.toUpperCase()} {'//'} sovereign-cloud</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>99.99% Availability SLA</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">COMPLIANCE RIGOR</span>
            <span className="text-white font-bold text-sm">DPDP &amp; ISO 27001</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Audit-ready evidence trail</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">DATA RESIDENCY</span>
            <span className="text-white font-bold text-sm">Sovereign Boundary</span>
            <span className="text-[10px] text-cyan-400 block mt-1">Zero cross-border leakage</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">LATENCY BENCHMARK</span>
            <span className="text-white font-bold text-sm">&lt; 50ms Telemetry</span>
            <span className="text-[10px] text-purple-400 block mt-1">High-throughput event mesh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
