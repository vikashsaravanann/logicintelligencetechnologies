"use client";

import React, { useState } from "react";
import { Briefcase, ArrowRight, CheckCircle2, ShieldCheck, Zap, Lock, Cpu, Sparkles } from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export default function SalesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companySize: "",
    primaryInterest: "",
    context: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-[#07090D] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors font-sans";
  const labelClass =
    "block text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 mb-2";

  return (
    <PageShell className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Context & Guarantees */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Enterprise Solutions Desk</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight mb-4">
                Enterprise <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
                  Inquiries & Sales
                </span>
              </h1>
              <p className="text-base text-zinc-400 leading-relaxed font-light">
                Connect directly with our solutions engineering team to review custom deployments, private infrastructure options, and SLA guarantees for your organization.
              </p>
            </div>

            {/* Architecture Commitments */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-[#10131A] border border-white/10 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase mb-1">
                    Rapid Architectural Review
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Our lead architects evaluate your stack topology and deliver an integration blueprint within 24 hours.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#10131A] border border-white/10 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase mb-1">
                    Enterprise SLA & Uptime
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Dedicated production contracts include 99.99% uptime guarantees, localized edge inference, and prioritized issue resolution.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Verification Standards (Replacing fake logos per Directive Rule 15) */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Technical Architecture Standards
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#10131A] border border-white/5 text-zinc-300 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>&lt; 200ms P95 Edge</span>
                </div>
                <div className="p-3 rounded-xl bg-[#10131A] border border-white/5 text-zinc-300 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Zero Disk Persistence</span>
                </div>
                <div className="p-3 rounded-xl bg-[#10131A] border border-white/5 text-zinc-300 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>SOC2 & HIPAA Ready</span>
                </div>
                <div className="p-3 rounded-xl bg-[#10131A] border border-white/5 text-zinc-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Deterministic AI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="rounded-3xl border border-cyan-500/30 bg-[#10131A] p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-2xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
                  Inquiry Dispatched
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mb-4">
                  Request Received
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md mx-auto mb-8 font-light">
                  Thank you for reaching out. A solutions architect from Logic Intelligence Technologies will contact you shortly to schedule an initial technical briefing.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-xl border border-white/10 bg-[#07090D] hover:bg-white/[0.06] text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="Marcus"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input
                        required
                        type="text"
                        className={inputClass}
                        placeholder="Vance"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Corporate Email *</label>
                    <input
                      required
                      type="email"
                      className={inputClass}
                      placeholder="marcus@vance.io"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company Scale *</label>
                      <select
                        required
                        className={inputClass}
                        value={form.companySize}
                        onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                      >
                        <option value="" disabled className="bg-[#10131A]">Select scale...</option>
                        <option value="1-50" className="bg-[#10131A]">1 - 50 Employees</option>
                        <option value="51-200" className="bg-[#10131A]">51 - 200 Employees</option>
                        <option value="201-1000" className="bg-[#10131A]">201 - 1,000 Employees</option>
                        <option value="1000+" className="bg-[#10131A]">1,000+ Employees</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Primary Focus *</label>
                      <select
                        required
                        className={inputClass}
                        value={form.primaryInterest}
                        onChange={(e) => setForm({ ...form, primaryInterest: e.target.value })}
                      >
                        <option value="" disabled className="bg-[#10131A]">Select solution...</option>
                        <option value="healthcare" className="bg-[#10131A]">LIT Healthcare Platform</option>
                        <option value="logicvoice" className="bg-[#10131A]">Logic Voice AI Engine</option>
                        <option value="agents" className="bg-[#10131A]">Autonomous AI Agents</option>
                        <option value="custom" className="bg-[#10131A]">Custom Full-Stack Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Technical Requirements & Context</label>
                    <textarea 
                      className={inputClass} 
                      rows={4} 
                      placeholder="Summarize your current systems topology, volume expectations, or compliance criteria..."
                      value={form.context}
                      onChange={(e) => setForm({ ...form, context: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)]"
                  >
                    <span>Submit Enterprise Inquiry</span> <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <p className="text-xs text-zinc-500 text-center font-mono">
                    Protected by NDA standards. We never sell or share prospective enterprise architecture data.
                  </p>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
