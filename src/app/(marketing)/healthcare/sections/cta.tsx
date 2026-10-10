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
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0B2545, #0D1628)' }}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(31,169,162,0.12), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(31,169,162,0.10)', border: '1px solid rgba(31,169,162,0.25)' }}
        >
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#1FA9A2]">
            Ready to Get Started?
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          Bring LIT Healthcare to Your Organization
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          Explore the platform directly, review available subscription plans, or reach out to discuss
          your organization&apos;s requirements with the LIT Healthcare team.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4"
        >
          <a
            href={HEALTHCARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white text-sm transition-all min-h-[52px]"
            style={{ background: 'linear-gradient(135deg, #1565C0, #1FA9A2)' }}
          >
            Explore Healthcare Platform
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
          </a>

          <Link
            href="/healthcare/plans"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-sm transition-all min-h-[52px] border"
            style={{ borderColor: 'rgba(69,217,210,0.40)', color: '#45D9D2', background: 'rgba(69,217,210,0.06)' }}
          >
            View Healthcare Plans
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>

          <a
            href={ORG_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-sm transition-all min-h-[52px] border"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#F0F4FF', background: 'rgba(255,255,255,0.04)' }}
          >
            Organization Store
            <ExternalLink className="w-4 h-4 opacity-60" aria-hidden />
          </a>

          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-sm transition-all min-h-[52px] border"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#F0F4FF', background: 'rgba(255,255,255,0.04)' }}
          >
            <MessageSquare className="w-4 h-4" aria-hidden />
            Request a Discussion
          </Link>
        </motion.div>

        {/* Contact note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="text-xs text-slate-500 mt-10"
        >
          For enterprise deployments, custom configurations, or healthcare group inquiries,
          contact us at{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-slate-400 hover:text-white transition-colors">
            {COMPANY.email}
          </a>
        </motion.p>
      </div>
    </section>
  );
}
