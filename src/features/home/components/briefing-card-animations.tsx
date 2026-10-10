"use client";

import React from "react";
import { Cpu, Activity, TrendingUp, ShieldCheck, Sparkles, Binary, Building2, Zap } from "lucide-react";

/**
 * Animated Neural & Agentic Topology Visual for LOGIC AI
 */
export function LogicAiCardVisual() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#071328]">
      {/* Dynamic Matrix Grid */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#45D9D2_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Ambient Radial Cyan Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(69,217,210,0.25)_0%,transparent_70%)] blur-2xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.2)_0%,transparent_70%)] blur-2xl" />

      {/* SVG Neural Mesh Network with Animated Synapses */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-85 transition-opacity duration-500"
        viewBox="0 0 360 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#45D9D2" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Neural Synapse Interconnects */}
        <path
          d="M 40 80 Q 110 50 180 85 T 320 60"
          stroke="url(#cyanLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="animate-[dash_12s_linear_infinite]"
        />
        <path
          d="M 60 140 Q 150 100 230 135 T 330 110"
          stroke="url(#cyanLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="animate-[dash_8s_linear_infinite_reverse]"
        />
        <path
          d="M 180 85 L 230 135"
          stroke="#45D9D2"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <path
          d="M 110 50 L 150 100"
          stroke="#38BDF8"
          strokeWidth="1"
          strokeOpacity="0.35"
        />
        <path
          d="M 230 135 L 300 170"
          stroke="#0EA5E9"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Glowing Neural Nodes */}
        <g filter="url(#glowCyan)">
          <circle cx="180" cy="85" r="5" fill="#45D9D2" />
          <circle cx="230" cy="135" r="4.5" fill="#38BDF8" />
          <circle cx="110" cy="50" r="3.5" fill="#0EA5E9" />
          <circle cx="320" cy="60" r="4" fill="#45D9D2" />
          <circle cx="60" cy="140" r="3.5" fill="#38BDF8" />
          <circle cx="300" cy="170" r="4" fill="#45D9D2" />
        </g>

        {/* Node Halos */}
        <circle cx="180" cy="85" r="9" stroke="#45D9D2" strokeWidth="1" strokeOpacity="0.4" className="animate-ping" style={{ transformOrigin: "180px 85px" }} />
        <circle cx="230" cy="135" r="8" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.4" className="animate-pulse" />
      </svg>

      {/* Live System Telemetry Badges */}
      <div className="absolute top-14 right-5 flex flex-col items-end gap-1.5 opacity-90">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#081B38]/90 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Sub-18ms RAG</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#081B38]/80 border border-cyan-500/20 text-[9px] font-mono text-slate-300 backdrop-blur-md">
          <Binary className="w-3 h-3 text-cyan-400" />
          <span>1536-dim HNSW</span>
        </div>
      </div>

      {/* Scanning Laser Beam */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[scan_5s_ease-in-out_infinite]" />

      {/* Dark Gradient Overlay for optimal text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-[#071328]/60 to-[#071328]/30" />
    </div>
  );
}

/**
 * Animated Capital & Financial Growth Telemetry Visual for INVESTORS
 */
export function InvestorsCardVisual() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#071328]">
      {/* Financial Matrix Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#F59E0B15_1px,transparent_1px),linear-gradient(to_bottom,#F59E0B15_1px,transparent_1px)] bg-[size:1.25rem_1.25rem]" />

      {/* Ambient Warm Gold Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22)_0%,transparent_70%)] blur-2xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.15)_0%,transparent_70%)] blur-2xl" />

      {/* SVG Growth Trajectory & Financial Curve */}
      <svg
        className="absolute inset-0 w-full h-full opacity-65 group-hover:opacity-90 transition-opacity duration-500"
        viewBox="0 0 360 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldCurveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="goldAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Growth Area Fill */}
        <path
          d="M 30 160 Q 120 155 180 120 T 330 45 L 330 180 L 30 180 Z"
          fill="url(#goldAreaGrad)"
        />

        {/* Upward Growth Vector Line */}
        <path
          d="M 30 160 Q 120 155 180 120 T 330 45"
          stroke="url(#goldCurveGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Telemetry Guide Grid Lines */}
        <line x1="30" y1="160" x2="330" y2="160" stroke="#F59E0B" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="3 3" />
        <line x1="30" y1="110" x2="330" y2="110" stroke="#F59E0B" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="3 3" />
        <line x1="30" y1="60" x2="330" y2="60" stroke="#F59E0B" strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="3 3" />

        {/* Beacon Node on Crest */}
        <circle cx="330" cy="45" r="4.5" fill="#34D399" />
        <circle cx="330" cy="45" r="9" stroke="#34D399" strokeWidth="1.5" strokeOpacity="0.5" className="animate-ping" style={{ transformOrigin: "330px 45px" }} />
      </svg>

      {/* Animated Vertical Financial Telemetry Bars */}
      <div className="absolute bottom-6 right-6 flex items-end gap-1.5 opacity-70 group-hover:opacity-95 transition-opacity">
        <div className="w-1.5 h-7 rounded-t bg-amber-500/50 group-hover:h-9 transition-all duration-500" />
        <div className="w-1.5 h-10 rounded-t bg-amber-500/60 group-hover:h-12 transition-all duration-500" />
        <div className="w-1.5 h-14 rounded-t bg-amber-400/70 group-hover:h-16 transition-all duration-500" />
        <div className="w-1.5 h-18 rounded-t bg-amber-300/80 group-hover:h-20 transition-all duration-500" />
        <div className="w-1.5 h-22 rounded-t bg-emerald-400 group-hover:h-24 transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
      </div>

      {/* Floating Financial Badges */}
      <div className="absolute top-14 right-5 flex flex-col items-end gap-1.5 opacity-90">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1A180E]/90 border border-amber-500/30 text-[9px] font-mono text-amber-300 shadow-sm backdrop-blur-md">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>$38B Enterprise TAM</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1A180E]/80 border border-amber-500/20 text-[9px] font-mono text-slate-300 backdrop-blur-md">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>Deterministic ARR</span>
        </div>
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-[#071328]/60 to-[#071328]/30" />
    </div>
  );
}

/**
 * Animated Systems Engineering & Circuit Topology Visual for CAREERS
 */
export function CareersCardVisual() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#071328]">
      {/* Circuit Trace Matrix */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#DDD6FE_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Ambient Violet Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.22)_0%,transparent_70%)] blur-2xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] blur-2xl" />

      {/* SVG Circuit Traces & Systems Architecture Bus */}
      <svg
        className="absolute inset-0 w-full h-full opacity-65 group-hover:opacity-90 transition-opacity duration-500"
        viewBox="0 0 360 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="purpleTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* High-Throughput Architecture Bus Traces */}
        <path
          d="M 30 110 H 120 L 160 70 H 260 L 290 100 H 330"
          stroke="url(#purpleTraceGrad)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M 50 150 H 140 L 175 115 H 280"
          stroke="url(#purpleTraceGrad)"
          strokeWidth="1.25"
          strokeDasharray="5 3"
          strokeOpacity="0.6"
        />
        <path
          d="M 160 70 V 170"
          stroke="#A78BFA"
          strokeWidth="1"
          strokeOpacity="0.35"
        />
        <path
          d="M 260 70 V 150"
          stroke="#8B5CF6"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Architecture Bus Junction Nodes */}
        <circle cx="120" cy="110" r="3.5" fill="#DDD6FE" />
        <circle cx="160" cy="70" r="4.5" fill="#A78BFA" />
        <circle cx="260" cy="70" r="4" fill="#DDD6FE" />
        <circle cx="290" cy="100" r="3.5" fill="#C4B5FD" />
        <circle cx="140" cy="150" r="3" fill="#A78BFA" />

        {/* Pulsing Core Chip */}
        <rect x="248" y="58" width="24" height="24" rx="4" stroke="#A78BFA" strokeWidth="1" fill="#13112E" fillOpacity="0.7" />
        <circle cx="260" cy="70" r="7" stroke="#C4B5FD" strokeWidth="1" strokeOpacity="0.5" className="animate-ping" style={{ transformOrigin: "260px 70px" }} />
      </svg>

      {/* Floating Systems Engineering Badges */}
      <div className="absolute top-14 right-5 flex flex-col items-end gap-1.5 opacity-90">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#171233]/90 border border-purple-500/30 text-[9px] font-mono text-purple-300 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Coimbatore R&amp;D Studio</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#171233]/80 border border-purple-500/20 text-[9px] font-mono text-slate-300 backdrop-blur-md">
          <Zap className="w-3 h-3 text-purple-400" />
          <span>Go · Rust · WebRTC · RLS</span>
        </div>
      </div>

      {/* Micro-processor Pin Strip at Bottom */}
      <div className="absolute bottom-5 right-6 flex items-center gap-1 opacity-50 group-hover:opacity-80 transition-opacity">
        <span className="w-1 h-3 rounded-full bg-purple-400" />
        <span className="w-1 h-4 rounded-full bg-purple-300" />
        <span className="w-1 h-5 rounded-full bg-purple-400" />
        <span className="w-1 h-3 rounded-full bg-purple-500" />
        <span className="w-1 h-4 rounded-full bg-purple-300" />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071328] via-[#071328]/60 to-[#071328]/30" />
    </div>
  );
}
