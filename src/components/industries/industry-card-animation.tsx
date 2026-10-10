import React from "react";
import { Building2, ShieldCheck, Cpu, Activity } from "lucide-react";

interface IndustryCardAnimationProps {
  slug: string;
  title: string;
  subtitle: string;
}

const INDUSTRY_STANDARDS: Record<string, { std: string; metric: string; color: string }> = {
  healthcare: { std: "HIPAA / ABDM / FHIR", metric: "14 Active Facilities", color: "text-emerald-400" },
  finance: { std: "SOC-2 / ISO 27001", metric: "Sub-10ms Fraud Check", color: "text-sky-400" },
  logistics: { std: "Real-Time Telemetry", metric: "Route Engine Mesh", color: "text-amber-400" },
  legal: { std: "DPDP Act 2023", metric: "Immutable Audit Log", color: "text-purple-400" },
  manufacturing: { std: "Industrial IoT", metric: "Edge Sensor Telemetry", color: "text-teal-400" },
  retail: { std: "Omnichannel API", metric: "Sub-30ms Catalog Sync", color: "text-indigo-400" },
};

export default function IndustryCardAnimation({
  slug,
  title,
  subtitle,
}: IndustryCardAnimationProps) {
  const info = INDUSTRY_STANDARDS[slug] || {
    std: "Enterprise ISO/IEC",
    metric: "High-Reliability Mesh",
    color: "text-emerald-400",
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border border-[#DFE7EF] bg-[#0B1528] text-white p-4 flex flex-col justify-between group-hover:border-[var(--lit-blue,#1565C0)]/60 transition-colors">
      {/* Subtle Matrix Background */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:14px_14px]" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-sky-400" />
          {subtitle}
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Production Ready
        </span>
      </div>

      {/* Center Animated Metric */}
      <div className="relative z-10 my-1 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">
          Compliance Standard
        </span>
        <span className={`text-xs font-mono font-bold ${info.color} bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg`}>
          {info.std}
        </span>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>India Local Data Residency</span>
        </span>
        <span className="text-sky-400 font-semibold">{info.metric}</span>
      </div>
    </div>
  );
}
