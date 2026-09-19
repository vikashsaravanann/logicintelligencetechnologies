"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { COMPANY } from "@/config/company";

const CONSOLE_URL = COMPANY.products.voiceShield.consoleUrl;

/**
 * VoiceShield access request — gated product access.
 * Public never receives the live console URL.
 * Admin notification includes CONSOLE_URL to send only after approval.
 */
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
          ]
            .filter((line) => line !== null)
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

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors";
  const labelClass =
    "block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400 mb-2";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.1),_transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-emerald-500/50 bg-slate-950 shadow-lg shadow-emerald-500/20 mb-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-[11px] font-mono font-bold tracking-[0.28em] text-emerald-400 uppercase">
            Logic Intelligence Technologies
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.12em] text-white uppercase">
            VoiceShield
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            AI voice security & anti-spoofing — a Logic Intelligence Technologies product.
            Request beta or demo access. Console access is issued only after approval.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20">
          {sent ? (
            <div className="text-center space-y-4 py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                Request received
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Thank you. Our team will review your request. If approved, you will receive an email
                with the VoiceShield console link. The live console is not publicly linked.
              </p>
              <Link
                href="/voice-shield"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-emerald-400 hover:text-emerald-300"
              >
                Back to product overview <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-emerald-400 mb-2">
                <Lock className="w-3.5 h-3.5" />
                Restricted product access
              </div>

              <div>
                <label className={labelClass} htmlFor="fullName">
                  Full name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={onChange}
                  className={inputClass}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Work email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  className={inputClass}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className={inputClass}
                    placeholder="+91 …"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="companyName">
                    Company
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={onChange}
                    className={inputClass}
                    placeholder="Organisation"
                    autoComplete="organization"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="role">
                    Role
                  </label>
                  <input
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    className={inputClass}
                    placeholder="e.g. Security lead"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="accessType">
                    Access type *
                  </label>
                  <select
                    id="accessType"
                    name="accessType"
                    required
                    value={form.accessType}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="Demo">Demo</option>
                    <option value="Beta">Beta programme</option>
                    <option value="Pilot">Enterprise pilot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="useCase">
                  Use case
                </label>
                <textarea
                  id="useCase"
                  name="useCase"
                  rows={3}
                  value={form.useCase}
                  onChange={onChange}
                  className={inputClass}
                  placeholder="Telephony channel, BFSI, contact centre, internal security review…"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 font-mono" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs tracking-[0.15em] uppercase shadow-lg shadow-emerald-500/25 disabled:opacity-60 transition-all"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Request access
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                No public self-serve console. Access is issued by Logic Intelligence Technologies
                after review. By submitting you agree to be contacted about VoiceShield.
              </p>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-[10px] font-mono tracking-widest uppercase text-slate-600">
          VoiceShield · A Logic Intelligence Technologies product
        </p>
      </div>
    </div>
  );
}
