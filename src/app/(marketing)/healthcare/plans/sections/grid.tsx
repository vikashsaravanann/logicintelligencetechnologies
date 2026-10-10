"use client";

import { motion } from 'framer-motion';
import { ExternalLink, Check, Sparkles } from 'lucide-react';
import { formatPrice } from '@/config/pricing';

const plans = [
  {
    name: 'Clinic Essential',
    price: 5999,
    description: 'Core clinic operations and patient management for independent practices.',
    features: [
      'Up to 3 Doctors',
      'Patient Registration',
      'Appointment Scheduling',
      'Basic Clinical Records',
      'Standard Billing',
      'Email Support',
    ],
    popular: false,
    badgeBg: 'bg-[#E7F3FF]',
    badgeText: 'text-[#1565C0]',
  },
  {
    name: 'Clinic Professional',
    price: 12999,
    description: 'Advanced clinical workflows and pharmacy management for growing clinics.',
    features: [
      'Up to 10 Doctors',
      'Advanced Clinical Records',
      'Pharmacy Management',
      'Multi-Specialty Support',
      'Financial Reports',
      'Priority Support',
    ],
    popular: true,
    badgeBg: 'bg-[#1FA9A2]/10',
    badgeText: 'text-[#0E7A74]',
  },
  {
    name: 'Hospital Standard',
    price: 34999,
    description: 'Full hospital management with inpatient wards and advanced billing.',
    features: [
      'Unlimited Doctors',
      'Inpatient & Ward Management',
      'Nursing Station Workspaces',
      'Claims & Insurance Workflows',
      'Advanced Healthcare Intelligence',
      '24/7 Phone Support',
    ],
    popular: false,
    badgeBg: 'bg-[#F1ECFF]',
    badgeText: 'text-[#7C3AED]',
  },
  {
    name: 'Hospital Advanced',
    price: 99999,
    description: 'Multi-facility healthcare groups needing centralized administration.',
    features: [
      'Multi-Facility Architecture',
      'Centralized Administration',
      'Cross-Facility Patient Records',
      'Custom Role Definitions',
      'Enterprise BI Dashboards',
      'Dedicated Account Manager',
    ],
    popular: false,
    badgeBg: 'bg-[#FFF4D9]',
    badgeText: 'text-[#B45309]',
  },
];

export default function PlansGrid() {
  return (
    <section aria-label="Healthcare subscription tiers" className="py-8 sm:py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={`relative p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-white border-2 border-[#1565C0] shadow-xl ring-4 ring-[#1565C0]/5'
                  : 'bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs hover:shadow-md hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full text-white bg-gradient-to-r from-[#1565C0] to-[#1FA9A2] shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" aria-hidden />
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] mb-2 tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
                  <span className="text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] font-mono">
                    {formatPrice(plan.price, 'INR')}
                  </span>
                  <span className="text-xs text-[var(--lit-text-muted,#52677C)]"> / month</span>
                </div>

                <a
                  href="https://healthcare.logicintelligencetechnologies.in/organization-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 mb-8 min-h-[46px] ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#1565C0] to-[#1FA9A2] text-white shadow-md hover:brightness-105'
                      : 'bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white shadow-xs'
                  }`}
                >
                  Select Plan
                  <ExternalLink className="w-4 h-4 opacity-80" aria-hidden />
                </a>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-4">
                    Included Features
                  </p>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full p-0.5 bg-[#ECFDF5] border border-[#059669]/30 shrink-0 text-[#059669]">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-[var(--lit-ink,#121826)] font-medium leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-[var(--lit-text-muted,#52677C)] mt-12 max-w-2xl mx-auto leading-relaxed">
          All plans are billed monthly. Prices shown are in INR and exclude applicable GST.
          Setup assistance and data migration services are available for all tiers.
        </p>
      </div>
    </section>
  );
}
