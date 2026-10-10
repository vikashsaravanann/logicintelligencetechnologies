"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Play, Pause, RefreshCw, Radio, CheckCircle2, AlertTriangle, Lock } from "lucide-react";

interface ThreatScenario {
  id: "deepfake" | "human" | "challenge";
  name: string;
  badge: string;
  badgeType: "danger" | "safe" | "info";
  callerLabel: string;
  targetVictim: string;
  spoofScore: number;
  confidence: number;
  latencyMs: number;
  protocol: string;
  verdict: string;
  actionTaken: string;
  telemetryNotes: string[];
  waveColor: string;
  waveformPattern: number[];
}

const SCENARIOS: ThreatScenario[] = [
  {
    id: "deepfake",
    name: "Synthetic Voice Clone Attack",
    badge: "AI THREAT INTERCEPTED",
    badgeType: "danger",
    callerLabel: "Inbound SIP Trunk // Cloned Executive Voice",
    targetVictim: "Treasury Desk ($450,000 Wire Request)",
    spoofScore: 98.7,
    confidence: 99.4,
    latencyMs: 12.8,
    protocol: "SIP / G.711 Telephony",
    verdict: "FRAUDULENT SYNTHETIC CLONE DETECTED",
    actionTaken: "Audio pipe instantly severed in-band. Telemetry payload dispatched to SecOps SIEM.",
    telemetryNotes: [
      "Vocoder spectral phase discontinuity detected at 3.42 kHz",
      "Absence of human glottal aerodynamic turbulence",
      "Zero-shot neural TTS model fingerprint matched (StyleTTS2 / ElevenLabs artifact)",
      "Zero biometric hash retention — processed exclusively in RAM"
    ],
    waveColor: "#EF4444",
    waveformPattern: [15, 85, 30, 95, 20, 100, 45, 90, 25, 98, 35, 88, 20, 95, 10, 80]
  },
  {
    id: "human",
    name: "Verified Human Speaker",
    badge: "BIOMETRICALLY VERIFIED",
    badgeType: "safe",
    callerLabel: "Inbound PBX // Registered Executive VP",
    targetVictim: "Standard ERP Internal Authorization",
    spoofScore: 0.8,
    confidence: 99.8,
    latencyMs: 14.1,
    protocol: "WebRTC / Opus HD Audio",
    verdict: "AUTHENTIC BIOMETRIC LIVENESS CONFIRMED",
    actionTaken: "Stream routed with cryptographic biometric trust token into core IVR queue.",
    telemetryNotes: [
      "Natural micro-laryngeal tremor and jitter within organic human parameters",
      "Dynamic harmonic resonance matches enrolled acoustic voice print",
      "Sub-ambient background acoustic room reflection verified",
      "Zero-latency streaming passthrough without audio stutter"
    ],
    waveColor: "#00D2C4",
    waveformPattern: [30, 50, 40, 65, 55, 70, 60, 75, 65, 60, 50, 45, 35, 30, 25, 20]
  },
  {
    id: "challenge",
    name: "Acoustic Liveness Challenge",
    badge: "ZERO-SHOT CHALLENGE TEST",
    badgeType: "info",
    callerLabel: "Telephony Gateway // Unenrolled Caller",
    targetVictim: "LIT Healthcare Prescription Line",
    spoofScore: 1.4,
    confidence: 99.1,
    latencyMs: 13.5,
    protocol: "SRTP / Encrypted VoIP",
    verdict: "LIVENESS CHALLENGE PASSED",
    actionTaken: "Phonemic challenge-response validated in real time without human caller pause.",
    telemetryNotes: [
      "Ephemeral phonemic challenge frequency verified during conversational turn-taking",
      "Zero-replay attack verified against 10M-token neural audio memory",
      "Complies with DPDP Act 2023 & HIPAA biometric privacy standards",
      "Zero raw voice recordings written to persistent disk"
    ],
    waveColor: "#38BDF8",
    waveformPattern: [20, 40, 70, 30, 80, 50, 90, 60, 40, 70, 50, 85, 45, 60, 30, 25]
  }
];

export default function AudioThreatSimulator() {
  const [activeId, setActiveId] = useState<"deepfake" | "human" | "challenge">("deepfake");
  const [isPlaying, setIsPlaying] = useState(true);
  const [pulseTick, setPulseTick] = useState(0);

  const current = SCENARIOS.find((s) => s.id === activeId) || SCENARIOS[0];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0B0F17]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Background glow matching active state */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] transition-all duration-700 opacity-20"
        style={{ backgroundColor: current.waveColor }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Interactive Threat Console
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Voice Shield In-Band Telephony Firewall
            </h3>
          </div>
        </div>

        {/* Play/Pause & Reset controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Signal</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stream Live</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPulseTick(0)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-all"
            title="Reset telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-6">
        {SCENARIOS.map((s) => {
          const isSelected = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? "bg-white/[0.08] border-primary/50 shadow-lg shadow-primary/5"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className={isSelected ? "text-primary font-bold" : "text-slate-400"}>
                  {s.id.toUpperCase()}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    s.badgeType === "danger"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : s.badgeType === "safe"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  }`}
                >
                  {s.badge}
                </span>
              </div>
              <div className="text-sm font-semibold text-white tracking-tight">{s.name}</div>
            </button>
          );
        })}
      </div>

      {/* Live Waveform & Spectral Phase Analysis Visualization */}
      <div className="mt-6 rounded-xl border border-white/10 bg-[#06080D] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Activity className="w-4 h-4 text-primary" />
            <span>SPECTRAL WAVEFORM & PHASE ANALYSIS</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            SAMPLING: <span className="text-white">48kHz PCM</span>{" // "}BUFFER: <span className="text-primary">{current.latencyMs}ms</span>
          </div>
        </div>

        {/* Dynamic Waveform Bars */}
        <div className="h-24 flex items-end justify-between gap-1.5 px-2 py-2 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
          {current.waveformPattern.map((baseHeight, idx) => {
            // modulate height based on pulseTick if playing
            const dynamicModifier = isPlaying
              ? Math.sin((pulseTick + idx * 8) * 0.25) * 20
              : 0;
            const computedHeight = Math.max(10, Math.min(100, baseHeight + dynamicModifier));

            return (
              <div
                key={idx}
                className="flex-1 rounded-sm transition-all duration-150 relative group"
                style={{
                  height: `${computedHeight}%`,
                  backgroundColor: current.waveColor,
                  opacity: 0.35 + (computedHeight / 100) * 0.65,
                  boxShadow: computedHeight > 70 ? `0 0 12px ${current.waveColor}` : "none"
                }}
              />
            );
          })}
        </div>

        {/* Telemetry Readouts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-slate-400 text-[10px] uppercase">Spoof Likelihood</div>
            <div
              className="text-base font-bold mt-0.5"
              style={{ color: current.spoofScore > 50 ? "#EF4444" : "#10B981" }}
            >
              {current.spoofScore}%
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-slate-400 text-[10px] uppercase">Confidence Score</div>
            <div className="text-base font-bold text-white mt-0.5">
              {current.confidence}%
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-slate-400 text-[10px] uppercase">Inspection Latency</div>
            <div className="text-base font-bold text-primary mt-0.5">
              {current.latencyMs} ms
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="text-slate-400 text-[10px] uppercase">Channel Protocol</div>
            <div className="text-base font-bold text-sky-400 mt-0.5 truncate">
              {current.protocol}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Engine Breakdown */}
      <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
        <div className="flex items-start gap-3">
          {current.badgeType === "danger" ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Firewall Verdict & Autonomous Action
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {current.verdict}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {current.actionTaken}
            </p>
          </div>
        </div>

        {/* Forensic checklist points */}
        <div className="pt-3 border-t border-white/5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Acoustic Telemetry Logs (Zero Storage Memory):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {current.telemetryNotes.map((note, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
