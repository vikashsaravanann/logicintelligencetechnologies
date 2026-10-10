"use client";

import { motion } from 'framer-motion';
import {
  UserPlus,
  Calendar,
  FileText,
  Users,
  FlaskConical,
  CreditCard,
  FileBarChart,
  Activity,
  Settings,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react';

type FeatureStatus = 'implemented' | 'in-pilot' | 'planned' | 'config-dependent';

interface Capability {
  icon: React.ElementType;
  name: string;
  description: string;
  status: FeatureStatus;
}

const STATUS_CONFIG: Record<
  FeatureStatus,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType }
> = {
  implemented: { label: 'Implemented', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]', Icon: CheckCircle },
  'in-pilot': { label: 'In Pilot', color: 'text-[#1565C0]', bg: 'bg-[#E7F3FF]', border: 'border-[#BFDBFE]', Icon: Clock },
  planned: { label: 'Planned', color: 'text-[#52677C]', bg: 'bg-[#F7F9FC]', border: 'border-[#DFE7EF]', Icon: Info },
  'config-dependent': { label: 'Config-Dependent', color: 'text-[#B45309]', bg: 'bg-[#FFF4D9]', border: 'border-[#FDE68A]', Icon: Settings },
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
      className="py-16 md:py-20 relative bg-transparent border-t border-[#DFE7EF]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 shadow-2xs"
          >
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
              Platform Capabilities
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight mb-4"
          >
            Comprehensive Healthcare Operations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed mb-6 font-normal"
          >
            LIT Healthcare covers the key operational areas of a modern healthcare facility.
            Each module&apos;s availability is noted transparently below.
          </motion.p>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(Object.entries(STATUS_CONFIG) as [FeatureStatus, typeof STATUS_CONFIG[FeatureStatus]][]).map(([key, cfg]) => (
            <div
              key={key}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border} shadow-2xs`}
            >
              <cfg.Icon className="w-3.5 h-3.5" aria-hidden />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {capabilities.map((cap, i) => {
            const statusCfg = STATUS_CONFIG[cap.status];
            const StatusIcon = statusCfg.Icon;
            return (
              <motion.div
                key={cap.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="p-6 rounded-2xl bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#BFDBFE] flex items-center justify-center text-[#1565C0] group-hover:scale-105 transition-transform">
                      <cap.icon className="w-5 h-5" aria-hidden />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] mb-2 tracking-tight">
                    {cap.name}
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                    {cap.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
