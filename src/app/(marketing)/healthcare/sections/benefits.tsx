"use client";

import { motion } from 'framer-motion';
import { GitMerge, Eye, Lock, BarChart2, CheckSquare, ArrowUpRight } from 'lucide-react';

const benefits = [
  {
    icon: GitMerge,
    title: 'Centralized Organization Workflows',
    description:
      'All facilities, departments, and staff operate within one organized platform. Administrators maintain visibility across the entire organization without switching between disconnected tools.',
    accent: 'bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/25',
  },
  {
    icon: Eye,
    title: 'Better Operational Visibility',
    description:
      'Role-appropriate dashboards and reports surface the information each team member needs, reducing information overload while maintaining the oversight that administrators require.',
    accent: 'bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]',
  },
  {
    icon: Lock,
    title: 'Traceable Access & Governance',
    description:
      'Access events and data interactions are structured for auditability. Role-based controls ensure staff can only access what their function requires, within their assigned facility scope.',
    accent: 'bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]',
  },
  {
    icon: CheckSquare,
    title: 'Consistent Work Processes',
    description:
      'Structured workflows replace ad-hoc processes, reducing variation in how patient registration, appointments, and billing are handled across facilities and staff members.',
    accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  },
  {
    icon: BarChart2,
    title: 'Facility-Aware Administration',
    description:
      'Each facility maintains its own configuration, staff assignments, and operational data, while sharing the organizational umbrella. Multi-facility groups get consolidated visibility.',
    accent: 'bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]',
  },
  {
    icon: ArrowUpRight,
    title: 'Healthcare Intelligence with Human Oversight',
    description:
      'Analytical and intelligence features are designed to support — not replace — clinical and administrative judgment. All outputs are tools for informed decision-making by qualified staff.',
    accent: 'bg-[#FCEAF3] text-[#BE185D] border-[#FBCFE8]',
  },
];

export default function HealthcareBenefits() {
  return (
    <section
      aria-label="Platform benefits"
      className="py-16 md:py-20 relative bg-transparent border-t border-[#DFE7EF]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 shadow-2xs"
          >
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
              Platform Benefits
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight mb-4"
          >
            Why Healthcare Organizations Choose{' '}
            <span className="text-[var(--lit-blue,#1565C0)]">
              LIT Healthcare
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal"
          >
            LIT Healthcare is designed to bring operational structure, access clarity, and workflow consistency
            to healthcare organizations of all sizes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="p-8 rounded-3xl bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${b.accent} group-hover:scale-105 transition-transform duration-200`}
                >
                  <b.icon className="w-6 h-6" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-3 tracking-tight">{b.title}</h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{b.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
