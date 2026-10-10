"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Mic,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Terminal,
  Building2,
  Layers,
  MessageSquare,
} from "lucide-react";
import { COMPANY } from "@/config/company";

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
      accent: "text-[var(--lit-blue)]",
      bg: "bg-[var(--lit-light-blue)]",
      border: "border-[#BFDBFE]",
    },
    {
      kicker: "Execution Latency",
      value: "< 120ms P99",
      detail: "Sub-second event routing & voice telemetry",
      icon: Zap,
      accent: "text-[#D97706]",
      bg: "bg-[var(--lit-light-gold)]",
      border: "border-[#FDE68A]",
    },
    {
      kicker: "Risk-Free Model",
      value: "Free Prototype Demo",
      detail: "Working architecture preview before budget commitment",
      icon: ShieldCheck,
      accent: "text-[var(--lit-teal)]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
    },
    {
      kicker: "Engineering Origin",
      value: "Coimbatore, India",
      detail: "Direct founder & systems engineering leadership",
      icon: Building2,
      accent: "text-[#7C3AED]",
      bg: "bg-[var(--lit-light-purple)]",
      border: "border-[#DDD6FE]",
    },
  ];

  return (
    <section
      id="hero"
      aria-label="Logic Intelligence Technologies - Where Logic Meets Innovation"
      className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 bg-gradient-to-b from-[#F0F7FF] via-[#FAFBFF] to-[#FFFFFF] border-b border-[#E2E8F0]"
    >
      {/* Background Soft Ambient Radials */}
      <div
        className="pointer-events-none absolute top-[-100px] right-[-50px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[120px] left-[-80px] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.08)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Main Centered Hero Block */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Logo & Company Name */}
          <div className="inline-flex items-center justify-center gap-2.5 mb-3 px-4 py-1.5 rounded-full border border-[#E2E8F0] bg-white/90 backdrop-blur-md shadow-xs">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white ring-2 ring-[var(--lit-teal)]/30 p-0.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMPANY.logoIconPath}
                alt={`${COMPANY.displayName} logo`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[var(--lit-navy)]">
              {COMPANY.displayName.toUpperCase()}
            </span>
          </div>

          {/* Enterprise Status Badge */}
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--lit-soft-lilac)] bg-[var(--lit-light-purple)] px-3.5 py-1.5 mb-6 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]" />
            </span>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-[#6B21A8]">
              Production AI Architecture · Enterprise Systems
            </span>
          </div>

          {/* Slogan: Where Logic Meets Innovation in One Single Line */}
          <h1 className="font-display text-[clamp(1.25rem,3.4vw,3.75rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-[var(--lit-ink)] mb-6 text-center whitespace-nowrap">
            WHERE LOGIC MEETS{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[#7C3AED]">
              INNOVATION.
            </span>
          </h1>

          {/* Sub-headline & Tagline */}
          <p className="text-lg sm:text-2xl text-[var(--lit-navy)] font-semibold mb-3 max-w-3xl mx-auto leading-snug text-center">
            Deterministic AI Platforms, Autonomous Voice Engines &amp; Smart Hospital Infrastructure.
          </p>

          <p className="text-base sm:text-lg font-serif italic text-[var(--lit-blue)] mb-4 font-normal text-center">
            &ldquo;Connect the data. Understand the workflow. Improve the decision.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[var(--lit-text-muted)] leading-relaxed mb-6 max-w-3xl mx-auto text-center">
            Logic Intelligence Technologies develops high-performance AI systems, connected digital backbones, and enterprise automation software. We replace brittle prompt wrappers with deterministic state machines, typed schemas, and human-in-the-loop oversight. Engineered for clinical hospital facilities, real-time voice operations, and security-critical enterprise environments.
          </p>

          {/* Symmetrical Architecture Metric Chips to Fill Gaps Perfectly */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full mx-auto mb-8">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/90 border border-[#E2E8F0] shadow-xs text-center">
              <span className="text-xs font-mono font-bold text-[var(--lit-blue)]">&lt; 120ms P99</span>
              <span className="text-[10px] text-[var(--lit-text-muted)] uppercase tracking-wider font-mono">Telephony Latency</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/90 border border-[#E2E8F0] shadow-xs text-center">
              <span className="text-xs font-mono font-bold text-[var(--lit-teal)]">14 Active Sites</span>
              <span className="text-[10px] text-[var(--lit-text-muted)] uppercase tracking-wider font-mono">Hospital Clinical OS</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/90 border border-[#E2E8F0] shadow-xs text-center">
              <span className="text-xs font-mono font-bold text-[#7C3AED]">99.4% Biometric</span>
              <span className="text-[10px] text-[var(--lit-text-muted)] uppercase tracking-wider font-mono">Voice Deepfake Gate</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/90 border border-[#E2E8F0] shadow-xs text-center">
              <span className="text-xs font-mono font-bold text-emerald-600">100% Typed</span>
              <span className="text-[10px] text-[var(--lit-text-muted)] uppercase tracking-wider font-mono">Deterministic State</span>
            </div>
          </div>

          {/* High-Impact Conversion Buttons Centered */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-5 w-full mx-auto">
            <Link
              href="#products"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white shadow-md hover:shadow-lg hover:brightness-105 active:translate-y-0.5 transition-all"
            >
              <span>Explore Ecosystem</span>
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/free-demo"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[var(--lit-ink)] shadow-sm hover:border-[var(--lit-blue)] hover:bg-[#F8FAFC] active:translate-y-0.5 transition-all"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 text-[var(--lit-teal)]" aria-hidden="true" />
              <span>Free Prototype Demo</span>
            </Link>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Direct Engineering Assurance Note Centered */}
          <div className="flex items-center justify-center gap-2 mb-10 text-xs text-[var(--lit-text-muted)] font-mono text-center mx-auto">
            <ShieldCheck className="h-4 w-4 text-[var(--lit-teal)] shrink-0" aria-hidden="true" />
            <span>Direct access to AI systems engineering · No sales intermediaries</span>
          </div>

          {/* Interactive Animation & Architecture Console Centered */}
          <div className="w-full max-w-4xl mx-auto text-left mb-6">
            <div className="relative w-full rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[11px] font-mono text-[var(--lit-text-muted)] ml-2 flex items-center gap-1.5 font-medium">
                    <Terminal className="w-3.5 h-3.5 text-[var(--lit-blue)]" /> lit-telemetry.mesh
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>Online · Sub-50ms</span>
                </div>
              </div>

              {/* Console Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("healthcare")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-mono transition-all ${
                    activeTab === "healthcare"
                      ? "bg-white text-[var(--lit-navy)] shadow-sm font-bold border border-[#E2E8F0]"
                      : "text-[var(--lit-text-muted)] hover:text-[var(--lit-ink)] hover:bg-white/50"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[var(--lit-teal)] shrink-0" />
                  <span className="truncate">Healthcare OS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("voice")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-mono transition-all ${
                    activeTab === "voice"
                      ? "bg-white text-[var(--lit-navy)] shadow-sm font-bold border border-[#E2E8F0]"
                      : "text-[var(--lit-text-muted)] hover:text-[var(--lit-ink)] hover:bg-white/50"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-[var(--lit-blue)] shrink-0" />
                  <span className="truncate">Logic Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shield")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-mono transition-all ${
                    activeTab === "shield"
                      ? "bg-white text-[var(--lit-navy)] shadow-sm font-bold border border-[#E2E8F0]"
                      : "text-[var(--lit-text-muted)] hover:text-[var(--lit-ink)] hover:bg-white/50"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                  <span className="truncate">Voice Shield</span>
                </button>
              </div>

              {/* Dynamic Console Content */}
              <div className="min-h-[290px] flex flex-col justify-between">
                {activeTab === "healthcare" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[var(--lit-navy)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--lit-teal)]" />
                        LIT Healthcare Clinical OS
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        HIPAA/ABDM Ready
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">Live Clinical Telemetry</span>
                        <span className="font-mono text-[var(--lit-teal)] font-bold">14 Active Facilities</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">HL7 / FHIR Ingestion Sync</span>
                        <span className="font-mono text-[var(--lit-navy)] font-semibold">42ms Realtime</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">Clinical Triage Queue</span>
                        <span className="font-mono text-emerald-700 font-bold">Zero Backlog</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                      <p className="text-[var(--lit-cyan)]">{`> doctor.session.auth: DR_SARAVANAN_V`}</p>
                      <p>{`> ehr.patient_id: #LIT-8921 [VITALS: STABLE]`}</p>
                      <p className="text-emerald-400">{`> automated_discharge_summary.generate(): OK (200)`}</p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/healthcare"
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[var(--lit-teal)] hover:bg-[#F0FDFA] text-xs font-mono text-[var(--lit-navy)] font-semibold transition-all group"
                      >
                        <span>Inspect Healthcare Architecture</span>
                        <ChevronRight className="w-4 h-4 text-[var(--lit-teal)] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === "voice" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[var(--lit-navy)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--lit-blue)]" />
                        Logic Voice Audio Engine
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-[var(--lit-blue)] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Sub-90ms Telephony
                      </span>
                    </div>

                    {/* Simulated Voice Waveform */}
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">Audio Input Stream</span>
                        <span className="font-mono text-[var(--lit-blue)] font-bold">48kHz WebRTC</span>
                      </div>
                      <div className="h-8 flex items-center justify-center gap-1 px-2">
                        {[40, 65, 80, 45, 90, 70, 30, 85, 100, 60, 40, 75, 95, 50, 65, 85, 45, 70, 30, 60].map(
                          (h, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${h}%` }}
                              className="w-1 rounded-full bg-[var(--lit-blue)] opacity-80"
                            />
                          )
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono text-[var(--lit-text-muted)]">
                        <span>P99 E2E Latency: 88ms</span>
                        <span className="text-emerald-700 font-semibold">Deterministic Tool Call: OK</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                      <p className="text-[var(--lit-cyan)]">{`> speech.transcript: "Book consultation slot for 4 PM"`}</p>
                      <p>{`> tool_call: calendar.schedule(slot="16:00:00+05:30")`}</p>
                      <p className="text-emerald-400">{`> confirmation_speech.synthesize(): 200 OK`}</p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/products/logic-voice"
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[var(--lit-blue)] hover:bg-[#EFF6FF] text-xs font-mono text-[var(--lit-navy)] font-semibold transition-all group"
                      >
                        <span>Inspect Logic Voice Specs</span>
                        <ChevronRight className="w-4 h-4 text-[var(--lit-blue)] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === "shield" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[var(--lit-navy)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                        Voice Shield Audio Firewall
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        Sub-15ms Defense
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">Telephony Inspection</span>
                        <span className="font-mono text-[#7C3AED] font-bold">SIP / WebRTC Inline</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">Deepfake Intercept</span>
                        <span className="font-mono text-emerald-700 font-bold">99.4% Biometric Gate</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--lit-text-muted)]">Audio Retention</span>
                        <span className="font-mono text-[var(--lit-navy)] font-semibold">Zero Disk Storage</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                      <p className="text-[var(--lit-cyan)]">{`> audio.packet_stream: 48kHz PCM`}</p>
                      <p>{`> spectral_phase.analyze(): vocoder_anomaly=0.00%`}</p>
                      <p className="text-emerald-400">{`> verdict: LIVENESS VERIFIED (200 OK)`}</p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/voice-shield"
                        className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#7C3AED] hover:bg-[#FAF5FF] text-xs font-mono text-[var(--lit-navy)] font-semibold transition-all group"
                      >
                        <span>Inspect Voice Shield Architecture</span>
                        <ChevronRight className="w-4 h-4 text-[#7C3AED] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Executive Fact & Telemetry Strip */}
        <div className="mt-14 lg:mt-18 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {telemetryFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.kicker}
                className="relative h-full flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--lit-text-muted)]">
                      {fact.kicker}
                    </span>
                    <div className={`h-8 w-8 rounded-lg ${fact.bg} border ${fact.border} flex items-center justify-center ${fact.accent}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="font-display text-lg sm:text-xl font-bold text-[var(--lit-ink)] mb-1 tracking-tight">
                    {fact.value}
                  </p>
                </div>
                <p className="text-xs text-[var(--lit-text-muted)] leading-relaxed mt-2">
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
            className="inline-flex min-h-[44px] flex-col items-center justify-center gap-1 text-[var(--lit-text-muted)] hover:text-[var(--lit-blue)] transition-colors"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold">
              Scroll to Product Ecosystem
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-[var(--lit-teal)]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
