"use client";

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function PlansHero() {
  return (
    <section
      aria-label="Healthcare plans hero"
      className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 shadow-2xs"
        >
          <Heart className="w-3.5 h-3.5 text-[#1FA9A2]" aria-hidden />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
            Healthcare Subscriptions · Transparent Pricing
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-[clamp(2.25rem,5vw,4.25rem)] font-bold leading-[1.1] tracking-tight text-[var(--lit-navy,#0B2545)] uppercase mb-6"
        >
          Plans for Every Stage of{' '}
          <span className="block text-[var(--lit-blue,#1565C0)] font-serif italic font-normal normal-case">
            Healthcare Operations
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] max-w-3xl mx-auto leading-relaxed font-normal"
        >
          From independent clinics to large multi-specialty hospital groups, LIT Healthcare
          provides scalable subscription tiers to match your facility&apos;s requirements.
        </motion.p>
      </div>
    </section>
  );
}
