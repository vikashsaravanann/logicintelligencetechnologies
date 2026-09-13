import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { PRIMARY_CTA } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface FinalCTAProps {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

export function FinalCTA({
  title = "Ready to Build Your Production System?",
  subtitle = "Schedule a technical consultation with our engineering team to discuss architecture, timeline, and deliverables.",
  primaryHref = PRIMARY_CTA.href,
  primaryLabel = PRIMARY_CTA.label,
  secondaryHref = "/contact",
  secondaryLabel = "Contact Engineering",
  className,
}: FinalCTAProps) {
  return (
    <section className={cn("py-20 sm:py-28 relative overflow-hidden", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-[#0a1128]/80 to-[#050814] p-8 sm:p-12 md:p-16 shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-600/15 blur-[100px]" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Engineering Consultation
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(6,182,212,0.3)] text-sm uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4" />
                <span>{primaryLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-sm uppercase tracking-wider"
                >
                  <span>{secondaryLabel}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
