"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, Waves, Brain, BarChart3, BellRing, FileText } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

/**
 * How VoiceShield Works — detection pipeline steps.
 * All steps verified from the VoiceShield repository implementation.
 */
const STEPS = [
  {
    num: "01",
    icon: Mic,
    title: "Browser Microphone Capture",
    description:
      "Web Audio API captures the caller's microphone in real time. An AudioWorklet processor runs in a dedicated thread to avoid blocking the main browser thread.",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  {
    num: "02",
    icon: Waves,
    title: "PCM16 Streaming",
    description:
      "Audio is converted to 16-bit PCM at 16 kHz mono, chunked into 333ms segments, and streamed over an authenticated WebSocket connection to the VoiceShield backend.",
    color: "text-blue-400",
    border: "border-blue-500/30",
  },
  {
    num: "03",
    icon: Brain,
    title: "Feature Extraction",
    description:
      "The backend extracts LFCC (Linear Frequency Cepstral Coefficients), mel-spectrograms, and phase inconsistency markers from each audio chunk using librosa and optional Rust DSP acceleration.",
    color: "text-violet-400",
    border: "border-violet-500/30",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "AASIST Inference",
    description:
      "Features pass through the AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention network) model loaded as TorchScript. A sigmoid output produces a spoof probability score from 0 (genuine) to 1 (synthetic).",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    num: "05",
    icon: BellRing,
    title: "Risk Classification & Alerting",
    description:
      "The decision engine classifies the score into low / medium / high risk tiers and suggests an action (monitor / challenge / block). High-risk detections trigger real-time alerts. All events are persisted to the audit database.",
    color: "text-amber-400",
    border: "border-amber-500/30",
  },
  {
    num: "06",
    icon: FileText,
    title: "Forensic Reporting",
    description:
      "After a session or for uploaded recordings, VoiceShield generates a forensic analysis report with timeline slices, splice region detection, explainability markers, and an AI-generated XAI summary.",
    color: "text-rose-400",
    border: "border-rose-500/30",
  },
] as const;

export default function VoiceShieldHow() {
  return (
    <section
      className="py-24 px-6 relative bg-[rgba(10,15,30,0.6)]"
      aria-labelledby="vs-how-heading"
    >
      {/* Subtle gradient separator */}
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div aria-hidden className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
            Detection Architecture
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2
            id="vs-how-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight"
          >
            How{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              VoiceShield
            </span>{" "}
            works
          </h2>
          <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
            A deterministic, latency-sensitive pipeline from microphone to detection result.
            No large language model is in the real-time audio detection loop.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlassSurface
                variant="card"
                className={`p-6 h-full border ${step.border}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className={`font-mono text-xs font-bold ${step.color} opacity-60`}>
                    {step.num}
                  </span>
                  <step.icon className={`w-5 h-5 ${step.color} shrink-0`} aria-hidden />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
              </GlassSurface>
            </motion.div>
          ))}
        </div>

        {/* Pipeline diagram — text-based */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <GlassSurface variant="subtle" className="p-6 overflow-x-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Real-Time Pipeline
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 whitespace-nowrap flex-wrap gap-y-2">
              {[
                "Browser Mic",
                "Web Audio / AudioWorklet",
                "PCM16 @ 16kHz",
                "WebSocket",
                "FastAPI",
                "LFCC Extraction",
                "AASIST / TorchScript",
                "Risk Score",
                "UI Update",
              ].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-300">
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-cyan-600" aria-hidden>→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
