"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Heart, Building2, Users, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { COMPANY } from '@/config/company';

const HEALTHCARE_URL = 'https://healthcare.logicintelligencetechnologies.in';

const stats = [
  { icon: Building2, label: 'Organization Types', value: '4+', desc: 'Clinics to Multi-Hospital Groups', color: 'text-[#1565C0]', bg: 'bg-[#E7F3FF]' },
  { icon: Users, label: 'Role Workspaces', value: '8+', desc: 'Dedicated per staff discipline', color: 'text-[#0E7A74]', bg: 'bg-[#1FA9A2]/10' },
  { icon: LayoutDashboard, label: 'Core Modules', value: '10+', desc: 'Unified clinical operations', color: 'text-[#7C3AED]', bg: 'bg-[#F1ECFF]' },
  { icon: ShieldCheck, label: 'Platform Status', value: 'In Pilot', desc: 'Active facility deployment', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]' },
];

export default function HealthcareHero() {
  return (
    <section
      aria-label="LIT Healthcare hero"
      className="relative overflow-hidden pt-4 sm:pt-8 pb-12"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">

          {/* Product badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 shadow-2xs"
          >
            <Heart className="w-3.5 h-3.5 text-[#1FA9A2]" aria-hidden />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
              LIT Healthcare · A Logic Intelligence Technologies Product
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-bold leading-[1.08] tracking-tight text-[var(--lit-navy,#0B2545)] uppercase"
          >
            Smart Hospital Management{' '}
            <span className="block text-[var(--lit-blue,#1565C0)] font-serif italic font-normal normal-case">
              &amp; Clinical Intelligence
            </span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] max-w-3xl leading-relaxed font-normal"
          >
            A connected healthcare operations platform for clinics, multispecialty clinics, hospitals, and healthcare groups.
            Role-based workspaces, facility-aware data isolation, and structured clinical workflows — engineered in one robust system.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2"
          >
            <a
              href={HEALTHCARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-xs uppercase tracking-wider bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] transition-all shadow-sm min-h-[48px]"
            >
              <span>Explore Healthcare Platform</span>
              <ExternalLink className="w-4 h-4 text-[#45D9D2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
            </a>

            <Link
              href="/healthcare/plans"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-[var(--lit-navy,#0B2545)] border border-[#DFE7EF] bg-white hover:bg-[#F7F9FC] transition-all shadow-2xs min-h-[48px]"
            >
              <span>View Healthcare Plans</span>
              <ArrowRight className="w-4 h-4 text-[#1FA9A2] group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>

            <a
              href={`${HEALTHCARE_URL}/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border border-[#DFE7EF] bg-white hover:bg-[#F7F9FC] hover:text-[var(--lit-navy,#0B2545)] transition-all shadow-2xs min-h-[48px]"
            >
              <span>Open Staff Portal</span>
              <ExternalLink className="w-4 h-4 opacity-60" aria-hidden />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 w-full max-w-4xl"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white border border-[#DFE7EF] shadow-xs hover:border-[#1FA9A2]/40 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-1`}>
                  <stat.icon className="w-5 h-5" aria-hidden />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-mono">{stat.value}</div>
                <div className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] text-center uppercase tracking-wider">{stat.label}</div>
                <div className="text-xs text-[var(--lit-text-muted,#52677C)] text-center font-normal">{stat.desc}</div>
              </div>
            ))}
          </motion.div>

          {/* Platform status note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-xl text-center leading-relaxed font-normal"
          >
            LIT Healthcare is currently in active pilot deployment across partner facilities. Features operate under strict role-based access. Contact {COMPANY.email} for institutional integration requirements.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
