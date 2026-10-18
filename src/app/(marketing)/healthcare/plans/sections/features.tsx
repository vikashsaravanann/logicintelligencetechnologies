"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

const categories = [
  {
    name: 'Organization & Structure',
    features: [
      { name: 'Max Doctors', tiers: ['Up to 3', 'Up to 10', 'Unlimited', 'Unlimited'] },
      { name: 'Max Facilities', tiers: ['1', '1', '1', 'Unlimited'] },
      { name: 'Role-Based Workspaces', tiers: [true, true, true, true] },
      { name: 'Custom Role Definitions', tiers: [false, false, false, true] },
    ],
  },
  {
    name: 'Clinical Workflows',
    features: [
      { name: 'Patient Registration', tiers: [true, true, true, true] },
      { name: 'Appointment Scheduling', tiers: [true, true, true, true] },
      { name: 'Basic Clinical Notes', tiers: [true, true, true, true] },
      { name: 'Advanced Clinical Records', tiers: [false, true, true, true] },
      { name: 'Multi-Specialty Support', tiers: [false, true, true, true] },
      { name: 'Inpatient & Ward Mgmt', tiers: [false, false, true, true] },
      { name: 'Nursing Workspaces', tiers: [false, false, true, true] },
    ],
  },
  {
    name: 'Operations & Billing',
    features: [
      { name: 'Standard Billing', tiers: [true, true, true, true] },
      { name: 'Pharmacy Management', tiers: [false, true, true, true] },
      { name: 'Financial Reports', tiers: [false, true, true, true] },
      { name: 'Claims & Insurance', tiers: [false, false, true, true] },
      { name: 'Cross-Facility Billing', tiers: [false, false, false, true] },
      { name: 'Enterprise Dashboards', tiers: [false, false, false, true] },
    ],
  },
];

export default function PlansFeatures() {
  return (
    <section aria-label="Compare plan features" className="py-16 sm:py-24 bg-white border-t border-[var(--lit-border-light,#DFE7EF)] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider mb-4"
          >
            Detailed Matrix
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-4"
          >
            Compare Plan{' '}
            <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
              Features
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-base text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto"
          >
            Comprehensive breakdown of capabilities, limits, and workflows available across each tier.
          </motion.p>
        </div>

        {/* Mobile View (<768px): Vertically Stacked Plan Cards */}
        <div className="block md:hidden space-y-6">
          {[
            { name: 'Essential', index: 0, badge: 'Starter' },
            { name: 'Professional', index: 1, badge: 'Most Popular', popular: true },
            { name: 'Standard', index: 2, badge: 'Growing Practice' },
            { name: 'Advanced', index: 3, badge: 'Enterprise Scale' },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-5 ${
                tier.popular
                  ? 'border-[#1565C0] bg-[#F4F9FF] shadow-sm'
                  : 'border-[var(--lit-border-light,#DFE7EF)] bg-white'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                  {tier.name}
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    tier.popular
                      ? 'bg-[#1565C0] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tier.badge}
                </span>
              </div>

              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] bg-[#E7F3FF]/40 px-2 py-1 rounded">
                      {cat.name}
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {cat.features.map((feat) => {
                        const val = feat.tiers[tier.index];
                        return (
                          <div
                            key={feat.name}
                            className="flex items-center justify-between py-1.5 text-xs"
                          >
                            <span
                              className={
                                typeof val === 'boolean' && !val
                                  ? 'text-slate-400'
                                  : 'text-slate-700 font-medium'
                              }
                            >
                              {feat.name}
                            </span>
                            {typeof val === 'boolean' ? (
                              val ? (
                                <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-[#059669]/30 flex items-center justify-center text-[#059669] shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <Minus className="w-4 h-4 text-slate-300 shrink-0" />
                              )
                            ) : (
                              <span className="font-mono font-bold text-xs text-[var(--lit-navy,#0B2545)] shrink-0">
                                {val}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (>=768px): Side-by-side Matrix Table */}
        <div className="hidden md:block w-full max-w-full overflow-x-auto rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-3 sm:p-6 shadow-xs">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[var(--lit-border-light,#DFE7EF)]">
                <th className="w-2/5 p-4 text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Feature / Capability
                </th>
                <th className="p-4 text-center text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Essential
                </th>
                <th className="p-4 text-center text-sm font-bold text-[#1565C0] bg-[#E7F3FF]/40 rounded-t-lg">
                  Professional
                </th>
                <th className="p-4 text-center text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Standard
                </th>
                <th className="p-4 text-center text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  Advanced
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <React.Fragment key={category.name}>
                  <tr>
                    <td
                      colSpan={5}
                      className="p-3.5 pt-6 pb-2 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] bg-[#E7F3FF]/30 rounded-md"
                    >
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr
                      key={feature.name}
                      className="border-b border-[var(--lit-border-light,#DFE7EF)]/60 hover:bg-white/80 transition-colors"
                    >
                      <td className="p-4 text-sm text-[var(--lit-ink,#121826)] font-medium">
                        {feature.name}
                      </td>
                      {feature.tiers.map((val, idx) => (
                        <td
                          key={idx}
                          className={`p-4 text-center ${idx === 1 ? 'bg-[#E7F3FF]/20' : ''}`}
                        >
                          {typeof val === 'boolean' ? (
                            val ? (
                              <div className="w-5 h-5 mx-auto rounded-full bg-[#ECFDF5] border border-[#059669]/30 flex items-center justify-center text-[#059669]">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs font-semibold text-[var(--lit-navy,#0B2545)] font-mono">
                              {val}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
