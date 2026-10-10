"use client";

import { motion } from 'framer-motion';
import { Network, Shield, Layers, Zap } from 'lucide-react';

const pillars = [
  {
    icon: Network,
    title: 'Multi-Organization Architecture',
    description:
      'Designed to support multiple organizations and facilities within a single platform, with tenant-aware data separation and configurable access governance.',
    accent: 'bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/25',
  },
  {
    icon: Layers,
    title: 'Role-Based Workspaces',
    description:
      'Each staff role — from administrators and doctors to nurses, billing teams, and pharmacy staff — receives a purpose-built workspace with relevant tools and navigation.',
    accent: 'bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]',
  },
  {
    icon: Shield,
    title: 'Structured Access & Governance',
    description:
      'Role-based access controls, traceable audit events, and configurable data governance — built to support responsible handling of healthcare operational information.',
    accent: 'bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]',
  },
  {
    icon: Zap,
    title: 'Connected Clinical Workflows',
    description:
      'From patient registration through appointments, clinical records, pharmacy, billing, and reporting — workflows are connected across the platform rather than siloed.',
    accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  },
];

export default function HealthcareOverview() {
  return (
    <section
      aria-label="Platform overview"
      className="py-16 md:py-20 relative bg-transparent border-t border-[#DFE7EF]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 shadow-2xs"
          >
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
              Platform Architecture
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight mb-4"
          >
            A Platform Built for{' '}
            <span className="text-[var(--lit-blue,#1565C0)]">
              Healthcare Organizations
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal"
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
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="p-8 rounded-3xl bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${pillar.accent} group-hover:scale-105 transition-transform duration-200`}
                >
                  <pillar.icon className="w-6 h-6" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
