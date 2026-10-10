import React from "react";
import { LucideIcon, Cpu, Activity, ShieldCheck } from "lucide-react";

interface ServiceCardAnimationProps {
  slug: string;
  title: string;
  categoryTag: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export default function ServiceCardAnimation({
  slug,
  title,
  categoryTag,
  Icon,
}: ServiceCardAnimationProps) {
  // Generate deterministic latency and tag based on slug
  const latency = 18 + (slug.length * 3) % 25;
  const nodes = 8 + (slug.length * 2) % 12;

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-[#DFE7EF] bg-[#0B1528] text-white p-4 flex flex-col justify-between group-hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-colors">
      {/* Dynamic Animated Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38BDF820_1px,transparent_1px),linear-gradient(to_bottom,#38BDF820_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

      {/* Top Header Row with Icon & Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900/90 border border-slate-700 text-sky-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all shadow-xs">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md shadow-2xs backdrop-blur-sm">
          {categoryTag}
        </span>
      </div>

      {/* Center Animated Schematic Visual */}
      <div className="relative z-10 flex flex-col items-center justify-center my-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            Active System Mesh
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span>{nodes} Topology Nodes</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{latency}ms P99</span>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Deterministic State</span>
        </span>
        <span className="text-sky-400 font-medium">Zero Hallucinations</span>
      </div>
    </div>
  );
}
