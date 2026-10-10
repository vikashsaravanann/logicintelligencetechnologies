"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Brain,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VoiceScenario {
  id: "briefing" | "code_review" | "safety_gate" | "research";
  tabLabel: string;
  userPrompt: string;
  sttStatus: string;
  sttLatencyMs: number;
  reasoningSteps: string[];
  toolExecuted: string;
  toolArgs: string;
  safetyLevel: "standard" | "confirmation_required" | "autonomous";
  spokenResponse: string;
  waveColor: string;
  waveformPattern: number[];
}

const SCENARIOS: VoiceScenario[] = [
  {
    id: "briefing",
    tabLabel: "Morning Executive Briefing",
    userPrompt: "“Hey Logic, summarize my priorities today, check the 10 AM sprint debrief, and flag any blocked deliverables.”",
    sttStatus: "Neural Acoustic STT // English (India/US)",
    sttLatencyMs: 38,
    reasoningSteps: [
      "Extracted temporal intent: [today, 10:00 AM IST]",
      "Queried Google Calendar & Linear engineering backlog",
      "Identified 3 active sprint tickets & 1 pending contract signoff",
      "Synthesized prioritized vocal action plan with zero hallucinated events",
    ],
    toolExecuted: "calendar.get_schedule() + linear.query_sprint()",
    toolArgs: '{ "range": "today", "team": "core-eng", "include_blockers": true }',
    safetyLevel: "standard",
    spokenResponse:
      "Good morning Vikash. You have 3 priority items today: the 10 AM Sprint debrief, client review for the Cloud Ops pipeline, and 2 pending candidate resumes. The payment infrastructure PR is currently waiting on security audit.",
    waveColor: "#1FA9A2",
    waveformPattern: [25, 70, 45, 95, 30, 85, 60, 100, 40, 90, 50, 75, 30, 80, 20, 60],
  },
  {
    id: "safety_gate",
    tabLabel: "Controlled Tool Execution Gate",
    userPrompt: "“Deploy the new automated billing dunning patch directly to production and notify the operations lead.”",
    sttStatus: "Authenticated Voice Print // Verified User ID",
    sttLatencyMs: 44,
    reasoningSteps: [
      "Detected state-mutating production command: [deploy.production]",
      "Target service: billing-dunning-worker v2.4.1",
      "SAFETY ENFORCEMENT: Mutation exceeds autonomous execution policy",
      "Halted pipeline at authorization checkpoint — awaiting explicit confirmation",
    ],
    toolExecuted: "deploy.stage_mutation() [CONFIRMATION GATE ENGAGED]",
    toolArgs: '{ "env": "production", "service": "billing-dunning", "gate": "manual_approval" }',
    safetyLevel: "confirmation_required",
    spokenResponse:
      "This action mutates production billing services. I have staged deployment ticket #LIT-892 with zero drift, but I require your vocal or biometric confirmation before applying changes to production.",
    waveColor: "#F59E0B",
    waveformPattern: [15, 40, 25, 60, 90, 95, 100, 90, 45, 80, 35, 60, 20, 50, 15, 30],
  },
  {
    id: "code_review",
    tabLabel: "Engineering PR Audit & Memory",
    userPrompt: "“Inspect pull request #142 in the logic-voice repository. Are there any memory leaks in the audio streaming buffer?”",
    sttStatus: "Contextual Code Terminology Parser",
    sttLatencyMs: 41,
    reasoningSteps: [
      "Resolved repository context: vikashsaravanann/logic-voice",
      "Parsed PR diff #142 (WebSocket chunked audio streaming pipeline)",
      "Traced audio ring buffer allocations across concurrent subscriber threads",
      "Detected potential unclosed stream handle in fallback exception block",
    ],
    toolExecuted: "github.inspect_pull_request() + ast.trace_allocations()",
    toolArgs: '{ "repo": "logic-voice", "pr": 142, "focus": "memory_allocation" }',
    safetyLevel: "autonomous",
    spokenResponse:
      "I inspected PR #142. The core audio streaming logic is sound, but I identified one unclosed stream handle in the fallback WebSocket handler at line 84. I’ve drafted a non-invasive fix to release the buffer cleanly.",
    waveColor: "#3B82F6",
    waveformPattern: [30, 60, 40, 80, 50, 90, 70, 85, 45, 95, 35, 75, 25, 65, 15, 45],
  },
  {
    id: "research",
    tabLabel: "Knowledge Synthesis & Research",
    userPrompt: "“What is our measured P99 latency across the voice pipeline, and how does it compare to our 400ms SLA?”",
    sttStatus: "Analytical Intent Extractor",
    sttLatencyMs: 35,
    reasoningSteps: [
      "Extracted target metric: P99 end-to-end voice latency",
      "Aggregated telemetry metrics over the last 10,000 WebSocket sessions",
      "Computed breakdown: STT 42ms + Reasoning 160ms + Neural TTS 180ms",
      "Validated against 400ms SLA target: current P99 is 382ms (passing)",
    ],
    toolExecuted: "telemetry.query_metrics() + sla.compare()",
    toolArgs: '{ "metric": "voice_e2e_p99", "window": "7d", "sla_target_ms": 400 }',
    safetyLevel: "standard",
    spokenResponse:
      "Our current measured P99 latency across all voice sessions is 382 milliseconds, safely below our 400 millisecond SLA limit. Speech recognition averages 42 milliseconds and vocal streaming begins in under 180 milliseconds.",
    waveColor: "#8B5CF6",
    waveformPattern: [20, 50, 35, 75, 45, 85, 65, 95, 40, 80, 55, 70, 30, 65, 20, 40],
  },
];

export default function LogicVoiceConsole() {
  const [selectedId, setSelectedId] = useState<VoiceScenario["id"]>("briefing");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<"idle" | "listening" | "reasoning" | "speaking">("idle");
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(SCENARIOS[0].waveformPattern);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  // Update waveform bars on scenario change
  useEffect(() => {
    setWaveformBars(scenario.waveformPattern);
    setIsPlaying(false);
    setActiveStage("idle");
    if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [selectedId, scenario]);

  // Clean up speech synthesis and timers on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Waveform animation loop when playing
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        setWaveformBars((prev) =>
          prev.map((val) => {
            const delta = (Math.random() - 0.5) * 35;
            return Math.min(100, Math.max(15, Math.round(val + delta)));
          })
        );
      }, 100);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      setWaveformBars(scenario.waveformPattern);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, scenario]);

  const handleTogglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setActiveStage("idle");
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlaying(true);
      setActiveStage("listening");

      // Advance through stages: listening -> reasoning -> speaking
      setTimeout(() => {
        setActiveStage("reasoning");
      }, 1000);

      setTimeout(() => {
        setActiveStage("speaking");

        // Use Web Speech API if supported and not muted
        if (!audioMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(scenario.spokenResponse);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            setIsPlaying(false);
            setActiveStage("idle");
          };
          utterance.onerror = () => {
            setIsPlaying(false);
            setActiveStage("idle");
          };
          window.speechSynthesis.speak(utterance);
        } else {
          // Fallback timer if muted or speech synthesis unavailable
          setTimeout(() => {
            setIsPlaying(false);
            setActiveStage("idle");
          }, 4500);
        }
      }, 2200);
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveStage("idle");
    setWaveformBars(scenario.waveformPattern);
  };

  return (
    <div className="w-full rounded-2xl bg-[#071322] border border-[#162C46] shadow-xl overflow-hidden font-sans text-slate-100">
      {/* Console Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#162C46] bg-[#0A1A2E]/80 backdrop-blur-sm text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1FA9A2] animate-pulse" />
          <span className="font-mono font-bold uppercase tracking-wider text-white">
            LOGIC VOICE · INTERACTIVE REASONING RUNTIME
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold bg-[#1FA9A2]/15 text-[#45D9D2] border border-[#1FA9A2]/30">
            PERSONAL AI OS
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#1FA9A2]" />
            <span>STT 38ms</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>TTS 180ms</span>
          </span>
          <span>·</span>
          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              if (!audioMuted && typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="p-1 rounded hover:bg-[#162C46] text-slate-300 transition-colors"
            title={audioMuted ? "Unmute Voice" : "Mute Voice"}
            aria-label="Toggle Audio Voice"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="p-3 sm:p-4 border-b border-[#162C46] bg-[#050E1A]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedId(sc.id)}
                className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#0E243D] text-white border-[#1FA9A2] shadow-sm ring-1 ring-[#1FA9A2]/40"
                    : "bg-[#071322] text-slate-400 border-[#162C46] hover:bg-[#0A1A2E] hover:text-slate-200"
                }`}
              >
                <div className="font-mono text-[10px] uppercase text-[#45D9D2] tracking-wider mb-0.5">
                  Scenario {SCENARIOS.indexOf(sc) + 1}
                </div>
                <div className="truncate font-medium">{sc.tabLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Waveform & Playback Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Spoken Voice Input Box */}
          <div className="p-4 rounded-xl border border-[#162C46] bg-[#0A1A2E]/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-[#45D9D2] font-semibold uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5 text-[#1FA9A2]" />
                User Spoken Input
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {scenario.sttLatencyMs}ms acoustic capture
              </span>
            </div>
            <p className="text-sm sm:text-base font-serif italic text-white leading-relaxed">
              {scenario.userPrompt}
            </p>
          </div>

          {/* Real-time Dynamic Waveform Canvas / Spectrum Display */}
          <div className="p-5 rounded-xl border border-[#162C46] bg-[#050E1A] space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider">
                Real-Time Voice Spectrum &amp; Audio Stream
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  activeStage === "listening"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : activeStage === "reasoning"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse"
                    : activeStage === "speaking"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {activeStage === "listening"
                  ? "Capturing Speech..."
                  : activeStage === "reasoning"
                  ? "Reasoning & Planning..."
                  : activeStage === "speaking"
                  ? "Vocal Stream Active"
                  : "Console Ready"}
              </span>
            </div>

            {/* Waveform Bars */}
            <div className="h-24 sm:h-28 flex items-center justify-between gap-1.5 px-2 bg-[#030911] rounded-lg border border-[#102237] overflow-hidden">
              {waveformBars.map((height, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-full transition-all duration-150"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isPlaying ? scenario.waveColor : "#203A58",
                    opacity: isPlaying ? 0.9 : 0.45,
                    boxShadow: isPlaying ? `0 0 8px ${scenario.waveColor}44` : "none",
                  }}
                />
              ))}
            </div>

            {/* Interactive Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlayback}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 shadow-sm ${
                    isPlaying
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-[#1FA9A2] hover:bg-[#45D9D2] text-slate-950 font-extrabold"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Halt Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Simulate Voice Interaction</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl border border-[#162C46] bg-[#0A1A2E] hover:bg-[#102237] text-slate-300 transition-colors"
                  title="Reset Simulation"
                  aria-label="Reset simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                <span>Latency SLA: </span>
                <span className="text-emerald-400 font-bold">&lt;400ms Sub-Second</span>
              </div>
            </div>
          </div>

          {/* Synthesized Voice Output */}
          <div className="p-4 rounded-xl border border-[#162C46] bg-[#0A1A2E]/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Logic Voice Vocal Response
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Neural TTS · Natural Tone
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {scenario.spokenResponse}
            </p>
          </div>
        </div>

        {/* Right Column: Reasoning, Tool Execution & Safety Inspection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Multi-Step Reasoning Trace */}
          <div className="p-4 rounded-xl border border-[#162C46] bg-[#050E1A] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#45D9D2] font-semibold uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5 text-[#1FA9A2]" />
                Reasoning &amp; Planning
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Stage Engine</span>
            </div>

            <ol className="space-y-2 text-xs font-mono text-slate-300">
              {scenario.reasoningSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-[#0A1A2E]/60 border border-[#162C46]/50"
                >
                  <span className="w-4 h-4 rounded-full bg-[#1FA9A2]/20 text-[#45D9D2] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Approved Tool Execution Card */}
          <div className="p-4 rounded-xl border border-[#162C46] bg-[#050E1A] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Tool Invocation
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  scenario.safetyLevel === "confirmation_required"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {scenario.safetyLevel === "confirmation_required"
                  ? "Approval Gate Required"
                  : "Approved Tool Boundary"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#030911] border border-[#102237] font-mono text-xs text-slate-300 space-y-1">
              <div className="text-[#45D9D2] font-semibold">{scenario.toolExecuted}</div>
              <div className="text-[11px] text-slate-400 break-all">{scenario.toolArgs}</div>
            </div>
          </div>

          {/* Safety & Controlled Authorization Notice */}
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              scenario.safetyLevel === "confirmation_required"
                ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                : "border-[#162C46] bg-[#0A1A2E]/50 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>Controlled Authorization Guard</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-normal">
              Consequential and state-mutating actions require explicit user confirmation before execution. Logic Voice will never perform unverified actions autonomously.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[#162C46] bg-[#050E1A] text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1FA9A2]" />
          <span>ZERO-LOCKOUT SAFETY ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://logicvoice.logicintelligencetechnologies.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors text-[#45D9D2]"
          >
            <span>Launch Official App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>·</span>
          <a
            href="https://github.com/vikashsaravanann/logic-voice"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>GitHub Repository</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
