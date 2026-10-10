"use client";

import { motion } from 'framer-motion';
import { UserPlus, Calendar, FileText, Users, FlaskConical, CreditCard, FileBarChart, Activity, Settings, CheckCircle, Clock, Info } from 'lucide-react';

type FeatureStatus = 'implemented' | 'in-pilot' | 'planned' | 'config-dependent';

interface Capability {
  icon: React.ElementType;
  name: string;
  description: string;
  status: FeatureStatus;
}

const STATUS_CONFIG: Record<FeatureStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  implemented: { label: 'Implemented', color: '#1FA9A2', bg: 'rgba(31,169,162,0.12)', Icon: CheckCircle },
  'in-pilot': { label: 'In Pilot', color: '#F9A825', bg: 'rgba(249,168,37,0.12)', Icon: Clock },
  planned: { label: 'Planned', color: '#6B7FA3', bg: 'rgba(107,127,163,0.12)', Icon: Info },
  'config-dependent': { label: 'Config-Dependent', color: '#1565C0', bg: 'rgba(21,101,192,0.12)', Icon: Settings },
};

const capabilities: Capability[] = [
  {
    icon: UserPlus,
    name: 'Patient Registration',
    description: 'Register patients with demographic details, contact information, and identifiers. Facility-aware patient records across the organization.',
    status: 'implemented',
  },
  {
    icon: Calendar,
    name: 'Appointments',
    description: 'Schedule, reschedule, and manage appointments across doctors, departments, and facilities. Status tracking and calendar views.',
    status: 'implemented',
  },
  {
    icon: FileText,
    name: 'Clinical Records',
    description: 'Structured clinical notes, consultation records, diagnoses, and care documentation accessible to authorized clinical staff.',
    status: 'in-pilot',
  },
  {
    icon: Users,
    name: 'Staff Management',
    description: 'Manage staff profiles, roles, department assignments, and facility access. Role-based permission enforcement.',
    status: 'implemented',
  },
  {
    icon: FlaskConical,
    name: 'Pharmacy',
    description: 'Prescription management, drug dispensing workflow, and inventory tracking. Connected to clinical records where configured.',
    status: 'in-pilot',
  },
  {
    icon: CreditCard,
    name: 'Billing',
    description: 'Patient billing, invoice generation, payment recording, and financial tracking per facility and across the organization.',
    status: 'implemented',
  },
  {
    icon: FileText,
    name: 'Claims',
    description: 'Insurance and claims processing workflows. Configuration and availability depend on specific deployment and integration requirements.',
    status: 'config-dependent',
  },
  {
    icon: FileBarChart,
    name: 'Reports',
    description: 'Operational and administrative reporting for patient volumes, billing, appointments, and other configurable metrics.',
    status: 'in-pilot',
  },
  {
    icon: Activity,
    name: 'Operations',
    description: 'Facility operations management including ward tracking, resource allocation, and administrative oversight dashboards.',
    status: 'in-pilot',
  },
  {
    icon: Settings,
    name: 'Organization & Facility Config',
    description: 'Multi-facility organization structure, department setup, subscription management, and platform configuration.',
    status: 'implemented',
  },
];

export default function HealthcareCapabilities() {
  return (
    <section
      aria-label="Platform capabilities"
      className="py-24 md:py-32 relative"
      style={{ background: '#0B1628' }}
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(31,169,162,0.08), transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(69,217,210,0.08)', border: '1px solid rgba(69,217,210,0.25)' }}
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
              Platform Capabilities
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            Comprehensive Healthcare Operations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-base text-slate-400 leading-relaxed mb-6"
          >
            LIT Healthcare covers the key operational areas of a modern healthcare facility.
            Each module&apos;s availability is noted transparently below.
          </motion.p>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(Object.entries(STATUS_CONFIG) as [FeatureStatus, typeof STATUS_CONFIG[FeatureStatus]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              <cfg.Icon className="w-3.5 h-3.5" aria-hidden />
              {cfg.label}
            </div>
          ))}
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {capabilities.map((cap, i) => {
            const sc = STATUS_CONFIG[cap.status];
            return (
              <motion.div
                key={cap.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="p-6 rounded-2xl flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(21,101,192,0.12)', border: '1px solid rgba(21,101,192,0.25)' }}
                  >
                    <cap.icon className="w-5 h-5 text-[#1565C0]" aria-hidden />
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shrink-0"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    <sc.Icon className="w-3 h-3" aria-hidden />
                    {sc.label}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{cap.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-slate-600 mt-10 max-w-2xl mx-auto"
        >
          Feature availability depends on subscription tier, deployment configuration, and organizational requirements.
          LIT Healthcare does not autonomously diagnose, prescribe, or replace clinical judgment.
          All healthcare intelligence features are designed with human oversight.
        </motion.p>
      </div>
    </section>
  );
}
