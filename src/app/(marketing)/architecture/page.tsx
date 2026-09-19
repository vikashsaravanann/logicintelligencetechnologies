import React from "react";
import { Server, Activity, BrainCircuit, ShieldCheck, Database, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "VoiceShield Architecture | Logic Intelligence Technologies",
  description: "Explore the enterprise-grade infrastructure and ultra-low latency inference engine powering VoiceShield's anti-spoofing technology.",
};

export default function ArchitecturePage() {
  const steps = [
    {
      id: "01",
      title: "Audio Ingestion Node",
      icon: Server,
      desc: "Raw VoIP/WebRTC streams are ingested via secure WebSocket or gRPC endpoints at edge locations to minimize transmission latency to under 20ms globally.",
    },
    {
      id: "02",
      title: "Feature Extraction Pipeline",
      icon: Activity,
      desc: "Audio is segmented into 10ms micro-frames. Mel-frequency cepstral coefficients (MFCCs) and phase perturbations are extracted to expose synthetic anomalies.",
    },
    {
      id: "03",
      title: "Deep Neural Network (DNN)",
      icon: BrainCircuit,
      desc: "Our proprietary AI engine evaluates the acoustic features against known zero-day voice cloning algorithms (e.g., ElevenLabs, VALL-E) with 99.9% precision.",
    },
    {
      id: "04",
      title: "Policy & Risk Enforcement",
      icon: ShieldCheck,
      desc: "A final probabilistic risk score (0-100) is returned to your contact center software, allowing automated call routing, agent alerts, or immediate termination.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15),_transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-16 text-center space-y-4">
          <p className="text-[11px] font-mono font-bold tracking-[0.28em] text-emerald-400 uppercase">
            VoiceShield Internal Systems
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            System Architecture
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Engineered for massive concurrency and ultra-low latency. VoiceShield detects synthetic audio in real-time before the caller finishes their first sentence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group"
            >
              <div className="absolute top-8 right-8 text-5xl font-black text-slate-800/50 group-hover:text-emerald-900/30 transition-colors pointer-events-none">
                {step.id}
              </div>
              
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-6 h-6 text-emerald-400" />
              </div>
              
              <h3 className="text-lg font-mono font-bold tracking-widest text-white uppercase mb-3">
                {step.title}
              </h3>
              
              <p className="text-sm text-slate-400 leading-relaxed pr-8">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-xl font-mono font-bold tracking-widest text-white uppercase flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-400" />
              Enterprise Data Security
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We process audio streams entirely in volatile memory (RAM). Absolutely zero audio data or personally identifiable information (PII) is persisted to disk during analysis, ensuring full GDPR and SOC2 compliance.
            </p>
          </div>
          
          <Link
            href="/docs/api"
            className="shrink-0 inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-emerald-500/50 font-mono font-bold text-xs tracking-[0.15em] uppercase transition-all"
          >
            View API Docs <Database className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
