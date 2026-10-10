"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck, MapPin, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/config/company";

export default function AboutSection() {
  const capabilities = [
    "Enterprise-Grade Next.js Platforms",
    "Applied AI Systems & Voice Intelligence",
    "Automated Headless RPA Orchestration",
    "High-Performance Cloud Infrastructure",
    "Healthcare & Smart Hospital Platforms",
    "Zero-Trust Security & Schema Validation",
  ];

  return (
    <section
      id="about"
      className="py-24 md:py-32 bg-[#07090D] border-y border-white/[0.08] relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 space-y-7"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131A] border border-[#45D9D2]/30 text-[#45D9D2] text-[11px] font-mono uppercase tracking-[0.18em] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45D9D2]" />
                Company Identity &amp; Leadership
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-[1.08] tracking-tight">
                Where Rigorous Logic Meets <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
                  Applied AI Engineering.
                </span>
              </h2>
            </div>
            
            <p className="text-[#B5BECC] text-base sm:text-lg leading-relaxed">
              Logic Intelligence Technologies is an AI technology company headquartered in Coimbatore, Tamil Nadu. We were established to deliver genuine systems engineering — eliminating opaque pricing, fragile templates, and superficial sales pitches.
            </p>
            <p className="text-[#B5BECC] text-sm sm:text-base leading-relaxed">
              Our engineering process is direct: transparent scope, deterministic code, and a functional prototype demonstration before you commit budget. From AI voice assistants to hospital clinical platforms, every system is crafted in-house.
            </p>

            <div className="pt-2 border-t border-white/10">
              <h3 className="text-white font-display font-bold text-xs uppercase tracking-wider text-[#45D9D2] mb-4">
                Core Architectural Competencies
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {capabilities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#45D9D2] shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#07090D] shadow-sm transition-all hover:brightness-110"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-[#10131A] px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white transition-all hover:border-[#45D9D2]/40 hover:bg-[#151922]"
              >
                <span>Company Overview</span>
              </Link>
            </div>
          </motion.div>

          {/* Visual Architecture Card */}
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-5 relative rounded-2xl border border-white/10 bg-[#0E121B] p-6 lg:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
          >
            <div
              className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(69,217,210,0.12),transparent_70%)] pointer-events-none"
              aria-hidden
            />

            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#45D9D2] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> COIMBATORE · TAMIL NADU
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
                ACTIVE PRODUCTION
              </span>
            </div>

            {/* Central Schematic Motif */}
            <div className="relative z-10 flex flex-col items-center justify-center py-10 my-auto text-center">
              <div className="w-24 h-24 rounded-2xl border border-[#45D9D2]/30 bg-[#141923] flex items-center justify-center shadow-[0_0_35px_rgba(69,217,210,0.18)] relative mb-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#07090D] p-1.5 ring-1 ring-[#45D9D2]/30">
                  <Image
                    src={COMPANY.logoIconPath}
                    alt="Logic Intelligence Technologies Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#45D9D2] ring-4 ring-[#0E121B]" />
              </div>

              <p className="font-display text-lg font-bold text-white tracking-wide">
                Logic Intelligence Technologies
              </p>
              <p className="text-xs font-mono text-[#45D9D2] mt-1">
                AI Technology &amp; Systems Engineering Entity
              </p>
            </div>

            {/* Founder Card at Bottom */}
            <div className="relative z-10 p-4 rounded-xl bg-[#141923] border border-white/10 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Vikash Saravanan</p>
                <p className="text-[11px] text-[#B5BECC] font-mono truncate mt-0.5">
                  Founder &amp; AI Systems Engineering Lead
                </p>
              </div>
              <Link
                href="/about/founder"
                className="shrink-0 text-xs font-mono font-bold text-[#45D9D2] hover:underline ml-3 flex items-center gap-1"
              >
                <span>Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
