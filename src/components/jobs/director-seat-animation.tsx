"use client";

import React from "react";
import { Terminal, TrendingUp, Cpu, HeartPulse, Activity } from "lucide-react";

interface DirectorSeatAnimationProps {
  id: string;
  title: string;
}

export default function DirectorSeatAnimation({ id, title }: DirectorSeatAnimationProps) {
  if (id === "sales") {
    return (
      <div className="relative w-full aspect-[16/10] bg-[#0B1528] p-5 flex flex-col justify-between overflow-hidden border-b border-slate-800 text-white font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> Pipeline Velocity Engine
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
            Uncapped Bonus
          </span>
        </div>
        <div className="space-y-2 my-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Target Segment</span>
            <span className="text-white font-semibold">Tier-1 &amp; Mid-Market</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Price Integrity</span>
            <span className="text-emerald-400 font-bold">100% Fixed Catalog</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Lead Pipeline</span>
            <span className="text-sky-400">Warm Pre-Qualified Inbound</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
          <span>Ownership: Revenue &amp; GTM</span>
          <span className="text-amber-400 font-bold">Direct Board Alignment</span>
        </div>
      </div>
    );
  }

  if (id === "eng") {
    return (
      <div className="relative w-full aspect-[16/10] bg-[#0B1528] p-5 flex flex-col justify-between overflow-hidden border-b border-slate-800 text-white font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="flex items-center gap-1.5 text-sky-400 text-[10px] font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> Deterministic Core Systems
          </span>
          <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
            Lead Architect
          </span>
        </div>
        <div className="space-y-2 my-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Test Gate</span>
            <span className="text-emerald-400 font-bold">260/260 Suites Green</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Prompt Wrappers</span>
            <span className="text-rose-400 font-bold">0% Permitted</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Type Discipline</span>
            <span className="text-sky-400">TypeScript Strict Mode</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
          <span>Sub-50ms Global P99</span>
          <span className="text-emerald-400 font-bold">Zero Technical Debt</span>
        </div>
      </div>
    );
  }

  // Head of Product / Clinical
  return (
    <div className="relative w-full aspect-[16/10] bg-[#0B1528] p-5 flex flex-col justify-between overflow-hidden border-b border-slate-800 text-white font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="flex items-center gap-1.5 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
          <HeartPulse className="w-3.5 h-3.5" /> Clinical &amp; Voice Platform
        </span>
        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
          Healthcare OS
        </span>
      </div>
      <div className="space-y-2 my-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Standards</span>
          <span className="text-purple-300 font-bold">ABDM / HIPAA / FHIR</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Active Facilities</span>
          <span className="text-emerald-400 font-bold">14 Live Deployments</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">In-Band Guard</span>
          <span className="text-sky-400">Voice Shield Biometrics</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
        <span>Product Autonomy: 100%</span>
        <span className="text-purple-400 font-bold">Mission-Critical Care</span>
      </div>
    </div>
  );
}
