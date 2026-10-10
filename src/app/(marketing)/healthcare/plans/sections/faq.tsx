"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'How do I choose the right plan for my organization?',
    a: 'If you operate a single independent clinic with up to 3 doctors and need basic appointments and billing, Clinic Essential is best. For growing clinics with pharmacy needs and more doctors, choose Clinic Professional. Hospitals requiring ward management should select Hospital Standard, while healthcare groups with multiple facilities need Hospital Advanced.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Yes, you can upgrade your subscription tier at any time through the organization settings. Data is seamlessly retained, and the new features will become immediately available to your configured roles.',
  },
  {
    q: 'Are there setup or integration fees?',
    a: 'Subscription prices cover platform access, maintenance, and support. If you require custom data migration from an existing system, legacy record imports, or complex integrations with third-party lab systems, a one-time integration fee may apply.',
  },
  {
    q: 'Is LIT Healthcare available globally?',
    a: 'Currently, LIT Healthcare is optimized for and actively deployed in India. Organizations outside India may contact enterprise sales to discuss regional compliance and deployment feasibility.',
  },
  {
    q: 'What does "Active Pilot" mean?',
    a: 'It means the platform is currently being actively deployed and used by early partners. Features are robust but continuously evolving based on direct operational feedback from clinics and hospitals.',
  },
];

export default function PlansFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-32 relative bg-[#10131A] overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">Everything you need to know about licensing, setup, and scaling.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isOpen
                    ? 'bg-[#151922] border-[#1FA9A2]/40 shadow-lg shadow-black/30'
                    : 'bg-[#151922]/60 border-white/5 hover:border-white/15'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer transition-colors"
                >
                  <span className="text-base font-semibold text-white pr-8">{faq.q}</span>
                  <span className="shrink-0 text-[#45D9D2]">
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
