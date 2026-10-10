import React from "react";
import { Terminal, Code2, Cpu, Activity, ShieldCheck, FileText } from "lucide-react";

interface BlogCardAnimationProps {
  slug: string;
  title: string;
  category: string;
  readingTime: string;
}

export default function BlogCardAnimation({
  slug,
  title,
  category,
  readingTime,
}: BlogCardAnimationProps) {
  // Deterministic technical snippet based on slug
  const specCode =
    slug.includes("voice")
      ? "const wave = await voiceShield.verify({ pcm: stream, maxLatencyMs: 25 });"
      : slug.includes("hospital") || slug.includes("health")
      ? "const clinic = await fhirMesh.route({ facilityId: 14, abdmAuth: token });"
      : slug.includes("ai")
      ? "const response = await neuralEngine.ground({ query, maxDrift: 0.001 });"
      : "const system = await litMesh.dispatch({ state: 'DETERMINISTIC', retries: 0 });";

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-[#DFE7EF] bg-[#0B1528] text-white p-4 flex flex-col justify-between group-hover:border-[var(--lit-blue,#1565C0)]/60 transition-colors">
      {/* Background Matrix Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38BDF820_1px,transparent_1px),linear-gradient(to_bottom,#38BDF820_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-sky-400" />
          {category}
        </span>
        <span className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Peer Reviewed
        </span>
      </div>

      {/* Code Syntax Snippet in Center */}
      <div className="relative z-10 my-1 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-hidden">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-1 border-b border-slate-800/80 pb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="ml-1 text-slate-400">spec://{slug.slice(0, 18)}...</span>
        </div>
        <p className="text-emerald-400 font-semibold truncate">
          {specCode}
        </p>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1 text-slate-300">
          <FileText className="w-3 h-3 text-sky-400" />
          <span>Technical Whitepaper</span>
        </span>
        <span className="text-emerald-400 font-semibold">{readingTime}</span>
      </div>
    </div>
  );
}
