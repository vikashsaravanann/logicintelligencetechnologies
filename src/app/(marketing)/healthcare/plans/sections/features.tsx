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
    <section className="py-20 md:py-32 relative bg-[#07090D] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(21,101,192,0.06), transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Compare Plan Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-slate-400 max-w-2xl mx-auto"
          >
            Detailed breakdown of capabilities available in each subscription tier.
          </motion.p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#10131A] p-2 md:p-4">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="w-1/3 p-4 text-sm font-semibold text-white">Features</th>
                <th className="p-4 text-center text-sm font-semibold text-[#1FA9A2]">Essential</th>
                <th className="p-4 text-center text-sm font-semibold text-[#45D9D2]">Professional</th>
                <th className="p-4 text-center text-sm font-semibold text-[#1565C0]">Standard</th>
                <th className="p-4 text-center text-sm font-semibold text-[#1FA9A2]">Advanced</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <React.Fragment key={category.name}>
                  <tr>
                    <td colSpan={5} className="p-4 pt-8 pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map((feature) => (
                    <tr key={feature.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm text-slate-300 font-medium">{feature.name}</td>
                      {feature.tiers.map((val, idx) => (
                        <td key={idx} className="p-4 text-center">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <Check className="w-4 h-4 text-[#45D9D2] mx-auto" />
                            ) : (
                              <Minus className="w-4 h-4 text-slate-700 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs font-semibold text-slate-300 font-mono">{val}</span>
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
