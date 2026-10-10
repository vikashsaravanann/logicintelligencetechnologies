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
  },
  {
    href: "/investors",
    title: "INVESTORS",
    subtitle: "Growth & Capital Briefing",
    desc: "Commercial metrics, TAM & expansion roadmap",
    icon: BarChart3,
    image: "/assets/investors_bg.jpg",
  },
  {
    href: "/jobs",
    title: "CAREERS",
    subtitle: "Engineering Positions",
    desc: "Join systems & AI engineering in Coimbatore",
    icon: Building2,
    image: "/assets/jobs/studio-hero.jpg",
  },
] as const;

export default function BriefingButtonsSection() {
  return (
    <section
      aria-label="Briefings and strategic entry points"
      className="relative bg-[#07090D] py-12 md:py-16 border-y border-white/[0.08]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 sm:px-6 sm:grid-cols-3 lg:px-8">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative isolate block h-48 sm:h-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0E121B] transition-all duration-300 hover:border-[#45D9D2]/40 hover:shadow-[0_15px_35px_rgba(69,217,210,0.12)] hover:-translate-y-1"
          >
            {/* Background Image with smooth zoom on hover */}
            <div className="absolute inset-0 opacity-35 transition-opacity duration-500 group-hover:opacity-55">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            
            {/* Vignette Overlay for maximum text contrast */}
            <div className="absolute inset-0 bg-[#07090D]/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/80 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#45D9D2] font-semibold">
                  {item.subtitle}
                </span>
                <div className="rounded-xl border border-white/10 bg-[#141923]/80 p-2 backdrop-blur-md transition-colors group-hover:border-[#45D9D2]/40 group-hover:bg-[#45D9D2]/10">
                  <item.icon className="h-4 w-4 text-[#B5BECC] group-hover:text-[#45D9D2] transition-colors" />
                </div>
              </div>

              <div>
                <p className="flex items-center justify-between text-lg font-bold font-display uppercase tracking-wider text-white mb-1">
                  <span>{item.title}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#45D9D2] opacity-80 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </p>
                <p className="text-xs text-[#B5BECC] font-mono truncate">
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
