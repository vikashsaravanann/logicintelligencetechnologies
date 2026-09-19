"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Loader2, Cpu, Shield, UserCheck } from "lucide-react";
import { COMPANY } from "@/config/company";
import GlassSurface from "@/components/ui/glass-surface";

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

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-400 font-mono focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-colors";
  const labelClass =
    "block text-[9px] font-mono font-bold tracking-[0.15em] uppercase text-cyan-100/70 mb-1.5 pl-1";

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8">
      <GlassSurface 
        variant="liquid" 
        className="w-full h-full max-w-[1400px] flex flex-col lg:flex-row overflow-hidden shadow-2xl shadow-cyan-900/20"
      >
        {/* Left Pane - Information (Liquid styling) */}
        <div className="w-full lg:w-[45%] h-full p-6 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-br from-cyan-950/40 to-slate-900/40 relative">
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <ShieldCheck className="w-6 h-6 text-cyan-300" />
            </div>
            
            <div>
              <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-cyan-400 uppercase mb-2">
                Logic Intelligence Technologies
              </p>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4 drop-shadow-md">
                VoiceShield
              </h1>
              <p className="text-sm text-cyan-100/70 leading-relaxed max-w-sm">
                Advanced AI voice security and anti-spoofing intelligence. Protect your enterprise communications in real-time.
              </p>
            </div>

            <div className="hidden sm:grid grid-cols-1 gap-4 pt-4">
              {[
                { icon: Cpu, title: "Sub-250ms Detection", desc: "Real-time stream analysis" },
                { icon: Shield, title: "Zero Audio Retention", desc: "Privacy-first architecture" },
                { icon: UserCheck, title: "Admin Approved", desc: "Gated access only" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <feature.icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{feature.title}</h4>
                    <p className="text-[10px] text-cyan-100/60 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-6 lg:mt-0">
            <Link
              href="/voice-shield"
              className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-400/80 hover:text-cyan-300 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Return to Overview
            </Link>
          </div>
        </div>

        {/* Right Pane - Form (Liquid styling) */}
        <div className="w-full lg:w-[55%] h-full p-6 lg:p-12 flex flex-col justify-center relative bg-black/20">
          
          <div className="w-full max-w-md mx-auto relative z-10">
            {sent ? (
              <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/15 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Request Received</h2>
                <p className="text-xs text-cyan-100/70 leading-relaxed max-w-sm mx-auto">
                  Our team will review your application. If approved, you will receive an encrypted link to access the VoiceShield console.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-cyan-400 mb-4 pb-4 border-b border-white/10">
                  <Lock className="w-3.5 h-3.5" /> Gated Access Request
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="fullName">Full name *</label>
                    <input id="fullName" name="fullName" required value={form.fullName} onChange={onChange} className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="email">Work email *</label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={onChange} className={inputClass} placeholder="john@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="companyName">Company</label>
                    <input id="companyName" name="companyName" value={form.companyName} onChange={onChange} className={inputClass} placeholder="Organisation Ltd" />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="role">Role</label>
                    <input id="role" name="role" value={form.role} onChange={onChange} className={inputClass} placeholder="e.g. CISO, Developer" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" value={form.phone} onChange={onChange} className={inputClass} placeholder="+91 ..." />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="accessType">Access type *</label>
                    <select id="accessType" name="accessType" required value={form.accessType} onChange={onChange} className={inputClass}>
                      <option value="Demo" className="bg-slate-900">Demo</option>
                      <option value="Beta" className="bg-slate-900">Beta programme</option>
                      <option value="Pilot" className="bg-slate-900">Enterprise pilot</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="useCase">Use case</label>
                  <textarea id="useCase" name="useCase" rows={2} value={form.useCase} onChange={onChange} className={inputClass} placeholder="Telephony channel, contact centre..." />
                </div>

                {error && <p className="text-[11px] text-red-400 font-mono mt-1" role="alert">{error}</p>}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-50 font-bold text-xs tracking-wider uppercase backdrop-blur-md transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : <><Lock className="w-4 h-4" /> Submit Application</>}
                  </button>
                </div>
                
                <p className="text-[9px] text-cyan-100/50 text-center leading-relaxed mt-4">
                  Submitting confirms agreement to our privacy terms. The live console is gated and monitored by LIT.
                </p>
              </form>
            )}
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
