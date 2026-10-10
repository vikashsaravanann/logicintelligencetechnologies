"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

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
    <section aria-label="Healthcare plans frequently asked questions" className="py-16 sm:py-24 bg-[var(--lit-cloud,#F7F9FC)] border-t border-[var(--lit-border-light,#DFE7EF)] overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden />
            Answers &amp; Clarity
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-4">
            Frequently Asked{' '}
            <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
              Questions
            </span>
          </h2>
          <p className="text-base text-[var(--lit-text-muted,#52677C)]">
            Everything you need to know about licensing, setup, and scaling your hospital operations.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden transition-all duration-200 border ${
                  isOpen
                    ? 'bg-white border-[#1565C0] shadow-md ring-2 ring-[#1565C0]/5'
                    : 'bg-white border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                >
                  <span className="text-base font-semibold text-[var(--lit-navy,#0B2545)] pr-6">
                    {faq.q}
                  </span>
                  <span className={`shrink-0 transition-transform ${isOpen ? 'text-[#1565C0]' : 'text-slate-400'}`}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed border-t border-[var(--lit-border-light,#DFE7EF)] pt-4">
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
