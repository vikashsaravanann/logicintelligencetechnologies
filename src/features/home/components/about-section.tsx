"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/config/company";

export default function AboutSection() {
  const capabilities = [
    "Enterprise-Grade Next.js Applications",
    "Applied AI Systems & Voice Intelligence",
    "Automated Headless RPA Orchestration",
    "High-Performance Cloud Infrastructure",
    "Healthcare & Smart Hospital Platforms",
    "Zero-Trust Security & Schema Validation"
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-transparent border-y border-white/[0.08] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-7"
          >
            <div>
              <span className="lit-eyebrow mb-4 block">Company Identity</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                Where Logic Meets <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
                  Applied Innovation.
                </span>
              </h2>
            </div>
            
            <p className="text-[#B5BECC] text-base sm:text-lg leading-relaxed">
              Logic Intelligence Technologies is an AI technology company headquartered in Coimbatore, Tamil Nadu. We were established to deliver rigorous engineering and genuine AI capability — eliminating opaque pricing, fragile templates, and superficial sales pitches.
            </p>
            <p className="text-[#B5BECC] text-base leading-relaxed">
              Our engineering process is direct: transparent scope, deterministic code, and a functional prototype demonstration before you commit budget. From AI voice assistants to hospital clinical platforms, every system is crafted in-house.
            </p>

            <div className="pt-2 border-t border-white/10">
              <h3 className="text-white font-display font-bold text-base mb-4 tracking-wide uppercase">
                Core Engineering Capabilities
              </h3>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {capabilities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#45D9D2] shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link href="/contact" className="lit-btn lit-btn-primary lit-btn-md">
                Partner With Us
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link href="/about" className="lit-btn lit-btn--secondary lit-btn-md">
                About the Company
              </Link>
            </div>
          </motion.div>

          {/* Visual Architecture Card */}
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative h-[480px] sm:h-[540px] w-full rounded-2xl overflow-hidden bg-[#10131A] border border-white/10 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(69,217,210,0.12),transparent_70%)]" aria-hidden />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#45D9D2]">
                EST. 2026 · COIMBATORE
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono text-zinc-400">
                ACTIVE PRODUCTION
              </span>
            </div>

            {/* Central Schematic Motif */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="w-28 h-28 rounded-full border border-[#45D9D2]/30 bg-[#151922] flex items-center justify-center shadow-[0_0_40px_rgba(69,217,210,0.15)] relative">
                <div className="w-20 h-20 rounded-full border border-[#45D9D2]/50 p-2 overflow-hidden bg-[#07090D]">
                  <Image
                    src={COMPANY.logoIconPath}
                    alt="Logic Intelligence Technologies Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#45D9D2] ring-4 ring-[#10131A]" />
              </div>

              <div className="text-center mt-6">
                <p className="font-display text-lg font-bold text-white tracking-wide">
                  Logic Intelligence Technologies
                </p>
                <p className="text-xs font-mono text-[#45D9D2] mt-1">
                  AI Technology Company & Systems Engineering
                </p>
              </div>
            </div>

            <div className="relative z-10 p-4 rounded-xl bg-[#151922]/90 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-white font-bold truncate">Founder &amp; CEO</p>
                <p className="text-[11px] text-[#B5BECC] truncate">Vikash Saravanan · AI Systems Engineer</p>
              </div>
              <Link
                href="/about/founder"
                className="shrink-0 text-xs font-mono font-bold text-[#45D9D2] hover:underline ml-3 flex items-center gap-1"
              >
                Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
