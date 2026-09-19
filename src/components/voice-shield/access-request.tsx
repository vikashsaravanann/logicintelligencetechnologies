"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Lock, CheckCircle2, ArrowRight, Loader2,
  Zap, Activity, Globe, UserCheck, ChevronRight, Cpu,
  Eye, EyeOff
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
          ].filter(Boolean).join("\n"),
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
      className="h-screen w-full flex flex-col bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-hidden"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/20 py-2.5 px-4 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>A LOGIC INTELLIGENCE TECHNOLOGIES PRODUCT | AI SECURITY &amp; VOICE FRAUD INTELLIGENCE</span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#030712]/90 border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href={CONSOLE_URL} className="flex items-center gap-2.5 group shrink-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full border-2 border-emerald-500/60 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:border-emerald-400 transition-all overflow-hidden bg-slate-950">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-[0.12em] text-white uppercase group-hover:text-emerald-300 transition-colors">
                VOICESHIELD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase">
                LIT
              </span>
            </div>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-2">
            <button
              disabled
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-[0.1em] uppercase text-slate-500 bg-slate-900/50 border border-transparent cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" /> Console (Locked)
            </button>
            <Link
              href="/voice-shield"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-[11px] tracking-widest uppercase transition-all border border-slate-800"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Overview
            </Link>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start lg:items-center justify-center px-4 py-4 lg:py-2">
        <div className="w-full max-w-6xl">

          {/* Page header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-900/90 text-xs text-slate-300 font-mono mb-3 backdrop-blur-md">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gated Enterprise Access — Admin Reviewed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Request Console Access
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              VoiceShield is a restricted platform. Submit your application — our team will review and send you a private access link within 24 hours.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

            {/* Left — Info panel */}
            <div className="lg:col-span-2 space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "< 250ms", label: "Latency" },
                  { value: "< 5.4%", label: "EER (G.711)" },
                  { value: "0 BYTES", label: "Audio on disk" },
                  { value: "100%", label: "Audit Logged" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-xl font-extrabold font-mono text-emerald-400">{s.value}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Feature list */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
                  What you get access to
                </h3>
                {[
                  { icon: Activity, label: "Live Demo", desc: "Microphone-based real-time voice scan" },
                  { icon: Cpu, label: "Forensic Lab", desc: "Upload audio files for deep analysis" },
                  { icon: Globe, label: "WebSocket API", desc: "Stream integration documentation" },
                  { icon: UserCheck, label: "Product Brief", desc: "Architecture, compliance, SLA details" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{f.label}</div>
                      <div className="text-[10px] text-slate-400">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance tags */}
              <div className="flex flex-wrap gap-2">
                {["DPDP Act 2023", "CERT-IN", "G.711 / AMR", "Zero Raw Audio Disk"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded bg-slate-900/40 border border-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Form panel */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/20">

                {sent ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Application Submitted</h2>
                      <p className="text-slate-400 leading-relaxed max-w-sm mx-auto text-xs">
                        Our team will review your request. If approved, you will receive an <strong className="text-emerald-400">encrypted private link</strong> to the VoiceShield console at your work email.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Typical response: within 24 hours
                    </div>
                    <Link
                      href="/voice-shield"
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-[10px] tracking-widest uppercase transition-all border border-slate-700"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" /> Return to VoiceShield
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-emerald-400 mb-4 pb-3 border-b border-slate-800">
                      <Lock className="w-3.5 h-3.5" />
                      Gated Access Application
                    </div>

                    <form onSubmit={onSubmit} className="space-y-3">
                      {/* Row 1 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="fullName">
                            Full Name <span className="text-emerald-400">*</span>
                          </label>
                          <input
                            id="fullName" name="fullName" required
                            value={form.fullName} onChange={onChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="email">
                            Work Email <span className="text-emerald-400">*</span>
                          </label>
                          <input
                            id="email" name="email" type="email" required
                            value={form.email} onChange={onChange}
                            placeholder="you@company.com"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="companyName">
                            Organisation
                          </label>
                          <input
                            id="companyName" name="companyName"
                            value={form.companyName} onChange={onChange}
                            placeholder="Organisation Ltd."
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="role">
                            Your Role
                          </label>
                          <input
                            id="role" name="role"
                            value={form.role} onChange={onChange}
                            placeholder="e.g. CISO, CTO, Developer"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="phone">
                            Phone
                          </label>
                          <input
                            id="phone" name="phone"
                            value={form.phone} onChange={onChange}
                            placeholder="+91 ..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="accessType">
                            Access Type <span className="text-emerald-400">*</span>
                          </label>
                          <select
                            id="accessType" name="accessType" required
                            value={form.accessType} onChange={onChange}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all appearance-none cursor-pointer"
                          >
                            <option value="Demo" className="bg-slate-900">Live Demo Access</option>
                            <option value="Beta" className="bg-slate-900">Beta Programme</option>
                            <option value="Pilot" className="bg-slate-900">Enterprise Pilot</option>
                          </select>
                        </div>
                      </div>

                      {/* Use case */}
                      <div>
                        <label className="block text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5" htmlFor="useCase">
                          Intended Use Case
                        </label>
                        <textarea
                          id="useCase" name="useCase" rows={3}
                          value={form.useCase} onChange={onChange}
                          placeholder="Describe your use case: Telephony fraud prevention, BFSI KYC, contact centre security..."
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:outline-none focus:border-emerald-500/60 focus:bg-slate-950 transition-all resize-none"
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          {error}
                        </div>
                      )}

                      {/* Submit */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={busy}
                          className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-mono font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {busy ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing Application...</>
                          ) : (
                            <><Lock className="w-4 h-4" /> Submit Access Request</>
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-600 text-center leading-relaxed font-mono">
                        By submitting, you agree to our privacy terms. The VoiceShield console is gated and access is monitored by Logic Intelligence Technologies. Zero raw audio is stored.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-6 px-6 text-center">
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest flex-wrap">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-500" /> VoiceShield · LIT Product
          </span>
          <span className="text-slate-800">·</span>
          <Link href="/voice-shield" className="hover:text-slate-400 transition-colors">Overview</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
