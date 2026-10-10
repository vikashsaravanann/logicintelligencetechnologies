"use client";

import { motion } from 'framer-motion';
import { Store, Settings, Users, CheckCircle } from 'lucide-react';

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
    color: '#1FA9A2',
  },
  {
    number: '02',
    icon: CheckCircle,
    title: 'Select Your Plan',
    description:
      'Choose the subscription tier that matches your organization type and operational requirements — Clinic Essential, Clinic Professional, Hospital Standard, or Hospital Advanced.',
    color: '#1565C0',
  },
  {
    number: '03',
    icon: Settings,
    title: 'Organization Configuration',
    description:
      'Set up your organization profile, facilities, departments, and initial configuration. Our team supports deployment and onboarding.',
    color: '#45D9D2',
  },
  {
    number: '04',
    icon: Users,
    title: 'Onboard Your Team',
    description:
      'Add staff members, assign roles, configure facility access, and activate the workspaces appropriate to your organization\'s structure.',
    color: '#1FA9A2',
  },
];

export default function HealthcareOnboarding() {
  return (
    <section
      aria-label="Onboarding journey"
      className="py-24 md:py-32 relative bg-[#10131A] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(21,101,192,0.06), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#1565C0]/30 bg-[#1565C0]/10"
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
              Implementation Process
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4"
          >
            How Onboarding Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-base sm:text-lg text-slate-300 leading-relaxed"
          >
            Getting your organization onto LIT Healthcare is a structured process designed
            to ensure proper configuration and a smooth start for your team.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              className="relative p-7 rounded-2xl bg-[#151922] border border-white/5 hover:border-[#1FA9A2]/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Step number */}
                <div
                  className="text-4xl font-extrabold mb-5 leading-none font-mono tracking-tight"
                  style={{ color: step.color, opacity: 0.35 }}
                >
                  {step.number}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border transition-transform group-hover:scale-105 duration-300"
                  style={{ background: `${step.color}15`, borderColor: `${step.color}35` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} aria-hidden />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{step.description}</p>
              </div>
              {step.action && (
                <a
                  href={step.action.href}
                  target={step.action.external ? '_blank' : undefined}
                  rel={step.action.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors mt-auto group-hover:underline"
                  style={{ color: step.color }}
                >
                  {step.action.label}
                  <span aria-hidden>→</span>
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
