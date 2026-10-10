"use client";

import { ShieldCheck, Cpu, Clock, CheckCircle2, Lock, Sparkles } from "lucide-react";

export default function CredentialsStripSection() {
  const assurances = [
    {
      icon: Cpu,
      title: "Full-Stack Architecture",
      subtitle: "Next.js 15 · TypeScript · Python",
    },
    {
      icon: Lock,
      title: "Zero-Trust Security",
      subtitle: "Schema Validation & Row-Level RLS",
    },
    {
      icon: ShieldCheck,
      title: "Risk-Free Prototype",
      subtitle: "Working Demo Before Payment",
    },
    {
      icon: Clock,
      title: "Direct Engineering SLA",
      subtitle: "24-Hour Direct Technical Response",
    },
  ];

  return (
    <section
      aria-label="Enterprise Architectural Assurances"
      className="border-y border-white/[0.08] bg-[#0A0D14] py-6 relative backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {assurances.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl border border-white/5 bg-[#10131A]/60 transition-all duration-300 hover:border-[#45D9D2]/30 hover:bg-[#151922] group"
              >
                <div className="h-9 w-9 rounded-lg bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center shrink-0 text-[#45D9D2] group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-white group-hover:text-[#45D9D2] transition-colors leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#B5BECC] font-mono leading-tight truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
