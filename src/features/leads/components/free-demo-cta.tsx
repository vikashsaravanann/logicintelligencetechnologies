"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FreeDemoCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#07090D] relative border-t border-white/[0.08] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(69,217,210,0.08),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 md:p-16 rounded-3xl border border-[#45D9D2]/30 bg-[#10131A] shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#45D9D2]/10 border border-[#45D9D2]/25 flex items-center justify-center mx-auto mb-6 text-[#45D9D2]">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <span className="lit-eyebrow mb-4 block">Zero-Risk Validation</span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-6 uppercase tracking-tight leading-tight">
            Review Your Working Prototype{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
              Before Any Financial Commitment.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#B5BECC] mb-10 max-w-2xl mx-auto leading-relaxed">
            We architect and build a functional prototype demo tailored to your exact specifications — zero upfront payment required. Submit your project requirements to begin.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/free-demo" className="lit-btn lit-btn-primary lit-btn-lg w-full sm:w-auto justify-center">
              Request Free Prototype Demo
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link href="/book-consultation" className="lit-btn lit-btn--secondary lit-btn-lg w-full sm:w-auto justify-center">
              Book Technical Consultation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
