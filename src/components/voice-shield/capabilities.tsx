"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Zap, Search, ChartBar, MessageSquareWarning,
  FileSearch, Lock, Layers,
} from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Real-Time Detection",
    description:
      "Streams audio in 333ms chunks over WebSocket. Detection score returned for every chunk within the processing budget. Supports session resume after network disconnect.",
    tag: "REAL-TIME",
    color: "from-cyan-500/20 to-blue-500/10",
    accent: "text-cyan-400",
  },
  {
    icon: ShieldCheck,
    title: "AASIST Anti-Spoofing",
    description:
      "AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention networks) is a deep learning model trained to distinguish genuine human voice from AI-generated speech.",
    tag: "CORE ENGINE",
    color: "from-violet-500/20 to-blue-500/10",
    accent: "text-violet-400",
  },
  {
    icon: Search,
    title: "Explainability Markers",
    description:
      "Each detection result includes explainability markers: high-frequency energy ratio (vocoder leakage indicator), phase inconsistency (splice marker), and prosody irregularity.",
    tag: "INTERPRETABLE",
    color: "from-emerald-500/20 to-teal-500/10",
    accent: "text-emerald-400",
  },
  {
    icon: FileSearch,
    title: "Forensic File Analysis",
    description:
      "Upload a recorded audio file for post-call forensic analysis. VoiceShield segments the recording, scores each slice, detects splice regions, and generates a report with overall risk classification.",
    tag: "FORENSICS",
    color: "from-amber-500/20 to-orange-500/10",
    accent: "text-amber-400",
  },
  {
    icon: MessageSquareWarning,
    title: "Challenge-Response",
    description:
      "When medium or high risk is detected, the system can trigger a challenge — requesting a spoken passphrase or liveness token — to verify the caller is a human speaking live.",
    tag: "ACTIVE DEFENCE",
    color: "from-rose-500/20 to-red-500/10",
    accent: "text-rose-400",
  },
  {
    icon: ChartBar,
    title: "Session Intelligence",
    description:
      "Every session persists risk statistics: average spoof probability, maximum risk, risk distribution across chunks, session duration, and decision outcome (allowed / blocked).",
    tag: "ANALYTICS",
    color: "from-blue-500/20 to-cyan-500/10",
    accent: "text-blue-400",
  },
  {
    icon: Lock,
    title: "Audit Trail",
    description:
      "All WebSocket connection events and authentication actions are logged to an immutable audit table with timestamps, IP addresses, and session references.",
    tag: "COMPLIANCE",
    color: "from-slate-500/20 to-zinc-500/10",
    accent: "text-slate-300",
  },
  {
    icon: Layers,
    title: "Supabase RLS Data Isolation",
    description:
      "Row-Level Security policies ensure users can only access their own sessions and detection events. Admin roles access all records. No cross-tenant data leakage.",
    tag: "SECURITY",
    color: "from-teal-500/20 to-emerald-500/10",
    accent: "text-teal-400",
  },
] as const;

export default function VoiceShieldCapabilities() {
  return (
    <section className="py-24 px-6" aria-labelledby="vs-capabilities-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
            Product Capabilities
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2
            id="vs-capabilities-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight"
          >
            What{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              VoiceShield
            </span>{" "}
            delivers
          </h2>
          <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
            Capabilities described below are based on the verified VoiceShield
            implementation. No unverified performance claims are made.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <GlassSurface variant="card" className={`p-5 h-full bg-gradient-to-br ${cap.color}`}>
                <div className="mb-4 flex items-center justify-between">
                  <cap.icon className={`w-5 h-5 ${cap.accent}`} aria-hidden />
                  <span className={`text-[10px] font-bold font-mono ${cap.accent} opacity-70 tracking-wider`}>
                    {cap.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-tight">{cap.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{cap.description}</p>
              </GlassSurface>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
