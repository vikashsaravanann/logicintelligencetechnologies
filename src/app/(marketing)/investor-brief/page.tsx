import React from "react";
import { TrendingUp, BarChart3, Download, LineChart, Target, Rocket } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Investor Brief | Logic Intelligence Technologies",
  description: "Quarterly performance, market positioning, and growth metrics for Logic Intelligence Technologies.",
};

export default function InvestorBriefPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.1),_transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-4">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
              Q3 2026 Briefing
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            Performance & Vision
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            {COMPANY.name} is accelerating its market presence in enterprise AI security, specifically through our flagship VoiceShield infrastructure.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-4" />
            <div className="text-3xl font-black font-mono text-white mb-1">312%</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">YoY ARR Growth</div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <Target className="w-5 h-5 text-emerald-400 mb-4" />
            <div className="text-3xl font-black font-mono text-white mb-1">99.9%</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Detection Accuracy</div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <Rocket className="w-5 h-5 text-emerald-400 mb-4" />
            <div className="text-3xl font-black font-mono text-white mb-1">45+</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Enterprise Deployments</div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <LineChart className="w-5 h-5 text-emerald-400 mb-4" />
            <div className="text-3xl font-black font-mono text-white mb-1">12ms</div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Avg Global Latency</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Text Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-8 shadow-2xl">
              <h2 className="text-xl font-mono font-bold tracking-widest text-white uppercase mb-6 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Market Positioning
              </h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  The surge in generative AI has created an unprecedented vector for cyberattacks, particularly deepfake audio and voice spoofing in financial contact centers. Traditional biometric systems are failing against modern architectures like ElevenLabs and VALL-E.
                </p>
                <p>
                  Our VoiceShield API has established itself as a critical middleware layer for enterprise VoIP stacks. By utilizing our proprietary phase-perturbation detection models, we secure real-time audio streams with mathematically verified precision, effectively protecting billions of dollars in client assets.
                </p>
                <p>
                  Moving into Q4, our primary R&D focus involves expanding our hardware-accelerated edge nodes to reduce cross-continental latency down to single digits, paving the way for autonomous AI defense systems.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar / Downloads */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6">
              <h3 className="text-sm font-mono font-bold tracking-widest text-emerald-400 uppercase mb-6">
                Downloadable Assets
              </h3>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-emerald-500/30 transition-colors group cursor-not-allowed opacity-80">
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold text-slate-200 uppercase mb-1">Q3 2026 Earnings PDF</div>
                    <div className="text-[10px] text-slate-500 font-mono">4.2 MB • Secure</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-emerald-500/30 transition-colors group cursor-not-allowed opacity-80">
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold text-slate-200 uppercase mb-1">VoiceShield Tech Spec</div>
                    <div className="text-[10px] text-slate-500 font-mono">1.8 MB • Public</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 text-center">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                For direct investor inquiries, institutional relations, or to request a prospectus, please contact our financial team.
              </p>
              <Link
                href="/sales"
                className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-slate-800 text-white font-mono font-bold text-[10px] tracking-widest uppercase hover:bg-slate-700 transition-colors"
              >
                Contact Relations
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
