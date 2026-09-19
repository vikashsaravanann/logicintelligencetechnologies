import React from "react";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05),_transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mb-4">
          <Clock className="w-10 h-10 text-emerald-400 animate-pulse" />
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-[0.1em] text-white uppercase">
          {title}
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
          {description}
        </p>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-emerald-500/50 font-mono font-bold text-xs tracking-[0.15em] uppercase transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
