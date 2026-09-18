"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, BarChart3, Building2 } from "lucide-react";

const ITEMS = [
  {
    href: "/ai-assistant",
    title: "Knowledge Assistant",
    icon: BrainCircuit,
    illustration: () => (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow-ai" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="line-ai" x1="0" y1="0" x2="400" y2="200">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.5)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.1)" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="100" r="150" fill="url(#glow-ai)" />
        <path d="M160 70 C160 50, 240 50, 240 70 C260 90, 260 130, 230 150 C200 170, 170 170, 150 140 C130 110, 140 80, 160 70 Z" stroke="url(#line-ai)" strokeWidth="2" strokeDasharray="6 4" fill="rgba(34, 211, 238, 0.05)" />
        <path d="M200 60 L200 150 M165 90 L235 90 M160 120 L240 120" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
        <circle cx="200" cy="105" r="30" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1" fill="none" />
        <circle cx="200" cy="105" r="4" fill="#22d3ee" />
      </svg>
    ),
  },
  {
    href: "/investors",
    title: "Investor briefing",
    icon: BarChart3,
    illustration: () => (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow-invest" cx="80%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="bar-grad" x1="0" y1="100%" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.1)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.5)" />
          </linearGradient>
        </defs>
        <circle cx="300" cy="80" r="180" fill="url(#glow-invest)" />
        <rect x="100" y="140" width="25" height="40" rx="4" fill="url(#bar-grad)" />
        <rect x="150" y="110" width="25" height="70" rx="4" fill="url(#bar-grad)" />
        <rect x="200" y="90" width="25" height="90" rx="4" fill="url(#bar-grad)" />
        <rect x="250" y="60" width="25" height="120" rx="4" fill="url(#bar-grad)" />
        <rect x="300" y="30" width="25" height="150" rx="4" fill="url(#bar-grad)" />
        <path d="M80 150 C 150 140, 200 90, 320 20" stroke="#a78bfa" strokeWidth="3" fill="none" />
        <circle cx="320" cy="20" r="5" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/jobs",
    title: "Jobs — CEO / Directors",
    icon: Building2,
    illustration: () => (
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow-lead" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="60" r="160" fill="url(#glow-lead)" />
        <path d="M200 60 L200 100 M200 100 L100 140 M200 100 L200 140 M200 100 L300 140" stroke="rgba(244, 114, 182, 0.5)" strokeWidth="2" fill="none" />
        <circle cx="200" cy="60" r="14" fill="#f472b6" />
        <circle cx="200" cy="60" r="22" stroke="rgba(244, 114, 182, 0.4)" strokeWidth="2" fill="none" />
        <rect x="85" y="140" width="30" height="30" rx="8" fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" strokeWidth="1" />
        <rect x="185" y="140" width="30" height="30" rx="8" fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" strokeWidth="1" />
        <rect x="285" y="140" width="30" height="30" rx="8" fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" strokeWidth="1" />
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
              <div className="mb-auto flex justify-end">
                <div className="rounded-full bg-white/5 p-2 backdrop-blur-sm transition-colors group-hover:bg-white/10">
                  <item.icon className="h-4 w-4 text-white/70 group-hover:text-white" />
                </div>
              </div>
              <p className="mt-1 flex items-center justify-between text-lg md:text-xl font-bold uppercase tracking-widest text-white">
                {item.title}
                <ArrowUpRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
