"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, BarChart3, Building2 } from "lucide-react";
import {
  LogicAiCardVisual,
  InvestorsCardVisual,
  CareersCardVisual,
} from "./briefing-card-animations";

const ITEMS = [
  {
    href: "/ai",
    title: "LOGIC AI",
    subtitle: "Autonomous Architectures",
    desc: "Deterministic agentic pipelines & model routing",
    icon: BrainCircuit,
    visual: LogicAiCardVisual,
    badgeColor: "text-[var(--lit-cyan)] bg-[#071328]/90 border-[#45D9D2]/40 shadow-sm",
  },
  {
    href: "/investors",
    title: "INVESTORS",
    subtitle: "Growth & Capital Briefing",
    desc: "Commercial metrics, TAM & expansion roadmap",
    icon: BarChart3,
    visual: InvestorsCardVisual,
    badgeColor: "text-[#FDE68A] bg-[#071328]/90 border-[#FDE68A]/40 shadow-sm",
  },
  {
    href: "/jobs",
    title: "CAREERS",
    subtitle: "Engineering Positions",
    desc: "Join systems & AI engineering in Coimbatore",
    icon: Building2,
    visual: CareersCardVisual,
    badgeColor: "text-[#DDD6FE] bg-[#071328]/90 border-[#DDD6FE]/40 shadow-sm",
  },
] as const;

export default function BriefingButtonsSection() {
  return (
    <section
      aria-label="Briefings and strategic entry points"
      className="relative bg-[var(--lit-cloud)] py-12 md:py-16 border-b border-[#E2E8F0]"
    >
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-5 px-5 sm:px-6 sm:grid-cols-3 lg:gap-8 lg:px-8">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative isolate block w-full min-w-0 aspect-auto min-h-[300px] overflow-hidden rounded-[1.65rem] border border-slate-800 bg-[#071328] shadow-md transition-all duration-300 hover:shadow-2xl hover:border-slate-700 hover:-translate-y-1 sm:aspect-[1.12/1] sm:min-h-0"
          >
            {/* Animated Schematic Visual */}
            <item.visual />

            <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
              <div className="flex justify-between items-start">
                <span
                  className={`max-w-[calc(100%-3rem)] rounded-full border px-3 py-2 font-mono text-[9px] font-semibold uppercase leading-relaxed tracking-[0.14em] backdrop-blur-md sm:text-[10px] ${item.badgeColor}`}
                >
                  {item.subtitle}
                </span>
                <div className="rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-md transition-colors group-hover:bg-white/20">
                  <item.icon className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center justify-between gap-3 font-display text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
                  <span>{item.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--lit-cyan)] opacity-90 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </p>
                <p className="max-w-[34rem] whitespace-normal break-words font-mono text-sm leading-relaxed text-slate-300 sm:text-base">
                  {item.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
