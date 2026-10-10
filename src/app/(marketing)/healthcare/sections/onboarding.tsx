"use client";

import { motion } from 'framer-motion';
import { Store, Settings, Users, CheckCircle, ExternalLink } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Store,
    title: 'Visit Organization Store',
    description:
      'Browse available subscription tiers at the Healthcare Organization Store. Review plan capabilities, included features, and pricing.',
    action: {
      label: 'Open Organization Store',
      href: 'https://healthcare.logicintelligencetechnologies.in/organization-store',
      external: true,
    },
    accent: 'bg-[#1FA9A2]/10 text-[#0E7A74] border-[#1FA9A2]/25',
  },
  {
    number: '02',
    icon: CheckCircle,
    title: 'Select Your Plan',
    description:
      'Choose the subscription tier that matches your organization type and operational requirements — Clinic Essential, Clinic Professional, Hospital Standard, or Hospital Advanced.',
    accent: 'bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]',
  },
  {
    number: '03',
    icon: Settings,
    title: 'Organization Configuration',
    description:
      'Set up your organization profile, facilities, departments, and initial configuration. Our team supports deployment and onboarding.',
    accent: 'bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]',
  },
  {
    number: '04',
    icon: Users,
    title: 'Onboard Your Team',
    description:
      'Add staff members, assign roles, configure facility access, and activate the workspaces appropriate to your organization\'s structure.',
    accent: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  },
];

export default function HealthcareOnboarding() {
  return (
    <section
      aria-label="Onboarding journey"
      className="py-16 md:py-20 relative bg-transparent border-t border-[#DFE7EF]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 border border-[#1565C0]/25 bg-[#E7F3FF] shadow-2xs"
          >
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#1565C0]">
              Implementation Process
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight mb-4"
          >
            How Onboarding Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal"
          >
            Getting your organization onto LIT Healthcare is a structured process designed
            to ensure proper configuration and a smooth start for your team.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="p-8 rounded-3xl bg-white border border-[#DFE7EF] hover:border-[#1FA9A2]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${step.accent} group-hover:scale-105 transition-transform duration-200`}>
                    <step.icon className="w-6 h-6" aria-hidden />
                  </div>
                  <span className="text-2xl font-bold font-mono text-[#CBD5E1] group-hover:text-[var(--lit-blue,#1565C0)] transition-colors">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal mb-6">
                  {step.description}
                </p>
              </div>

              {step.action && (
                <a
                  href={step.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--lit-blue,#1565C0)] hover:underline pt-2 border-t border-[#DFE7EF]"
                >
                  <span>{step.action.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
