"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

/**
 * VoiceShield Hero Section
 *
 * Design: Premium dark navy glassmorphism consistent with LIT corporate identity.
 * Positioning: "VoiceShield by Logic Intelligence Technologies" — no invented claims.
 * Capabilities described: real-time anti-spoofing (AASIST), forensic analysis,
 *   voice fraud intelligence — all verified from the VoiceShield repository.
 */

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
      className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-24 pb-20 overflow-hidden"
      aria-labelledby="vs-hero-heading"
    >
      {/* Background gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] bg-center opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl w-full">

        {/* Product badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-center gap-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold tracking-[0.16em] uppercase">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            VoiceShield by Logic Intelligence Technologies
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            AI Security Product
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1
            id="vs-hero-heading"
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Detect the clone.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Protect the conversation.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            VoiceShield is an AI-powered voice security platform that detects
            synthetic voice clones and spoofing attempts in real time — protecting
            telephony infrastructure from voice fraud.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Link
            href="/voice-shield/demo"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
          >
            <Waves className="w-4 h-4" aria-hidden />
            Experience Live Demo
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
          <Link
            href="#request-demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 font-bold text-sm tracking-wide transition-all"
          >
            Request a Demo
          </Link>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map((stat) => (
            <GlassSurface
              key={stat.label}
              variant="card"
              className="p-5"
            >
              <stat.icon
                className={`w-5 h-5 mb-3 ${stat.color}`}
                aria-hidden
              />
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-zinc-500 leading-tight">
                {stat.note}
              </div>
            </GlassSurface>
          ))}
        </motion.div>

        {/* Disclaimer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-start gap-2 text-xs text-zinc-600"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
          Performance metrics above are design targets. Independent benchmarking
          has not yet been published. All technical claims reflect the current
          implementation architecture.
        </motion.p>
      </div>
    </section>
  );
}
