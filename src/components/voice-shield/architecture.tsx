"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, Globe, Database, Cpu, Cloud, ArrowDown } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const LAYERS = [
  {
    icon: Globe,
    label: "PRESENTATION LAYER",
    title: "LIT Website (Vercel)",
    desc: "Next.js 16 App Router. VoiceShield product page, demo gateway, and request-demo form run on Vercel. Static Server Components for fast LCP.",
    color: "text-cyan-400",
    bg: "border-cyan-500/30",
  },
  {
    icon: Server,
    label: "REAL-TIME DETECTION LAYER",
    title: "VoiceShield FastAPI Backend",
    desc: "Persistent process required for WebSocket connections and PyTorch/TorchScript inference. Runs on a dedicated server (Railway / Render / self-hosted). Not suitable for Vercel serverless.",
    color: "text-violet-400",
    bg: "border-violet-500/30",
  },
  {
    icon: Cpu,
    label: "INFERENCE LAYER",
    title: "AASIST / TorchScript Model",
    desc: "Loaded at startup, warmed up, and held in memory. Feature extraction uses librosa (Python) with optional Rust DSP extension for latency reduction. CPU inference; GPU optional.",
    color: "text-blue-400",
    bg: "border-blue-500/30",
  },
  {
    icon: Database,
    label: "PERSISTENCE LAYER",
    title: "Supabase / PostgreSQL",
    desc: "Shared LIT Supabase project extended with VoiceShield tables (vs_ prefix). Row-Level Security enforced. Sessions, detection events, challenges, and audit logs persisted.",
    color: "text-emerald-400",
    bg: "border-emerald-500/30",
  },
  {
    icon: Cloud,
    label: "INTELLIGENCE LAYER",
    title: "AI Forensic Analysis (THROUGHPUTS)",
    desc: "Asynchronous path only — never in the real-time detection loop. Post-session XAI summary and forensic analysis generated via THROUGHPUTS OpenAI-compatible API.",
    color: "text-amber-400",
    bg: "border-amber-500/30",
  },
] as const;

export default function VoiceShieldArchitecture() {
  return (
    <section
      className="py-24 px-6 relative bg-[rgba(5,10,25,0.8)]"
      aria-labelledby="vs-arch-heading"
    >
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            System Architecture
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2
            id="vs-arch-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight"
          >
            Deployment Architecture
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
            VoiceShield separates real-time deterministic detection from
            asynchronous AI intelligence — each layer independently deployable
            and scalable.
          </p>
        </motion.div>

        <div className="space-y-4">
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassSurface variant="card" className={`p-5 border ${layer.bg}`}>
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/10`}>
                    <layer.icon className={`w-5 h-5 ${layer.color}`} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold tracking-[0.2em] ${layer.color} mb-1 uppercase`}>
                      {layer.label}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{layer.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              </GlassSurface>
              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-zinc-700" aria-hidden />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Deployment boundary note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <GlassSurface variant="subtle" className="p-5">
            <p className="text-xs text-zinc-500 leading-relaxed">
              <strong className="text-zinc-300">Deployment boundary:</strong> The
              LIT website (Next.js) and the VoiceShield backend (FastAPI) are
              deployed as separate services. The FastAPI backend requires a
              persistent runtime — Vercel serverless is not suitable for
              WebSocket-based audio streaming or PyTorch inference. The backend URL
              is configured via <code className="text-cyan-400 text-[11px]">FASTAPI_INFERENCE_URL</code>.
            </p>
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
