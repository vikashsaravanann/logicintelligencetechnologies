"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, MessageSquare } from 'lucide-react';
import { COMPANY } from '@/config/company';

const HEALTHCARE_URL = 'https://healthcare.logicintelligencetechnologies.in';
const ORG_STORE_URL = `${HEALTHCARE_URL}/organization-store`;

export default function HealthcareCTA() {
  return (
    <section
      aria-label="Healthcare call to action"
      className="py-16 sm:py-24 bg-[var(--lit-cloud,#F7F9FC)] border-t border-[var(--lit-border-light,#DFE7EF)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-14 lg:p-16 text-center shadow-xl border border-white/10">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(69,217,210,0.18), transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#45D9D2]/30 bg-[#45D9D2]/10"
            >
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
                Ready to Deploy?
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6"
            >
              Bring LIT Healthcare to{' '}
              <span className="font-serif italic font-normal text-[#45D9D2]">
                Your Organization
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-base sm:text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              Explore the live platform, review subscription tiers and module options, or reach out to discuss
              custom integration with the LIT Healthcare team.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4"
            >
              <a
                href={HEALTHCARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-[#1FA9A2] to-[#45D9D2] text-[var(--lit-navy,#0B2545)] hover:brightness-105 shadow-md min-h-[48px]"
              >
                Explore Healthcare Platform
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
              </a>

              <Link
                href="/healthcare/plans"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[48px] bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                View Healthcare Plans
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
              </Link>

              <a
                href={ORG_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[48px] border border-white/10 text-white/90 hover:text-white bg-white/5 hover:bg-white/10"
              >
                Organization Store
                <ExternalLink className="w-4 h-4 opacity-70" aria-hidden />
              </a>

              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 min-h-[48px] border border-white/10 text-white/90 hover:text-white bg-white/5 hover:bg-white/10"
              >
                <MessageSquare className="w-4 h-4 text-[#45D9D2]" aria-hidden />
                Request a Discussion
              </Link>
            </motion.div>

            {/* Contact note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-xs text-white/60 mt-10"
            >
              For enterprise deployments, custom hospital configurations, or multi-branch inquiries,
              contact us at{' '}
              <a href={`mailto:${COMPANY.email}`} className="text-[#45D9D2] hover:underline underline-offset-4">
                {COMPANY.email}
              </a>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
