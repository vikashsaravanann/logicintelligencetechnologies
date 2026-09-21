"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Activity,
  Globe,
  UserCheck,
  Cpu,
} from "lucide-react";
import { COMPANY } from "@/config/company";

const CONSOLE_URL = COMPANY.products.voiceShield.consoleUrl;

export default function VoiceShieldAccessRequest() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    role: "",
    useCase: "",
    accessType: "Demo",
  });

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          companyName: form.companyName || undefined,
          projectType: "VoiceShield Access Request",
          description: [
            `Access type: ${form.accessType}`,
            form.role ? `Role: ${form.role}` : null,
            form.useCase ? `Use case: ${form.useCase}` : null,
            "",
            "— Admin action —",
            "Do NOT publish the console publicly.",
            `After approval, email the applicant the console URL: ${CONSOLE_URL}`,
          ]
            .filter(Boolean)
            .join("\n"),
          pageUrl: "/voice-shield/request",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Request failed. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative isolate min-h-[100dvh] lg:h-[100dvh] w-full flex flex-col bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden lg:overflow-hidden"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {/* Opaque base — blocks any ambient/global background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#030712]" aria-hidden />

      <div className="relative z-10 flex flex-col min-h-[100dvh] lg:h-[100dvh]">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/20 py-1.5 lg:py-2.5 px-2 lg:px-4 text-center">
          <div className="inline-flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs font-mono font-medium text-emerald-300">
            <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>A LOGIC INTELLIGENCE TECHNOLOGIES PRODUCT | AI SECURITY</span>
          </div>
        </div>

        <header className="sticky top-0 z-50 w-full bg-[#030712] border-b border-slate-800/80 shadow-2xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-16 flex items-center justify-between gap-2">
            <Link
              href="/voice-shield"
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="relative shrink-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-emerald-500/60 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:border-emerald-400 transition-all overflow-hidden bg-slate-950">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-black tracking-[0.12em] text-white uppercase group-hover:text-emerald-300 transition-colors">
                  VOICESHIELD
                </span>
                <span className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase">
                  LIT
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                disabled
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-[0.1em] uppercase text-slate-500 bg-slate-900/50 border border-transparent cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" /> Console (Locked)
              </button>
              <Link
                href="/voice-shield"
                className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-[9px] sm:text-[11px] tracking-widest uppercase transition-all border border-slate-800"
              >
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-180" />{" "}
                Back
              </Link>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </header>

        <main className="flex-1 flex flex-col px-3 py-3 lg:px-4 lg:py-2 overflow-y-auto lg:overflow-hidden">
          <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-evenly lg:justify-center gap-4 lg:gap-8">
            <div className="text-center shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 lg:px-3.5 lg:py-1.5 rounded-full border border-slate-800 bg-slate-900 text-[9px] lg:text-xs text-slate-300 font-mono mb-1.5 lg:mb-2">
                <Lock className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-emerald-400" />
                <span>Gated Enterprise Access</span>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-1 leading-tight uppercase">
                Request Console Access
              </h1>
              <p className="text-[10px] sm:text-sm lg:text-base text-slate-400 max-w-xl mx-auto leading-relaxed px-2 uppercase tracking-wide">
                VoiceShield is restricted. Submit your application for private
                access.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8 shrink-0">
              <div className="lg:col-span-2 space-y-3 lg:space-y-5">
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 lg:gap-3">
                  {[
                    { value: "Real-time", label: "Detection" },
                    { value: "Async", label: "Forensics" },
                    { value: "Evidence", label: "Structured" },
                    { value: "API", label: "Integration" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-slate-900 border border-slate-800 rounded-lg lg:rounded-2xl p-2 lg:p-4 text-center"
                    >
                      <div className="text-[10px] lg:text-xl font-extrabold font-mono text-emerald-400">
                        {s.value}
                      </div>
                      <div className="text-[7px] lg:text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
                    What you get access to
                  </h3>
                  {[
                    {
                      icon: Activity,
                      label: "Live Demo",
                      desc: "Microphone-based real-time voice scan",
                    },
                    {
                      icon: Cpu,
                      label: "Forensic Lab",
                      desc: "Upload audio files for deep analysis",
                    },
                    {
                      icon: Globe,
                      label: "WebSocket API",
                      desc: "Stream integration documentation",
                    },
                    {
                      icon: UserCheck,
                      label: "Product Brief",
                      desc: "Architecture and security design details",
                    },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <f.icon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {f.label}
                        </div>
                        <div className="text-[10px] text-slate-400">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:flex flex-wrap gap-2">
                  {[
                    "DPDP-aware design",
                    "Configurable retention",
                    "Enterprise API",
                    "Audit-oriented logs",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl lg:rounded-3xl p-3 sm:p-5 lg:p-6 shadow-2xl shadow-emerald-950/20">
                  {sent ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-2 lg:space-y-4 py-4 lg:py-8">
                      <div className="w-10 h-10 lg:w-16 lg:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="w-5 h-5 lg:w-8 lg:h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-base lg:text-xl font-black text-white mb-1 lg:mb-2 uppercase tracking-tight">
                          Application Submitted
                        </h2>
                        <p className="text-slate-400 leading-relaxed max-w-sm mx-auto text-[9px] lg:text-xs px-2">
                          Our team will review your request. If approved, you
                          will receive an{" "}
                          <strong className="text-emerald-400">
                            encrypted private link
                          </strong>{" "}
                          to the VoiceShield console at your work email.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] lg:text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        Typical response: within 24 hours
                      </div>
                      <Link
                        href="/voice-shield"
                        className="mt-2 lg:mt-4 inline-flex items-center gap-1.5 px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg lg:rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-[8px] lg:text-[10px] tracking-widest uppercase transition-all border border-slate-700"
                      >
                        <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 rotate-180" />{" "}
                        Return to VoiceShield
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-emerald-400 mb-2 lg:mb-4 pb-1.5 lg:pb-3 border-b border-slate-800">
                        <Lock className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />
                        Gated Access Application
                      </div>

                      <form onSubmit={onSubmit} className="space-y-1.5 lg:space-y-3">
                        <div className="grid grid-cols-2 gap-2 lg:gap-4">
                          <div>
                            <label
                              className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                              htmlFor="fullName"
                            >
                              Full Name <span className="text-emerald-400">*</span>
                            </label>
                            <input
                              id="fullName"
                              name="fullName"
                              required
                              value={form.fullName}
                              onChange={onChange}
                              placeholder="John Doe"
                              className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 transition-all"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                              htmlFor="email"
                            >
                              Work Email <span className="text-emerald-400">*</span>
                            </label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              value={form.email}
                              onChange={onChange}
                              placeholder="you@company.com"
                              className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:gap-4">
                          <div>
                            <label
                              className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                              htmlFor="companyName"
                            >
                              Organisation
                            </label>
                            <input
                              id="companyName"
                              name="companyName"
                              value={form.companyName}
                              onChange={onChange}
                              placeholder="Organisation Ltd."
                              className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 transition-all"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                              htmlFor="role"
                            >
                              Your Role
                            </label>
                            <input
                              id="role"
                              name="role"
                              value={form.role}
                              onChange={onChange}
                              placeholder="e.g. CISO, CTO"
                              className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:gap-4">
                          <div>
                            <label
                              className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                              htmlFor="phone"
                            >
                              Phone
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              value={form.phone}
                              onChange={onChange}
                              placeholder="+91 ..."
                              className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 transition-all"
                            />
                          </div>
                          <div>
                            <label
                              className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                              htmlFor="accessType"
                            >
                              Access Type{" "}
                              <span className="text-emerald-400">*</span>
                            </label>
                            <select
                              id="accessType"
                              name="accessType"
                              required
                              value={form.accessType}
                              onChange={onChange}
                              className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500/60 transition-all appearance-none cursor-pointer"
                            >
                              <option value="Demo" className="bg-slate-900">
                                Live Demo Access
                              </option>
                              <option value="Beta" className="bg-slate-900">
                                Beta Programme
                              </option>
                              <option value="Pilot" className="bg-slate-900">
                                Enterprise Pilot
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            className="block text-[8px] lg:text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1 lg:mb-1.5"
                            htmlFor="useCase"
                          >
                            Intended Use Case
                          </label>
                          <textarea
                            id="useCase"
                            name="useCase"
                            rows={2}
                            value={form.useCase}
                            onChange={onChange}
                            placeholder="Describe your intended use..."
                            className="w-full px-2 py-1.5 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl bg-slate-950 border border-slate-800 text-[10px] lg:text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 transition-all resize-none"
                          />
                        </div>

                        {error && (
                          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] lg:text-xs text-red-300 font-mono">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={busy}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 lg:py-3.5 rounded-lg lg:rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-mono font-black text-[10px] lg:text-xs tracking-[0.15em] uppercase transition-all"
                        >
                          {busy ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Submitting…
                            </>
                          ) : (
                            <>
                              Submit Access Request{" "}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <p className="text-center text-[8px] lg:text-[10px] text-slate-500 font-mono uppercase tracking-wider pt-1">
                          Admin-reviewed · Console URL sent only after approval
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
