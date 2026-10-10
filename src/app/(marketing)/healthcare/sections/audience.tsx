"use client";

import { motion } from 'framer-motion';
import { Building2, Hospital, Users2, Stethoscope, UserCog, FlaskConical, ReceiptText, HeartPulse } from 'lucide-react';

const organizationTypes = [
  {
    icon: Building2,
    type: 'Clinic',
    description: 'Single-location clinics looking for structured patient management, appointment workflows, and billing.',
    color: '#1FA9A2',
  },
  {
    icon: Hospital,
    type: 'Multispecialty Clinic',
    description: 'Clinics with multiple specialties that need department-aware scheduling and cross-specialty patient records.',
    color: '#1565C0',
  },
  {
    icon: Hospital,
    type: 'Hospital',
    description: 'Full-service hospitals requiring ward management, inpatient tracking, pharmacy, and comprehensive billing.',
    color: '#45D9D2',
  },
  {
    icon: Building2,
    type: 'Healthcare Group',
    description: 'Multi-facility healthcare groups that need centralized administration across multiple sites and facilities.',
    color: '#1FA9A2',
  },
];

const roleWorkspaces = [
  { icon: UserCog, role: 'Administrator', tasks: 'Organization settings, staff management, facility configuration, reports' },
  { icon: Stethoscope, role: 'Doctor', tasks: 'Patient records, appointments, clinical notes, prescriptions' },
  { icon: HeartPulse, role: 'Nurse', tasks: 'Patient care, vitals, nursing notes, ward coordination' },
  { icon: ReceiptText, role: 'Billing & Operations', tasks: 'Invoicing, payments, claims processing, financial reports' },
  { icon: FlaskConical, role: 'Pharmacy', tasks: 'Drug dispensing, inventory management, prescription fulfillment' },
  { icon: Users2, role: 'Receptionist', tasks: 'Patient registration, appointment booking, front-desk operations' },
];

export default function HealthcareAudience() {
  return (
    <section
      aria-label="Who the platform is for"
      className="py-24 md:py-32 relative bg-[#07090D] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(21,101,192,0.06), transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Organization types */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#1565C0]/30 bg-[#1565C0]/10"
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
              Operational Scope
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            Built for Healthcare Organizations of All Sizes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-base sm:text-lg text-slate-300 leading-relaxed"
          >
            LIT Healthcare supports a range of organization types, from individual clinics to large hospital groups,
            with subscription tiers matched to operational scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {organizationTypes.map((org, i) => (
            <motion.div
              key={org.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="p-7 rounded-2xl text-center bg-[#151922] border border-white/5 hover:border-[#1FA9A2]/30 transition-all duration-300 group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 border transition-transform group-hover:scale-105 duration-300"
                style={{ background: `${org.color}15`, borderColor: `${org.color}35` }}
              >
                <org.icon className="w-7 h-7" style={{ color: org.color }} aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{org.type}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{org.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Role workspaces */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            Role-Based Workspaces
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
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
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="flex gap-4 p-6 rounded-2xl bg-[#151922] border border-white/5 hover:border-[#1565C0]/35 transition-all duration-300"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-[#1FA9A2]/30 bg-[#1FA9A2]/10"
              >
                <ws.icon className="w-5 h-5 text-[#45D9D2]" aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{ws.role}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ws.tasks}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
