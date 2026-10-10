"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
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
      className="py-24 md:py-32 bg-[var(--lit-cloud)] border-b border-[#E2E8F0] relative overflow-hidden"
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--lit-light-blue)] border border-[#BFDBFE] text-[var(--lit-blue)] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-blue)]" />
                Company Identity &amp; Leadership
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[var(--lit-ink)] leading-[1.08] tracking-tight">
                Where Rigorous Logic Meets <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lit-blue)] via-[var(--lit-teal)] to-[#7C3AED]">
                  Applied AI Engineering.
                </span>
              </h2>

              <p className="font-serif italic text-[var(--lit-blue)] text-lg mt-3">
                &ldquo;Engineering truth over marketing hype.&rdquo;
              </p>
            </div>

            <p className="text-[var(--lit-text-muted)] text-base sm:text-lg leading-relaxed">
              Logic Intelligence Technologies is an AI technology company headquartered in Coimbatore, Tamil Nadu. We were established to deliver genuine systems engineering — eliminating opaque pricing, fragile templates, and superficial sales pitches.
            </p>
            <p className="text-[var(--lit-text-muted)] text-sm sm:text-base leading-relaxed">
              Our engineering process is direct: transparent scope, deterministic code, and a functional prototype demonstration before you commit budget. From AI voice assistants to hospital clinical platforms, every system is crafted in-house.
            </p>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <h3 className="text-[var(--lit-navy)] font-display font-bold text-xs uppercase tracking-wider mb-4">
                Core Architectural Competencies
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {capabilities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--lit-teal)] shrink-0" aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium text-[var(--lit-ink)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[var(--lit-blue)] to-[var(--lit-teal)] px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all hover:brightness-105"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[var(--lit-ink)] transition-all hover:bg-[#F8FAFC]"
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
            className="lg:col-span-5 relative rounded-2xl border border-[#E2E8F0] bg-white p-6 lg:p-8 flex flex-col justify-between shadow-sm"
          >
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--lit-blue)] font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--lit-teal)]" /> COIMBATORE · TAMIL NADU
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                HQ Operations
              </span>
            </div>

            <div className="py-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <p className="text-xs font-mono text-[var(--lit-text-muted)] uppercase tracking-wider font-semibold">
                  Legal Corporate Entity
                </p>
                <p className="text-sm font-bold text-[var(--lit-navy)]">
                  {COMPANY.legalName}
                </p>
                <p className="text-xs text-[var(--lit-text-muted)] font-mono">
                  CIN/Reg: Registered Technology Enterprise
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <p className="text-xs font-mono text-[var(--lit-text-muted)] uppercase tracking-wider font-semibold">
                  Founder &amp; Engineering Desk
                </p>
                <p className="text-sm font-bold text-[var(--lit-navy)]">
                  {COMPANY.founder.name}
                </p>
                <p className="text-xs text-[var(--lit-text-muted)]">
                  {COMPANY.founder.title} · Systems Architect
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--lit-ink)] font-semibold">
                  <span>Code Ownership &amp; IP</span>
                  <span className="text-emerald-700">100% Client Vesting</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-[var(--lit-ink)] font-semibold">
                  <span>Subcontracting Policy</span>
                  <span className="text-[var(--lit-blue)]">Zero Third-Party</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono text-[var(--lit-text-muted)]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[var(--lit-teal)]" /> Direct Founder Oversight
              </span>
              <span className="text-emerald-700 font-bold">Verified</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
