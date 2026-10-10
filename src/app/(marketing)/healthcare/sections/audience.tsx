"use client";

import { motion } from 'framer-motion';
import { Building2, Hospital, Users2, Stethoscope, UserCog, FlaskConical, ReceiptText, HeartPulse } from 'lucide-react';

const organizationTypes = [
  {
    icon: Building2,
    type: 'Clinic',
    description: 'Single-location clinics looking for structured patient management, appointment workflows, and billing.',
    accent: 'bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/25',
  },
  {
    icon: Hospital,
    type: 'Multispecialty Clinic',
    description: 'Clinics with multiple specialties that need department-aware scheduling and cross-specialty patient records.',
    accent: 'bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]',
  },
  {
    icon: Hospital,
    type: 'Hospital',
    description: 'Full-service hospitals requiring ward management, inpatient tracking, pharmacy, and comprehensive billing.',
    accent: 'bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]',
  },
  {
    icon: Building2,
    type: 'Healthcare Group',
    description: 'Multi-facility healthcare groups that need centralized administration across multiple sites and facilities.',
    accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  },
];

const roleWorkspaces = [
  { icon: UserCog, role: 'Administrator', tasks: 'Organization settings, staff management, facility configuration, reports', accent: 'bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/25' },
  { icon: Stethoscope, role: 'Doctor', tasks: 'Patient records, appointments, clinical notes, prescriptions', accent: 'bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]' },
  { icon: HeartPulse, role: 'Nurse', tasks: 'Patient care, vitals, nursing notes, ward coordination', accent: 'bg-[#FCEAF3] text-[#BE185D] border-[#FBCFE8]' },
  { icon: ReceiptText, role: 'Billing & Operations', tasks: 'Invoicing, payments, claims processing, financial reports', accent: 'bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]' },
  { icon: FlaskConical, role: 'Pharmacy', tasks: 'Drug dispensing, inventory management, prescription fulfillment', accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' },
  { icon: Users2, role: 'Receptionist', tasks: 'Patient registration, appointment booking, front-desk operations', accent: 'bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]' },
];

export default function HealthcareAudience() {
  return (
    <section
      aria-label="Who the platform is for"
      className="py-16 md:py-20 relative bg-transparent border-t border-[#DFE7EF]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Organization types */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border border-[#1565C0]/25 bg-[#E7F3FF] shadow-2xs"
          >
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#1565C0]">
              Operational Scope
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight mb-4"
          >
            Built for Healthcare Organizations of All Sizes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal"
          >
            LIT Healthcare supports a range of organization types, from individual clinics to large hospital groups,
            with subscription tiers matched to operational scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {organizationTypes.map((org, i) => (
            <motion.div
              key={org.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="p-7 rounded-3xl text-center bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 border transition-transform group-hover:scale-105 duration-200 ${org.accent}`}
                >
                  <org.icon className="w-7 h-7" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2">{org.type}</h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{org.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Role workspaces */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight mb-4"
          >
            Role-Based Workspaces
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-base text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Each staff role receives a focused workspace with the tools, data, and navigation relevant to their function —
            reducing clutter and improving operational clarity.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleWorkspaces.map((ws, i) => (
            <motion.div
              key={ws.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="flex gap-4 p-6 rounded-2xl bg-white border border-[#DFE7EF] hover:border-[#1565C0]/40 shadow-xs hover:shadow-md transition-all duration-200 items-start"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${ws.accent}`}
              >
                <ws.icon className="w-5 h-5" aria-hidden />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">{ws.role}</h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">{ws.tasks}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
