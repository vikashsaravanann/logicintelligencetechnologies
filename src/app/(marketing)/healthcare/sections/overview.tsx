"use client";

import { motion } from 'framer-motion';
import { Network, Shield, Layers, Zap } from 'lucide-react';

const pillars = [
  {
    icon: Network,
    title: 'Multi-Organization Architecture',
    description:
      'Designed to support multiple organizations and facilities within a single platform, with tenant-aware data separation and configurable access governance.',
    color: '#1FA9A2',
    bg: 'rgba(31,169,162,0.08)',
    border: 'rgba(31,169,162,0.25)',
  },
  {
    icon: Layers,
    title: 'Role-Based Workspaces',
    description:
      'Each staff role — from administrators and doctors to nurses, billing teams, and pharmacy staff — receives a purpose-built workspace with relevant tools and navigation.',
    color: '#1565C0',
    bg: 'rgba(21,101,192,0.08)',
    border: 'rgba(21,101,192,0.25)',
  },
  {
    icon: Shield,
    title: 'Structured Access & Governance',
    description:
      'Role-based access controls, traceable audit events, and configurable data governance — built to support responsible handling of healthcare operational information.',
    color: '#45D9D2',
    bg: 'rgba(69,217,210,0.08)',
    border: 'rgba(69,217,210,0.25)',
  },
  {
    icon: Zap,
    title: 'Connected Clinical Workflows',
    description:
      'From patient registration through appointments, clinical records, pharmacy, billing, and reporting — workflows are connected across the platform rather than siloed.',
    color: '#1FA9A2',
    bg: 'rgba(31,169,162,0.08)',
    border: 'rgba(31,169,162,0.25)',
  },
];

export default function HealthcareOverview() {
  return (
    <section
      aria-label="Platform overview"
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#0B1A36' }}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(21,101,192,0.12), transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(31,169,162,0.10)', border: '1px solid rgba(31,169,162,0.25)' }}
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#1FA9A2]">
              Platform Overview
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
          >
            A Platform Built for{' '}
            <span style={{ background: 'linear-gradient(90deg, #1FA9A2, #45D9D2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Healthcare Organizations
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-base sm:text-lg text-slate-400 leading-relaxed"
          >
            LIT Healthcare centralizes the operational workflows of clinics and hospitals into a structured digital platform.
            Organizations can manage multiple facilities, define roles precisely, and give each team member a workspace
            appropriate to their function.
          </motion.p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-8 rounded-2xl"
              style={{ background: pillar.bg, border: `1px solid ${pillar.border}` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${pillar.bg}`, border: `1px solid ${pillar.border}` }}
              >
                <pillar.icon className="w-6 h-6" style={{ color: pillar.color }} aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
