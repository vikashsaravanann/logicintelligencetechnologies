"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Activity,
  Brain,
  Lock,
  ArrowRight,
  Waves,
  AlertTriangle,
} from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const STATS = [
  {
    label: "Real-Time Detection",
    value: "Sub-250ms",
    note: "Target latency (not independently benchmarked)",
    icon: Zap,
    color: "text-cyan-400",
  },
  {
    label: "Detection Engine",
    value: "AASIST",
    note: "Deep learning anti-spoofing model",
    icon: Brain,
    color: "text-violet-400",
  },
  {
    label: "Audio Retention",
    value: "Zero",
    note: "Default configuration: STORE_RAW_AUDIO=false",
    icon: Lock,
    color: "text-emerald-400",
  },
  {
    label: "Risk Levels",
    value: "3-Tier",
    note: "Low · Medium · High classification",
    icon: Activity,
    color: "text-amber-400",
  },
] as const;

export default function VoiceShieldHero() {
  return (
    <section
      className="relative min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 pt-24 pb-20"
      aria-labelledby="vs-hero-heading"
    >
      <div className="relative z-10 mx-auto max-w-7xl w-full">
        {/* Main Liquid Panel */}
        <GlassSurface variant="liquid" className="p-8 lg:p-16 relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000 ease-out fill-mode-both">
          
          <div className="absolute top-0 right-0 p-32 opacity-20 pointer-events-none mix-blend-screen">
            <div className="w-64 h-64 bg-cyan-400 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-4xl">
            {/* Product badge */}
            <div className="mb-8 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                VoiceShield by Logic Intelligence Technologies
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-[10px] sm:text-xs font-mono font-bold backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" aria-hidden />
                AI Security Product
              </span>
            </div>

            {/* Headline */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
              <h1
                id="vs-hero-heading"
                className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.05] drop-shadow-lg"
              >
                Detect the clone.{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  Protect the conversation.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-cyan-50/80 max-w-2xl mb-10 leading-relaxed drop-shadow-sm font-medium">
                VoiceShield is an advanced AI-powered voice security platform designed to detect
                synthetic voice clones and spoofing attempts in real-time. We protect your enterprise 
                telephony infrastructure from the next generation of voice fraud.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
              <Link
                href="/voice-shield/request"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] backdrop-blur-lg border border-cyan-300/30"
              >
                <Waves className="w-4 h-4" aria-hidden />
                Request Access
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/voice-shield/request"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm tracking-widest uppercase transition-all backdrop-blur-md"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </GlassSurface>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
          {STATS.map((stat) => (
            <GlassSurface
              key={stat.label}
              variant="liquid"
              className="p-5 border-white/10 hover:border-cyan-400/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} aria-hidden />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono mb-1 ${stat.color} drop-shadow-md`}>
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider mb-1 opacity-90">
                {stat.label}
              </div>
              <div className="text-[10px] text-cyan-100/50 leading-tight">
                {stat.note}
              </div>
            </GlassSurface>
          ))}
        </div>

        {/* Disclaimer note */}
        <p className="mt-8 flex items-start gap-2 text-xs text-white/40 max-w-3xl mx-auto text-center justify-center animate-in fade-in duration-1000 delay-1000 fill-mode-both">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" aria-hidden />
          Performance metrics above are design targets. Independent benchmarking
          has not yet been published. All technical claims reflect the current
          implementation architecture of Logic Intelligence Technologies.
        </p>
      </div>
    </section>
  );
}
