"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Layers, Cpu, Globe, GitBranch } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

const TECH_STACK = [
  {
    category: "Detection Engine",
    items: [
      { name: "AASIST", role: "Audio Anti-Spoofing neural network" },
      { name: "TorchScript", role: "Cross-platform PyTorch model serialisation" },
      { name: "librosa", role: "LFCC and mel-spectrogram feature extraction" },
      { name: "Rust DSP", role: "Optional native LFCC acceleration (voiceshield_dsp)" },
    ],
    icon: Cpu,
    color: "text-violet-400",
  },
  {
    category: "Streaming & Transport",
    items: [
      { name: "Web Audio API", role: "Browser-side audio capture" },
      { name: "AudioWorklet", role: "Dedicated real-time audio thread" },
      { name: "WebSocket", role: "Bidirectional audio streaming" },
      { name: "PCM16 @ 16kHz", role: "Audio format for ML inference" },
    ],
    icon: Globe,
    color: "text-cyan-400",
  },
  {
    category: "Backend",
    items: [
      { name: "FastAPI", role: "High-performance async Python framework" },
      { name: "Uvicorn", role: "ASGI server with WebSocket support" },
      { name: "Pydantic v2", role: "Strict request/response validation" },
      { name: "structlog", role: "Structured JSON logging" },
    ],
    icon: Layers,
    color: "text-blue-400",
  },
  {
    category: "Data & Auth",
    items: [
      { name: "Supabase / PostgreSQL", role: "Session, event, and audit persistence" },
      { name: "Row-Level Security", role: "User-level data isolation" },
      { name: "PyJWT", role: "Supabase JWT validation in FastAPI" },
      { name: "httpx", role: "Async HTTP client for external services" },
    ],
    icon: GitBranch,
    color: "text-emerald-400",
  },
  {
    category: "Frontend",
    items: [
      { name: "Next.js 16", role: "LIT platform framework" },
      { name: "React 19", role: "UI rendering" },
      { name: "Tailwind CSS v4", role: "Utility-first styling" },
      { name: "framer-motion", role: "Accessible UI animations" },
    ],
    icon: Code2,
    color: "text-amber-400",
  },
] as const;

export default function VoiceShieldTechnology() {
  return (
    <section
      className="py-24 px-6 relative bg-[rgba(5,10,25,0.7)]"
      aria-labelledby="vs-tech-heading"
    >
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
            Technology Stack
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2
            id="vs-tech-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight"
          >
            Built on production-grade technology
          </h2>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">
            VoiceShield is implemented with proven open-source components and
            production-tested infrastructure.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TECH_STACK.map((tech, i) => (
            <motion.div
              key={tech.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlassSurface variant="card" className="p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <tech.icon className={`w-4 h-4 ${tech.color}`} aria-hidden />
                  <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tech.color}`}>
                    {tech.category}
                  </span>
                </div>
                <ul className="space-y-3">
                  {tech.items.map((item) => (
                    <li key={item.name} className="flex flex-col">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">{item.role}</span>
                    </li>
                  ))}
                </ul>
              </GlassSurface>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
