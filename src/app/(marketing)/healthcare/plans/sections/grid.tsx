"use client";

import { motion } from 'framer-motion';
import { ExternalLink, Check } from 'lucide-react';
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
    color: '#1FA9A2',
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
    color: '#1565C0',
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
    color: '#45D9D2',
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
    color: '#1FA9A2',
  },
];

export default function PlansGrid() {
  return (
    <section className="py-12 md:py-20 relative bg-[#10131A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 md:-mt-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-7 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                plan.popular
                  ? 'bg-[#181D28] border-2 border-[#1565C0]/60 shadow-[0_12px_40px_rgba(21,101,192,0.2)]'
                  : 'bg-[#151922] border border-white/5 hover:border-white/15'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1565C0] to-[#45D9D2]" />
              )}
              {plan.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full text-white bg-gradient-to-r from-[#1565C0] to-[#1FA9A2]">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-6 min-h-[40px] leading-relaxed">{plan.description}</p>

              <div className="mb-6 pb-6 border-b border-white/5">
                <span className="text-3xl font-extrabold text-white font-mono">{formatPrice(plan.price, 'INR')}</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>

              <a
                href="https://healthcare.logicintelligencetechnologies.in/organization-store"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 mb-8 min-h-[46px] ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#1565C0] to-[#1FA9A2] text-white shadow-lg shadow-[#1565C0]/20 hover:brightness-110'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                Select Plan
                <ExternalLink className="w-4 h-4 opacity-70" aria-hidden />
              </a>

              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Included Features</p>
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="mt-0.5 rounded-full p-0.5 bg-[#1FA9A2]/15 border border-[#1FA9A2]/30 shrink-0">
                        <Check className="w-3 h-3 text-[#45D9D2]" />
                      </div>
                      <span className="text-xs text-slate-300 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-12">
          All plans are billed monthly. Prices shown are in INR and may be subject to applicable taxes.
          Setup and integration fees may apply based on data migration requirements.
        </p>
      </div>
    </section>
  );
}
