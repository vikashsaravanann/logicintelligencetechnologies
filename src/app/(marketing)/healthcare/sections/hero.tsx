"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Heart, Building2, Users, LayoutDashboard } from 'lucide-react';
import { COMPANY } from '@/config/company';

const HEALTHCARE_URL = 'https://healthcare.logicintelligencetechnologies.in';

const stats = [
  { icon: Building2, label: 'Organization Types', value: '4+', desc: 'Clinics to Hospitals' },
  { icon: Users, label: 'Role Workspaces', value: '8+', desc: 'Tailored per staff role' },
  { icon: LayoutDashboard, label: 'Core Modules', value: '10+', desc: 'Integrated operations' },
  { icon: Heart, label: 'Platform Status', value: 'In Pilot', desc: 'Active deployment' },
];

export default function HealthcareHero() {
  return (
    <section
      aria-label="LIT Healthcare hero"
      className="relative min-h-[90dvh] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0B1628 0%, #0D2B5E 55%, #0B2545 100%)',
      }}
    >
      {/* Background decorative elements */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1FA9A2, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #1565C0, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(rgba(69,217,210,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col items-center text-center gap-8">

          {/* Product badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
            style={{ borderColor: 'rgba(31,169,162,0.40)', background: 'rgba(31,169,162,0.08)' }}
          >
            <Heart className="w-4 h-4 text-[#1FA9A2]" aria-hidden />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#45D9D2]">
              LIT Healthcare · A Logic Intelligence Technologies Product
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight text-white max-w-5xl"
          >
            Smart Hospital Management{' '}
            <span className="block" style={{ background: 'linear-gradient(90deg, #45D9D2, #1565C0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              & Healthcare Intelligence
            </span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed"
          >
            A connected healthcare operations platform for clinics, multispecialty clinics, hospitals, and healthcare groups.
            Role-based workspaces, facility-aware access, and structured clinical workflows — all in one organized platform.
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
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all min-h-[48px]"
              style={{ background: 'linear-gradient(135deg, #1565C0, #1FA9A2)' }}
            >
              Explore Healthcare Platform
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
            </a>

            <Link
              href="/healthcare/plans"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[48px] border"
              style={{ borderColor: 'rgba(69,217,210,0.35)', color: '#45D9D2', background: 'rgba(69,217,210,0.06)' }}
            >
              View Healthcare Plans
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>

            <a
              href={`${HEALTHCARE_URL}/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-200 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all min-h-[48px]"
            >
              Open Healthcare Login
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
                className="flex flex-col items-center gap-2 p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <stat.icon className="w-5 h-5 text-[#1FA9A2]" aria-hidden />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-200 text-center">{stat.label}</div>
                <div className="text-[11px] text-slate-500 text-center">{stat.desc}</div>
              </div>
            ))}
          </motion.div>

          {/* Platform status note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xs text-slate-500 max-w-xl text-center leading-relaxed"
          >
            LIT Healthcare is currently in active pilot deployment. Features and availability may vary by deployment configuration.
            Contact {COMPANY.email} to discuss your organization's requirements.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
