"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FreeDemoCTA() {
  return (
    <section className="py-20 md:py-28 bg-[var(--lit-cloud)] relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 md:p-16 rounded-3xl border border-[#1E3A8A] bg-[var(--lit-navy)] shadow-2xl relative overflow-hidden"
        >
          {/* Subtle ambient lighting */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(69,217,210,0.15)_0%,transparent_70%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(21,101,192,0.25)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 text-[var(--lit-cyan)] shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[var(--lit-cyan)] text-[11px] font-mono uppercase tracking-[0.16em] mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lit-cyan)] animate-pulse" />
            Zero-Risk Architecture Validation
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight leading-tight">
            Review Your Working Prototype{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[var(--lit-cyan)]">
              Before Any Financial Commitment.
            </span>
          </h2>

          <p className="font-serif italic text-[var(--lit-cyan)] text-lg mb-4">
            &ldquo;Deterministic software starts with working prototypes.&rdquo;
          </p>

          <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            We architect and build a functional prototype demo tailored to your exact specifications — zero upfront payment required. Submit your project requirements to begin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/free-demo"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[var(--lit-teal)] to-[var(--lit-cyan)] px-8 py-3.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-[var(--lit-navy)] shadow-lg hover:brightness-110 active:translate-y-0.5 transition-all w-full sm:w-auto"
            >
              <span>Request Free Prototype Demo</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              href="/book-consultation"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white hover:bg-white/20 active:translate-y-0.5 transition-all w-full sm:w-auto"
            >
              <span>Book Technical Consultation</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
