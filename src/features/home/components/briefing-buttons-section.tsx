"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BrainCircuit, BarChart3, Building2 } from "lucide-react";

const ITEMS = [
  {
    href: "/ai",
    title: "LOGIC AI",
    subtitle: "Autonomous Architectures",
    desc: "Deterministic agentic pipelines & model routing",
    icon: BrainCircuit,
    image: "/assets/logic_ai_bg.jpg",
    badgeColor: "text-[var(--lit-cyan)] bg-[#0B2545]/80 border-[#45D9D2]/30",
  },
  {
    href: "/investors",
    title: "INVESTORS",
    subtitle: "Growth & Capital Briefing",
    desc: "Commercial metrics, TAM & expansion roadmap",
    icon: BarChart3,
    image: "/assets/investors_bg.jpg",
    badgeColor: "text-[#FDE68A] bg-[#0B2545]/80 border-[#FDE68A]/30",
  },
  {
    href: "/jobs",
    title: "CAREERS",
    subtitle: "Engineering Positions",
    desc: "Join systems & AI engineering in Coimbatore",
    icon: Building2,
    image: "/assets/jobs/studio-hero.jpg",
    badgeColor: "text-[#DDD6FE] bg-[#0B2545]/80 border-[#DDD6FE]/30",
  },
] as const;

export default function BriefingButtonsSection() {
  return (
    <section
      aria-label="Briefings and strategic entry points"
      className="relative bg-[var(--lit-cloud)] py-12 md:py-16 border-b border-[#E2E8F0]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 sm:px-6 sm:grid-cols-3 lg:px-8">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative isolate block h-52 sm:h-56 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[var(--lit-navy)] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Background Image with smooth zoom on hover */}
            <div className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-55">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover scale-100 group-hover:scale-105 transition-transform duration-750"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>

            {/* Vignette Overlay for maximum text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545] via-[#0B2545]/70 to-[#0B2545]/40" />

            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-mono uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${item.badgeColor}`}>
                  {item.subtitle}
                </span>
                <div className="rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-md transition-colors group-hover:bg-white/20">
                  <item.icon className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
              </div>

              <div>
                <p className="flex items-center justify-between text-lg font-bold font-display uppercase tracking-wider text-white mb-1">
                  <span>{item.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--lit-cyan)] opacity-90 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </p>
                <p className="text-xs text-slate-200 font-mono truncate">
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
