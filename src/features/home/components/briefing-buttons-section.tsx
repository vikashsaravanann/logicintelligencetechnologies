"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, BarChart3, Building2 } from "lucide-react";

const ITEMS = [
  {
    href: "/ai",
    title: "LOGIC AI",
    icon: BrainCircuit,
    image: "/assets/logic_ai_bg.jpg",
  },
  {
    href: "/investors",
    title: "INVESTORS",
    icon: BarChart3,
    image: "/assets/investors_bg.jpg",
  },
  {
    href: "/jobs",
    title: "CAREERS",
    icon: Building2,
    image: "/assets/careers_bg.jpg",
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
            {/* Real Image Background */}
            <div className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            
            {/* Vignette Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <div className="mb-auto flex justify-end">
                <div className="rounded-full bg-white/5 p-2 backdrop-blur-sm transition-colors group-hover:bg-white/10">
                  <item.icon className="h-4 w-4 text-white/70 group-hover:text-white" />
                </div>
              </div>
              <p className="mt-1 flex items-center justify-between text-sm md:text-base font-bold uppercase tracking-widest text-white">
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
