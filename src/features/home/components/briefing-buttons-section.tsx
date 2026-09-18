"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, BarChart3, Building2 } from "lucide-react";

const ITEMS = [
  {
    href: "/ai-assistant",
    kicker: "Product",
    title: "Knowledge Assistant",
    body: "Private RAG over your documents. Demo on /ai first.",
    icon: BrainCircuit,
    illustration: () => (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-1" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="1" />
          </pattern>
          <radialGradient id="glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-1)" />
        <circle cx="200" cy="100" r="150" fill="url(#glow-1)" />
        {/* Network Nodes */}
        <path d="M150 80L250 120M200 50L250 120M150 80L200 160" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="2" />
        <circle cx="150" cy="80" r="4" fill="#22d3ee" />
        <circle cx="250" cy="120" r="4" fill="#22d3ee" />
        <circle cx="200" cy="50" r="4" fill="#22d3ee" />
        <circle cx="200" cy="160" r="4" fill="#22d3ee" />
      </svg>
    ),
  },
  {
    href: "/investors",
    kicker: "Briefing",
    title: "Investor briefing",
    body: "Operating update. Not a priced round. Walk the live stack.",
    icon: BarChart3,
    illustration: () => (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Abstract Chart */}
        <path d="M0 150C50 150 80 120 130 110C180 100 210 130 260 90C310 50 350 70 400 40L400 200L0 200Z" fill="url(#chart-grad)" />
        <path d="M0 150C50 150 80 120 130 110C180 100 210 130 260 90C310 50 350 70 400 40" stroke="rgba(167, 139, 250, 0.6)" strokeWidth="2" />
        <circle cx="260" cy="90" r="4" fill="#a78bfa" />
        <circle cx="400" cy="40" r="4" fill="#a78bfa" />
        {/* Horizontal Lines */}
        <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    href: "/jobs",
    kicker: "Leadership",
    title: "Jobs — CEO / Directors",
    body: "Employment offers. Not a cheque-for-title.",
    icon: Building2,
    illustration: () => (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow-3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="100" r="150" fill="url(#glow-3)" />
        {/* Concentric Strategic Rings */}
        <ellipse cx="200" cy="100" rx="120" ry="40" stroke="rgba(244, 114, 182, 0.2)" strokeWidth="1" transform="rotate(-15 200 100)" />
        <ellipse cx="200" cy="100" rx="120" ry="40" stroke="rgba(244, 114, 182, 0.2)" strokeWidth="1" transform="rotate(15 200 100)" />
        <ellipse cx="200" cy="100" rx="120" ry="40" stroke="rgba(244, 114, 182, 0.4)" strokeWidth="1" transform="rotate(75 200 100)" />
        <circle cx="200" cy="100" r="20" fill="rgba(244, 114, 182, 0.1)" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="2" />
        <circle cx="200" cy="100" r="4" fill="#f472b6" />
      </svg>
    ),
  },
] as const;

export default function BriefingButtonsSection() {
  return (
    <section
      aria-label="Briefings and product entry points"
      className="relative bg-transparent py-8 md:py-12 border-y border-white/5"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 sm:grid-cols-3 lg:px-8">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative isolate block h-44 overflow-hidden rounded-2xl border border-white/10 md:h-52 bg-[#0D1117] transition-colors hover:border-white/20"
          >
            {/* Custom SVG Background */}
            <div className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
              <item.illustration />
            </div>
            
            {/* Vignette Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <div className="mb-auto flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  {item.kicker}
                </p>
                <div className="rounded-full bg-white/5 p-2 backdrop-blur-sm transition-colors group-hover:bg-white/10">
                  <item.icon className="h-4 w-4 text-white/70 group-hover:text-white" />
                </div>
              </div>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                {item.title}
                <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{item.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
