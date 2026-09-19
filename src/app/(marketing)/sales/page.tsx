"use client";

import React, { useState } from "react";
import { Briefcase, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { COMPANY } from "@/config/company";
import BackToHome from "@/components/ui/back-to-home";

export default function SalesPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors";
  const labelClass =
    "block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400 mb-2";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <BackToHome />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_left,_rgba(16,185,129,0.08),_transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Context */}
          <div className="space-y-8 lg:pr-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mb-4">
              <Briefcase className="w-8 h-8 text-emerald-400" />
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
              Enterprise Inquiries
            </h1>
            
            <p className="text-base text-slate-400 leading-relaxed">
              Connect with our solutions architecture team to discuss custom deployments, volume pricing, and SOC2-compliant integration strategies for your organization.
            </p>

            <div className="pt-8 space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-1">
                    Rapid Architectural Review
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Our lead engineers respond within 2 hours to evaluate your current stack and propose an integration topology.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-1">
                    Enterprise SLA Guarantees
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Volume contracts include 99.99% uptime guarantees, direct engineering support, and localized edge-node deployment.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Trusted By</p>
              <div className="flex flex-wrap gap-8 opacity-50 grayscale">
                <div className="text-lg font-black tracking-widest uppercase text-white">Acme Corp</div>
                <div className="text-lg font-black tracking-widest uppercase text-white">FinSec</div>
                <div className="text-lg font-black tracking-widest uppercase text-white">GlobalBank</div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="relative">
            {submitted ? (
              <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-10 shadow-2xl h-full flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-6" />
                <h3 className="text-2xl font-mono font-bold tracking-widest text-white uppercase mb-4">
                  Request Received
                </h3>
                <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
                  Thank you for reaching out. A solutions architect from Logic Intelligence Technologies will contact you shortly to schedule an initial technical briefing.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input required type="text" className={inputClass} placeholder="Jane" />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input required type="text" className={inputClass} placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Work Email</label>
                    <input required type="email" className={inputClass} placeholder="jane@company.com" />
                  </div>

                  <div>
                    <label className={labelClass}>Company Size</label>
                    <select required className={inputClass}>
                      <option value="" disabled selected>Select scale...</option>
                      <option value="1-50">1 - 50 Employees</option>
                      <option value="51-200">51 - 200 Employees</option>
                      <option value="201-1000">201 - 1,000 Employees</option>
                      <option value="1000+">1,000+ Employees</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Primary Interest</label>
                    <select required className={inputClass}>
                      <option value="" disabled selected>Select product...</option>
                      <option value="voiceshield">VoiceShield Anti-Spoofing</option>
                      <option value="assistant">Enterprise AI Assistant</option>
                      <option value="consulting">Custom AI Consulting</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Context</label>
                    <textarea 
                      className={inputClass} 
                      rows={4} 
                      placeholder="Briefly describe your current architecture or security challenges..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs tracking-[0.15em] uppercase shadow-lg shadow-emerald-500/25 transition-all mt-4"
                  >
                    Submit Inquiry <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <p className="text-[10px] text-slate-500 text-center font-mono mt-4">
                    By submitting, you agree to our Privacy Policy regarding data processing.
                  </p>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
