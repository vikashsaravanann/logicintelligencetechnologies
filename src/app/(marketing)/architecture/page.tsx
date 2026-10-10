import React from "react";
import { Server, Activity, BrainCircuit, ShieldCheck, Database, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { COMPANY } from "@/config/company";
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: "Systems Architecture | Logic Intelligence Technologies",
  description: "Explore the enterprise-grade infrastructure and ultra-low latency inference engines powering Logic Intelligence Technologies platforms.",
};

export default function ArchitecturePage() {
  const steps = [
    {
      id: "01",
      title: "Audio & Telemetry Ingestion Node",
      icon: Server,
      desc: "Raw audio streams and clinical telemetry are ingested via secure WebSocket or gRPC endpoints at edge locations to minimize transmission latency to under 20ms globally.",
    },
    {
      id: "02",
      title: "Feature Extraction & Parsing",
      icon: Activity,
      desc: "Input streams are segmented into micro-frames. Spectral coefficients and structured clinical payloads are parsed into validated schema boundaries in memory.",
    },
    {
      id: "03",
      title: "Intelligent Reasoning & Inference",
      icon: BrainCircuit,
      desc: "Our AI engines evaluate features with deterministic safety gates, RAG context synthesis, and state-machine-driven execution models.",
    },
    {
      id: "04",
      title: "Policy & Governance Enforcement",
      icon: ShieldCheck,
      desc: "Structured responses and verified audit logs are transmitted to enterprise workflows, ensuring strict role-based data isolation and zero unauthorized state mutations.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-primary selection:text-slate-950 pt-32 pb-24">
      <BackToHome />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15),_transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-16 text-center space-y-4">
          <p className="text-[11px] font-mono font-bold tracking-[0.28em] text-primary uppercase">
            Logic Intelligence Technologies Systems
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[0.12em] text-white uppercase">
            System Architecture
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Engineered for high concurrency, deterministic safety gates, and low latency across voice intelligence and healthcare platform operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-2xl hover:border-primary/50 hover:bg-slate-900/80 transition-all group"
            >
              <div className="absolute top-8 right-8 text-5xl font-bold text-slate-800/50 group-hover:text-primary/30 transition-colors pointer-events-none">
                {step.id}
              </div>
              
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-6 h-6 text-primary" />
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

        <div className="mt-16 rounded-2xl border border-primary/50 bg-primary/10 backdrop-blur-md p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-xl font-mono font-bold tracking-widest text-white uppercase flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary" />
              Enterprise Data Security
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We process audio streams entirely in volatile memory (RAM). Absolutely zero audio data or personally identifiable information (PII) is persisted to disk during analysis, ensuring architectures designed to support GDPR and SOC2 compliance.
            </p>
          </div>
          
          <Link
            href="/docs/api"
            className="shrink-0 inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-primary/50 font-mono font-bold text-xs tracking-[0.15em] uppercase transition-all"
          >
            View API Docs <Database className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
