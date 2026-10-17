'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlanIdentifier,
  MAINTENANCE_PLANS,
  MAINTENANCE_FEATURES_MATRIX,
  formatPaiseToInr,
} from '@/config/maintenance-plans';
import BackButton from '@/components/navigation/back-button';
import { Check, Shield, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';

export default function PublicMaintenancePlansPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanIdentifier>('PRO');
  const [showRoadmap, setShowRoadmap] = useState(false);

  const selectedPlan = MAINTENANCE_PLANS[selectedPlanId];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] pt-28 sm:pt-36 pb-24 overflow-x-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Hero Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>SLA Guarantees & Production Engineering</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-poppins text-[#0B2545] tracking-tight mb-4 leading-tight">
            Software Maintenance & Care Plans
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Reliable, post-launch software maintenance, routine bug investigation, security reviews, and dedicated minor enhancement allowances for your production systems.
          </p>
        </div>

        {/* Five Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {(Object.keys(MAINTENANCE_PLANS) as PlanIdentifier[]).map((planId) => {
            const plan = MAINTENANCE_PLANS[planId];
            const isSelected = selectedPlanId === planId;
            const isFreeTrial = plan.planType === 'free_trial';

            return (
              <div
                key={planId}
                onClick={() => setSelectedPlanId(planId)}
                className={`relative flex flex-col justify-between rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1565C0] bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {plan.badge}
                    </span>
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.shortDescription}</p>

                  {/* Pricing */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    {isFreeTrial ? (
                      <div>
                        <div className="text-2xl font-extrabold text-[#0B2545]">₹0</div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          ₹20 refundable verification
                        </div>
                        <div className="text-[10px] text-slate-400">30 Days · No auto-debit</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl font-extrabold text-[#0B2545]">
                          {formatPaiseToInr(plan.basePricePaise)}
                          <span className="text-xs font-normal text-slate-500"> /mo</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          + 18% GST ({formatPaiseToInr(plan.gstAmountPaise)})
                        </div>
                        <div className="text-[11px] text-slate-700 font-semibold">
                          Total: {formatPaiseToInr(plan.totalPricePaise)} /mo
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>SLA: {plan.slaResponseTime}</span>
                    </div>
                    {plan.enhancementHoursMonthly > 0 && (
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{plan.enhancementHoursMonthly} hr/mo Enhancements</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/login?next=${encodeURIComponent('/engagement')}`}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{plan.ctaButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan In-Depth Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-16 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Tier In-Depth Specification
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B2545] mt-1">
                {selectedPlan.name} — Full Service Scope
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400">Total Monthly Investment</span>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatPaiseToInr(selectedPlan.totalPricePaise)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Included Services & SLA</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {selectedPlan.includedServices.map((svc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{svc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Scope Boundaries & Exclusions</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {selectedPlan.serviceLimits.map((lmt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold shrink-0 mt-0.5">—</span>
                    <span>{lmt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Target Audience:</span>
                <p>{selectedPlan.targetAudience}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Feature Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-16">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-[#0B2545]">Comprehensive Feature Comparison Matrix</h2>
            <p className="text-xs text-slate-500 mt-1">
              Side-by-side comparison of SLA, included services, and engineering allocations.
            </p>
          </div>

          <div>
            {/* Mobile: Stacked Vertical Comparisons (Zero Horizontal Scroll on 320px/375px/390px) */}
            <div className="block md:hidden p-4 space-y-4">
              {[
                { key: 'freeTrial', label: 'Free Trial', price: '₹20 (Refundable)' },
                { key: 'standard', label: 'Standard', price: '₹999/mo + GST' },
                { key: 'basic', label: 'Basic', price: '₹4,999/mo + GST' },
                { key: 'pro', label: 'Pro (Recommended)', price: '₹9,999/mo + GST', highlight: true },
                { key: 'enterprise', label: 'Enterprise', price: '₹19,999/mo + GST' },
              ].map((tier) => (
                <div
                  key={tier.key}
                  className={`rounded-xl p-4 border text-xs space-y-3 ${
                    tier.highlight
                      ? 'border-blue-300 bg-blue-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900 text-sm">{tier.label}</span>
                    <span className="font-semibold text-slate-600">{tier.price}</span>
                  </div>
                  <div className="space-y-2">
                    {MAINTENANCE_FEATURES_MATRIX.map((row) => {
                      const val = (row as any)[tier.key];
                      const display = typeof val === 'boolean' ? (val ? 'Included' : 'Not included') : val;
                      const isYes = val === true;
                      const isNo = val === false;
                      return (
                        <div key={row.id} className="flex items-start justify-between gap-2 py-1 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700 font-medium">{row.name}</span>
                          <span
                            className={`font-semibold shrink-0 text-right ${
                              isYes
                                ? 'text-emerald-700'
                                : isNo
                                ? 'text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {display}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Side-by-side Matrix Table (md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="p-4 font-bold">Service / Entitlement</th>
                    <th className="p-4 text-center font-bold">Free Trial</th>
                    <th className="p-4 text-center font-bold">Standard</th>
                    <th className="p-4 text-center font-bold">Basic</th>
                    <th className="p-4 text-center font-bold text-blue-700 bg-blue-50/50">Pro</th>
                    <th className="p-4 text-center font-bold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MAINTENANCE_FEATURES_MATRIX.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="p-4 font-medium text-slate-900">{row.name}</td>
                      <td className="p-4 text-center text-slate-600">
                        {typeof row.freeTrial === 'boolean' ? (row.freeTrial ? '✓' : '—') : row.freeTrial}
                      </td>
                      <td className="p-4 text-center text-slate-600">
                        {typeof row.standard === 'boolean' ? (row.standard ? '✓' : '—') : row.standard}
                      </td>
                      <td className="p-4 text-center text-slate-600">
                        {typeof row.basic === 'boolean' ? (row.basic ? '✓' : '—') : row.basic}
                      </td>
                      <td className="p-4 text-center font-semibold text-blue-900 bg-blue-50/30">
                        {typeof row.pro === 'boolean' ? (row.pro ? '✓' : '—') : row.pro}
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-900">
                        {typeof row.enterprise === 'boolean' ? (row.enterprise ? '✓' : '—') : row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Future Scope & Roadmap Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-16">
          <div
            onClick={() => setShowRoadmap(!showRoadmap)}
            className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  Future Roadmap
                </span>
                <h2 className="text-lg font-bold text-[#0B2545]">Planned Future Capabilities</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Notice: Planned items are in active development and not yet contractual entitlements.
              </p>
            </div>
            <button type="button" className="text-xs text-blue-600 font-semibold">
              {showRoadmap ? 'Collapse Roadmap ▲' : 'Expand Roadmap ▼'}
            </button>
          </div>

          {showRoadmap && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {(Object.keys(MAINTENANCE_PLANS) as PlanIdentifier[]).map((planId) => {
                const plan = MAINTENANCE_PLANS[planId];
                return (
                  <div key={planId} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase">{plan.name}</h3>
                    <div className="space-y-2">
                      {plan.plannedFeatures.map((feat, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-100 text-[11px]">
                          <span className="font-bold text-slate-900 block">{feat.title}</span>
                          <span className="text-slate-500 mt-0.5 block leading-relaxed">{feat.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enterprise Bottom Banner */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] text-white rounded-2xl p-8 shadow-lg text-center space-y-4">
          <h2 className="text-2xl font-bold">Need a Custom Enterprise SLA or 24/7 Hotline?</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            We architect tailored service level agreements for critical healthcare, financial, and high-concurrency infrastructure.
          </p>
          <div className="pt-2">
            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              <span>Schedule Architecture Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
