"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldCheck, TrendingUp, Award, Activity, CheckCircle2 } from "lucide-react";

export default function ExecutiveSeatAnimation() {
  const [pulseIdx, setPulseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPulseIdx((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  const metrics = [
    { label: "P&L Authority", val: "100%", sub: "Full autonomy across operations", accent: "text-emerald-400" },
    { label: "Equity Range", val: "2.5% - 5.0%", sub: "Quarterly vesting with performance cliff", accent: "text-sky-400" },
    { label: "Board Governance", val: "Direct Seat", sub: "Voting partner in core LIT entity", accent: "text-purple-400" },
    { label: "Capital Allocation", val: "Uncapped", sub: "Deterministic growth budget", accent: "text-amber-400" },
  ];

  return (
    <div className="relative w-full h-full min-h-[300px] lg:min-h-full bg-[#0B1528] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-mono text-slate-400 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            lit-exec://ceo.mandate
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Priority Open Seat
        </span>
      </div>

      {/* Center Animated Metric Ring */}
      <div className="relative z-10 my-6 grid grid-cols-2 gap-3.5">
        {metrics.map((m, i) => {
          const isPulsing = i === pulseIdx;
          return (
            <div
              key={m.label}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                isPulsing
                  ? "bg-slate-800/90 border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.15)] scale-[1.02]"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                {m.label}
              </div>
              <div className={`text-base sm:text-lg font-mono font-bold ${m.accent}`}>
                {m.val}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Live System Telemetry Stream */}
      <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">HQ: Coimbatore · Onsite Commitment</span>
        </div>
        <div className="flex items-center gap-1 text-sky-400 font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>No Glass Ceilings</span>
        </div>
      </div>
    </div>
  );
}
