"use client";

import React from "react";
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
      { name: "transitions.dev", role: "Liquid glass motion & transitions" },
    ],
    icon: Code2,
    color: "text-amber-400",
  },
] as const;

export default function VoiceShieldTechnology() {
  return (
    <section
      className="py-24 px-6 relative"
      aria-labelledby="vs-tech-heading"
    >
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
            Technology Stack
          </span>
        </div>

        <div className="mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2
            id="vs-tech-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md"
          >
            Built on production-grade technology
          </h2>
          <p className="text-cyan-50/80 text-base max-w-2xl leading-relaxed">
            VoiceShield is implemented with proven open-source components and
            production-tested infrastructure.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
          {TECH_STACK.map((tech, i) => (
            <GlassSurface key={tech.category} variant="liquid" className="p-6 h-full border-white/5 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <tech.icon className={`w-4 h-4 ${tech.color}`} aria-hidden />
                <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tech.color}`}>
                  {tech.category}
                </span>
              </div>
              <ul className="space-y-3">
                {tech.items.map((item) => (
                  <li key={item.name} className="flex flex-col">
                    <span className="text-xs font-bold text-white/90">{item.name}</span>
                    <span className="text-[11px] text-cyan-100/50 mt-0.5">{item.role}</span>
                  </li>
                ))}
              </ul>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
