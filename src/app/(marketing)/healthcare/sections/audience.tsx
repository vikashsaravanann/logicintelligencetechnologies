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
      className="py-24 md:py-32"
      style={{ background: '#0D1F3E' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Organization types */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(21,101,192,0.10)', border: '1px solid rgba(21,101,192,0.25)' }}
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
              Organization Types
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            Built for Healthcare Organizations of All Sizes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-base text-slate-400 leading-relaxed"
          >
            LIT Healthcare supports a range of organization types, from individual clinics to large hospital groups,
            with subscription tiers matched to operational scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          {organizationTypes.map((org, i) => (
            <motion.div
              key={org.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="p-6 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${org.color}1A`, border: `1px solid ${org.color}40` }}
              >
                <org.icon className="w-7 h-7" style={{ color: org.color }} aria-hidden />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{org.type}</h3>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleWorkspaces.map((ws, i) => (
            <motion.div
              key={ws.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="flex gap-4 p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(31,169,162,0.12)', border: '1px solid rgba(31,169,162,0.25)' }}
              >
                <ws.icon className="w-5 h-5 text-[#1FA9A2]" aria-hidden />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{ws.role}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ws.tasks}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
