"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BrainCircuit, BarChart3, Building2 } from "lucide-react";

const ITEMS = [
  {
    href: "/ai",
    title: "LOGIC AI",
    subtitle: "Autonomous Architectures",
    icon: BrainCircuit,
    image: "/assets/logic_ai_bg.jpg",
  },
  {
    href: "/investors",
    title: "INVESTORS",
    subtitle: "Growth & Capital Briefing",
    icon: BarChart3,
    image: "/assets/investors_bg.jpg",
  },
  {
    href: "/jobs",
    title: "CAREERS",
    subtitle: "Engineering Positions",
    icon: Building2,
    image: "/assets/jobs/studio-hero.jpg",
  },
] as const;

export default function BriefingButtonsSection() {
  return (
    <section
      aria-label="Briefings and product entry points"
      className="relative bg-transparent py-8 md:py-12 border-y border-white/[0.08]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 sm:grid-cols-3 lg:px-8">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative isolate block h-44 overflow-hidden rounded-2xl border border-white/10 md:h-52 bg-[#10131A] transition-all duration-300 hover:border-[#45D9D2]/40 hover:shadow-[0_10px_30px_rgba(69,217,210,0.1)]"
          >
            {/* Real Image Background */}
            <div className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-75">
              <Image src={item.image} alt="" fill className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 640px) 100vw, 33vw" />
            </div>
            
            {/* Vignette Overlay for maximum text contrast */}
            <div className="absolute inset-0 bg-[#07090D]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/80 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#45D9D2]">
                  {item.subtitle}
                </span>
                <div className="rounded-xl border border-white/10 bg-[#151922]/80 p-2 backdrop-blur-md transition-colors group-hover:border-[#45D9D2]/40 group-hover:bg-[#45D9D2]/10">
                  <item.icon className="h-4 w-4 text-[#B5BECC] group-hover:text-[#45D9D2] transition-colors" />
                </div>
              </div>

              <div>
                <p className="flex items-center justify-between text-base md:text-lg font-bold font-display uppercase tracking-wider text-white">
                  <span>{item.title}</span>
                  <ArrowUpRight className="h-5 w-5 text-[#45D9D2] opacity-80 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
