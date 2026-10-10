"use client";

import { motion } from 'framer-motion';

export default function PlansHero() {
  return (
    <section
      aria-label="Healthcare plans hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#07090D]"
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1FA9A2, transparent 70%)', transform: 'translate(-50%, -20%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(rgba(69,217,210,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#1FA9A2]/30 bg-[#1FA9A2]/10"
        >
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
            Healthcare Subscriptions
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-6"
        >
          Plans for Every Stage of{' '}
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#45D9D2] via-[#1FA9A2] to-[#1565C0]">
            Healthcare Operations
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
        >
          From independent clinics to large multi-specialty hospital groups, LIT Healthcare
          provides scalable subscription tiers to match your facility&apos;s requirements.
        </motion.p>
      </div>
    </section>
  );
}
