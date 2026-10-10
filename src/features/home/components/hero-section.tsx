"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Mic,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Terminal,
  Clock,
  CheckCircle2,
  Building2,
  Cpu,
  Layers,
  MessageSquare,
  Flame,
} from "lucide-react";
import { COMPANY } from "@/config/company";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

type ConsoleTab = "healthcare" | "voice" | "shield";

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<ConsoleTab>("healthcare");
  const wa = `https://wa.me/${COMPANY.whatsappNumber.replace(/\D/g, "")}`;

  const telemetryFacts = [
    {
      kicker: "Flagship Platforms",
      value: "3 Autonomous Engines",
      detail: "LIT Healthcare, Logic Voice, Voice Shield",
      icon: Layers,
    },
    {
      kicker: "Execution Latency",
      value: "< 120ms P99",
      detail: "Sub-second event routing & voice telemetry",
      icon: Zap,
    },
    {
      kicker: "Risk-Free Model",
      value: "Free Prototype Demo",
      detail: "Working architecture preview before budget commitment",
      icon: ShieldCheck,
    },
    {
      kicker: "Engineering Origin",
      value: "Coimbatore, India",
      detail: "Direct founder & systems engineering leadership",
      icon: Building2,
    },
  ];

  return (
    <section
      id="hero"
      aria-label="Logic Intelligence Technologies - Where Logic Meets Innovation"
      className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 bg-[#07090D]"
    >
      {/* Background High-Tech Ambient Grid & Deep Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(69,217,210,0.12),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Main Grid: Left Value Proposition, Right Interactive Console */}
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Heading, Value Props, Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Enterprise Status Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#45D9D2]/30 bg-[#10131A] px-3.5 py-1.5 mb-6 shadow-[0_0_20px_rgba(69,217,210,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45D9D2] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45D9D2]" />
              </span>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-white">
                Production AI Architecture · Enterprise Systems
              </span>
            </div>

            {/* Main Display Headline */}
            <h1 className="font-display text-[clamp(2.35rem,1.5rem+4.8vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white mb-6">
              WHERE LOGIC MEETS{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E2E8F0] to-[#45D9D2]">
                INNOVATION.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-[#F8FAFC] font-semibold mb-3 max-w-2xl leading-snug">
              Deterministic AI Platforms, Autonomous Voice Engines &amp; Smart Hospital Infrastructure.
            </p>

            {/* Value Proposition Body */}
            <p className="text-sm sm:text-base text-[#B5BECC] leading-relaxed mb-8 max-w-xl">
              Logic Intelligence Technologies develops high-performance AI systems, connected digital backbones, and enterprise automation software. We replace brittle prompt wrappers with deterministic state machines, typed schemas, and human-in-the-loop oversight.
            </p>

            {/* High-Impact Conversion Buttons */}
            <div className="flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <Link
                href="#products"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#07090D] shadow-[0_0_25px_rgba(69,217,210,0.35)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_35px_rgba(69,217,210,0.5)] active:translate-y-0.5"
              >
                <span>Explore Ecosystem</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              
              <Link
                href="/free-demo"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 bg-[#10131A] px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white transition-all duration-200 hover:border-[#45D9D2]/50 hover:bg-[#151922] hover:text-[#45D9D2] active:translate-y-0.5"
              >
                <span>Free Prototype Demo</span>
              </Link>

              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-emerald-400 transition-all duration-200 hover:bg-emerald-900/30 hover:border-emerald-400/60"
              >
                <MessageSquare className="mr-2 h-3.5 w-3.5" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Direct Engineering Assurance Note */}
            <div className="flex items-center gap-3 pt-2 text-xs text-[#B5BECC]/80 font-mono">
              <ShieldCheck className="h-4 w-4 text-[#45D9D2] shrink-0" />
              <span>Direct access to AI systems engineering · No sales intermediaries</span>
            </div>
          </div>

          {/* Right Column: Interactive Enterprise Architecture Console */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E121B] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-[11px] font-mono text-[#B5BECC] ml-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#45D9D2]" /> lit-telemetry.mesh
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#45D9D2] bg-[#45D9D2]/10 px-2 py-0.5 rounded-full border border-[#45D9D2]/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2] animate-pulse inline-block" />
                  <span>Online</span>
                </div>
              </div>

              {/* Console Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#141923] border border-white/5 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("healthcare")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                    activeTab === "healthcare"
                      ? "bg-[#1FA9A2] text-[#07090D] shadow-sm font-bold"
                      : "text-[#B5BECC] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Healthcare</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("voice")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                    activeTab === "voice"
                      ? "bg-[#45D9D2] text-[#07090D] shadow-sm font-bold"
                      : "text-[#B5BECC] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Logic Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shield")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                    activeTab === "shield"
                      ? "bg-[#00D2C4] text-[#07090D] shadow-sm font-bold"
                      : "text-[#B5BECC] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Voice Shield</span>
                </button>
              </div>

              {/* Dynamic Console Content */}
              <div className="min-h-[290px] flex flex-col justify-between">
                {activeTab === "healthcare" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1FA9A2]" />
                        LIT Healthcare Clinical OS
                      </span>
                      <span className="text-[10px] font-mono text-[#1FA9A2] bg-[#1FA9A2]/10 border border-[#1FA9A2]/25 px-2 py-0.5 rounded">
                        HIPAA/ABDM Ready
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#141923] border border-white/5 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">Live Clinical Telemetry</span>
                        <span className="font-mono text-[#1FA9A2] font-semibold">14 Active Facilities</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">HL7 / FHIR Ingestion Sync</span>
                        <span className="font-mono text-white">42ms Realtime</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">Clinical Triage Queue</span>
                        <span className="font-mono text-emerald-400">Zero Backlog</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#07090D] border border-white/5 text-[11px] font-mono text-zinc-400 space-y-1">
                      <p className="text-[#1FA9A2]">{`> doctor.session.auth: DR_SARAVANAN_V`}</p>
                      <p>{`> ehr.patient_id: #LIT-8921 [VITALS: STABLE]`}</p>
                      <p className="text-emerald-400">{`> automated_discharge_summary.generate(): OK`}</p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/healthcare"
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#151922] border border-white/10 hover:border-[#1FA9A2]/40 text-xs font-mono text-white transition-all group"
                      >
                        <span>Inspect Healthcare Architecture</span>
                        <ChevronRight className="w-4 h-4 text-[#1FA9A2] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === "voice" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#45D9D2]" />
                        Logic Voice Audio Engine
                      </span>
                      <span className="text-[10px] font-mono text-[#45D9D2] bg-[#45D9D2]/10 border border-[#45D9D2]/25 px-2 py-0.5 rounded">
                        Sub-90ms Telephony
                      </span>
                    </div>

                    {/* Simulated Voice Waveform */}
                    <div className="p-3.5 rounded-xl bg-[#141923] border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">Audio Input Stream</span>
                        <span className="font-mono text-[#45D9D2] font-semibold">48kHz WebRTC</span>
                      </div>
                      <div className="h-8 flex items-center justify-center gap-1 px-2">
                        {[40, 65, 80, 45, 90, 70, 30, 85, 100, 60, 40, 75, 95, 50, 65, 85, 45, 70, 30, 60].map(
                          (h, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${h}%` }}
                              className="w-1 rounded-full bg-[#45D9D2] opacity-80 animate-pulse"
                            />
                          )
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono text-[#B5BECC]">
                        <span>P99 E2E Latency: 88ms</span>
                        <span className="text-emerald-400">Deterministic Tool Call: OK</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#07090D] border border-white/5 text-[11px] font-mono text-zinc-400 space-y-1">
                      <p className="text-[#45D9D2]">{`> speech.transcript: "Book consultation slot for 4 PM"`}</p>
                      <p>{`> tool_call: calendar.schedule(slot="16:00:00+05:30")`}</p>
                      <p className="text-emerald-400">{`> confirmation_speech.synthesize(): 200 OK`}</p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/products/logic-voice"
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#151922] border border-white/10 hover:border-[#45D9D2]/40 text-xs font-mono text-white transition-all group"
                      >
                        <span>Inspect Logic Voice Specs</span>
                        <ChevronRight className="w-4 h-4 text-[#45D9D2] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === "shield" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00D2C4]" />
                        Voice Shield Audio Firewall
                      </span>
                      <span className="text-[10px] font-mono text-[#00D2C4] bg-[#00D2C4]/10 border border-[#00D2C4]/25 px-2 py-0.5 rounded">
                        Sub-15ms Defense
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#141923] border border-white/5 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">Telephony Inspection</span>
                        <span className="font-mono text-[#00D2C4] font-semibold">SIP / WebRTC Inline</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">Deepfake Intercept</span>
                        <span className="font-mono text-emerald-400 font-semibold">99.4% Biometric Gate</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B5BECC]">Audio Retention</span>
                        <span className="font-mono text-white">Zero Disk Storage</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#07090D] border border-white/5 text-[11px] font-mono text-zinc-400 space-y-1">
                      <p className="text-[#00D2C4]">{`> audio.packet_stream: 48kHz PCM`}</p>
                      <p>{`> spectral_phase.analyze(): vocoder_anomaly=0.00%`}</p>
                      <p className="text-emerald-400">{`> verdict: LIVENESS VERIFIED (200 OK)`}</p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/voice-shield"
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#151922] border border-white/10 hover:border-[#00D2C4]/40 text-xs font-mono text-white transition-all group"
                      >
                        <span>Inspect Voice Shield Architecture</span>
                        <ChevronRight className="w-4 h-4 text-[#00D2C4] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Executive Fact & Telemetry Strip */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {telemetryFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.kicker}
                className="relative rounded-2xl border border-white/10 bg-[#0E121B] p-5 transition-all duration-300 hover:border-[#45D9D2]/30 hover:bg-[#141923] shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#45D9D2]">
                    {fact.kicker}
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center text-[#45D9D2]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="font-display text-lg sm:text-xl font-bold text-white mb-1 tracking-tight">
                  {fact.value}
                </p>
                <p className="text-xs text-[#B5BECC] leading-relaxed">
                  {fact.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Scroll Indicator */}
        <div className="mt-10 flex justify-center">
          <a
            href="#products"
            className="inline-flex min-h-[44px] flex-col items-center justify-center gap-1 text-[#B5BECC] hover:text-white transition-colors"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold">
              Scroll to Product Ecosystem
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-[#45D9D2]" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
