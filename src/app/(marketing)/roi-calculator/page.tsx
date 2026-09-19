"use client";

import React, { useState } from "react";
import { Calculator, ShieldCheck, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";

export default function ROICalculator() {
  const [calls, setCalls] = useState(100000);
  const [fraudRate, setFraudRate] = useState(0.005); // 0.5%
  const [lossPerIncident, setLossPerIncident] = useState(5000); // ₹5,000

  const totalCalls = Number(calls) || 0;
  const currentFraudCalls = totalCalls * fraudRate;
  const currentLoss = currentFraudCalls * lossPerIncident;
  
  // VoiceShield metrics (assuming 99.9% detection accuracy)
  const voiceShieldAccuracy = 0.999;
  const preventedLoss = currentLoss * voiceShieldAccuracy;
  const remainingLoss = currentLoss - preventedLoss;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors";
  const labelClass =
    "block text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400 mb-2";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-16">
      <BackToHome />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.1),_transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-emerald-500/50 bg-slate-950 shadow-lg shadow-emerald-500/20 mb-2">
            <Calculator className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-[11px] font-mono font-bold tracking-[0.28em] text-emerald-400 uppercase">
            Logic Intelligence Technologies
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.12em] text-white uppercase">
            VoiceShield ROI
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Calculate your projected annual savings by eliminating synthetic voice fraud, deepfakes, and social engineering attacks in your contact centre.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 h-fit">
            <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Current Exposure
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Monthly Call Volume</label>
                <div className="relative">
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={calls}
                    onChange={(e) => setCalls(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <input 
                      type="number"
                      value={calls}
                      onChange={(e) => setCalls(Number(e.target.value))}
                      className={inputClass + " w-1/2"}
                    />
                    <span className="text-xs text-slate-500 font-mono">Calls / Month</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Voice Fraud Incident Rate (%)</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0.001"
                    max="0.05"
                    step="0.001"
                    value={fraudRate}
                    onChange={(e) => setFraudRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-mono text-emerald-400">{(fraudRate * 100).toFixed(2)}%</span>
                    <span className="text-xs text-slate-500 font-mono">Industry avg: 0.5%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Avg. Loss per Incident</label>
                <div className="relative">
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={lossPerIncident}
                    onChange={(e) => setLossPerIncident(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-mono text-emerald-400">{formatCurrency(lossPerIncident)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-emerald-900/20 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-emerald-400 uppercase mb-8 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                VoiceShield Impact
              </h2>

              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">
                    Current Monthly Fraud Loss
                  </p>
                  <p className="text-3xl font-black text-slate-300 font-mono">
                    {formatCurrency(currentLoss)}
                  </p>
                </div>

                <div className="h-px w-full bg-slate-800/50" />

                <div>
                  <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-emerald-500 mb-2">
                    Projected Monthly Savings
                  </p>
                  <p className="text-5xl sm:text-6xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    {formatCurrency(preventedLoss)}
                  </p>
                </div>
                
                <div className="h-px w-full bg-slate-800/50" />

                <div>
                  <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">
                    Residual Risk Profile
                  </p>
                  <p className="text-lg font-mono text-slate-300">
                    Reduced to {formatCurrency(remainingLoss)} / mo
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on VoiceShield's verified 99.9% detection accuracy against known generative AI cloning models.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/voice-shield"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs tracking-[0.15em] uppercase shadow-lg shadow-emerald-500/25 transition-all"
              >
                Request Enterprise Pilot <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
