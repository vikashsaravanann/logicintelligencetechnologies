"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Heart, Building2, Users, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { COMPANY } from '@/config/company';

const HEALTHCARE_URL = 'https://healthcare.logicintelligencetechnologies.in';

const stats = [
  { icon: Building2, label: 'Organization Types', value: '4+', desc: 'Clinics to Multi-Hospital Groups' },
  { icon: Users, label: 'Role Workspaces', value: '8+', desc: 'Dedicated per staff discipline' },
  { icon: LayoutDashboard, label: 'Core Modules', value: '10+', desc: 'Unified clinical operations' },
  { icon: ShieldCheck, label: 'Platform Status', value: 'In Pilot', desc: 'Active facility deployment' },
];

export default function HealthcareHero() {
  return (
    <section
      aria-label="LIT Healthcare hero"
      className="relative min-h-[90dvh] flex flex-col items-center justify-center overflow-hidden bg-[#07090D] pt-32 pb-24"
    >
      {/* Background atmospheric radial glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] rounded-full opacity-15 bg-[radial-gradient(ellipse_at_center,_#45D9D2,_transparent_70%)] blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[500px] rounded-full opacity-10 bg-[radial-gradient(ellipse_at_center,_#1565C0,_transparent_70%)] blur-[140px]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(rgba(69,217,210,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">

          {/* Product badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/20 bg-[#10131A]"
          >
            <Heart className="w-4 h-4 text-primary" aria-hidden />
            <span className="text-xs font-mono font-bold tracking-[0.18em] uppercase text-primary">
              LIT Healthcare · A Logic Intelligence Technologies Product
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-[clamp(2.5rem,5.5vw,5rem)] font-bold leading-[1.05] tracking-tight text-white uppercase"
          >
            Smart Hospital Management{' '}
            <span className="block bg-gradient-to-r from-primary via-[#6DE6E0] to-[#1565C0] bg-clip-text text-transparent">
              &amp; Clinical Intelligence
            </span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed font-light"
          >
            A connected healthcare operations platform for clinics, multispecialty clinics, hospitals, and healthcare groups.
            Role-based workspaces, facility-aware data isolation, and structured clinical workflows — engineered in one robust system.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2"
          >
            <a
              href={HEALTHCARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-slate-950 text-xs uppercase tracking-wider bg-primary hover:bg-[#6DE6E0] transition-all min-h-[48px]"
            >
              <span>Explore Healthcare Platform</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
            </a>

            <Link
              href="/healthcare/plans"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-primary border border-primary/30 bg-[#10131A] hover:bg-primary/10 transition-all min-h-[48px]"
            >
              <span>View Healthcare Plans</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>

            <a
              href={`${HEALTHCARE_URL}/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 border border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all min-h-[48px]"
            >
              <span>Open Staff Portal</span>
              <ExternalLink className="w-4 h-4 opacity-60" aria-hidden />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 w-full max-w-4xl"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-[#10131A] border border-white/10"
              >
                <stat.icon className="w-5 h-5 text-primary" aria-hidden />
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-300 text-center uppercase tracking-wider">{stat.label}</div>
                <div className="text-[11px] text-slate-500 text-center font-light">{stat.desc}</div>
              </div>
            ))}
          </motion.div>

          {/* Platform status note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xs text-slate-500 max-w-xl text-center leading-relaxed font-light"
          >
            LIT Healthcare is currently in active pilot deployment across partner facilities. Features operate under strict role-based access. Contact {COMPANY.email} for institutional integration requirements.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
