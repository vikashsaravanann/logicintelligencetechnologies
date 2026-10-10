"use client";

import { motion } from 'framer-motion';
import { GitMerge, Eye, Lock, BarChart2, CheckSquare, ArrowUpRight } from 'lucide-react';

const benefits = [
  {
    icon: GitMerge,
    title: 'Centralized Organization Workflows',
    description:
      'All facilities, departments, and staff operate within one organized platform. Administrators maintain visibility across the entire organization without switching between disconnected tools.',
    color: '#1FA9A2',
  },
  {
    icon: Eye,
    title: 'Better Operational Visibility',
    description:
      'Role-appropriate dashboards and reports surface the information each team member needs, reducing information overload while maintaining the oversight that administrators require.',
    color: '#1565C0',
  },
  {
    icon: Lock,
    title: 'Traceable Access & Governance',
    description:
      'Access events and data interactions are structured for auditability. Role-based controls ensure staff can only access what their function requires, within their assigned facility scope.',
    color: '#45D9D2',
  },
  {
    icon: CheckSquare,
    title: 'Consistent Work Processes',
    description:
      'Structured workflows replace ad-hoc processes, reducing variation in how patient registration, appointments, and billing are handled across facilities and staff members.',
    color: '#1FA9A2',
  },
  {
    icon: BarChart2,
    title: 'Facility-Aware Administration',
    description:
      'Each facility maintains its own configuration, staff assignments, and operational data, while sharing the organizational umbrella. Multi-facility groups get consolidated visibility.',
    color: '#1565C0',
  },
  {
    icon: ArrowUpRight,
    title: 'Healthcare Intelligence with Human Oversight',
    description:
      'Analytical and intelligence features are designed to support — not replace — clinical and administrative judgment. All outputs are tools for informed decision-making by qualified staff.',
    color: '#45D9D2',
  },
];

export default function HealthcareBenefits() {
  return (
    <section
      aria-label="Platform benefits"
      className="py-24 md:py-32"
      style={{ background: '#0D2248' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Platform Benefits
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            Why Healthcare Organizations Choose{' '}
            <span style={{ background: 'linear-gradient(90deg, #1FA9A2, #45D9D2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LIT Healthcare
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-base text-slate-400 leading-relaxed"
          >
            LIT Healthcare is designed to bring operational structure, access clarity, and workflow consistency
            to healthcare organizations of all sizes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="p-7 rounded-2xl group hover:border-opacity-40 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${benefit.color}14`, border: `1px solid ${benefit.color}35` }}
              >
                <benefit.icon className="w-6 h-6" style={{ color: benefit.color }} aria-hidden />
              </div>
              <h3 className="text-base font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
