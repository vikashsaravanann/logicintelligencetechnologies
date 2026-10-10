"use client";

import { ShieldCheck, Cpu, Clock, Lock } from "lucide-react";

export default function CredentialsStripSection() {
  const assurances = [
    {
      icon: Cpu,
      title: "Full-Stack Architecture",
      subtitle: "Next.js 15 · TypeScript · Python",
      accent: "text-[var(--lit-blue)]",
      bg: "bg-[var(--lit-light-blue)]",
      border: "border-[#BFDBFE]",
    },
    {
      icon: Lock,
      title: "Zero-Trust Security",
      subtitle: "Schema Validation & Row-Level RLS",
      accent: "text-[#7C3AED]",
      bg: "bg-[var(--lit-light-purple)]",
      border: "border-[#DDD6FE]",
    },
    {
      icon: ShieldCheck,
      title: "Risk-Free Prototype",
      subtitle: "Working Demo Before Payment",
      accent: "text-[var(--lit-teal)]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
    },
    {
      icon: Clock,
      title: "Direct Engineering SLA",
      subtitle: "24-Hour Direct Technical Response",
      accent: "text-[#D97706]",
      bg: "bg-[var(--lit-light-gold)]",
      border: "border-[#FDE68A]",
    },
  ];

  return (
    <section
      aria-label="Enterprise Architectural Assurances"
      className="border-y border-[#E2E8F0] bg-[var(--lit-cloud)] py-6 relative"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {assurances.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#CBD5E1] group"
              >
                <div
                  className={`h-9 w-9 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center shrink-0 ${item.accent} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-[var(--lit-ink)] group-hover:text-[var(--lit-blue)] transition-colors leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[var(--lit-text-muted)] font-mono leading-tight truncate mt-0.5">
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
