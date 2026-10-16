'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING_CONFIG, Currency, formatPrice, isCustomPlan, PRICING_DISCLAIMER } from '@/config/pricing';
import { Check, HelpCircle, Shield, Lock, FileCheck, Sparkles, ArrowRight } from 'lucide-react';
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD');

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Hero Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Transparent Commercial Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight mb-4 leading-[1.08]">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose the right AI solution for your business. Controlled USD and INR display prices with no hidden surprises.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-full p-1.5 inline-flex shadow-xs">
            <button
              onClick={() => setCurrency('USD')}
              aria-pressed={currency === 'USD'}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 ${
                currency === 'USD'
                  ? 'bg-[var(--lit-navy,#0B2545)] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[var(--lit-navy,#0B2545)]'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              aria-pressed={currency === 'INR'}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 ${
                currency === 'INR'
                  ? 'bg-[var(--lit-navy,#0B2545)] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[var(--lit-navy,#0B2545)]'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Grouped pricing grid */}
        <div className="space-y-16 mb-24">
          {PRICING_CONFIG.map((product) => (
            <div key={product.id}>
              {/* Product group label */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-[var(--lit-border-light,#DFE7EF)]" />
                <span className="text-xs font-mono font-bold tracking-[0.18em] text-[#1565C0] uppercase px-4 py-1.5 rounded-full bg-[#E7F3FF] border border-[#1565C0]/20 shadow-2xs">
                  {product.name}
                </span>
                <div className="h-px flex-1 bg-[var(--lit-border-light,#DFE7EF)]" />
              </div>

              {/* 3-column row */}
              <div className={`grid gap-6 ${
                product.plans.length === 1
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : product.plans.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {product.plans.map((plan) => {
                  const isPopular = plan.popular;
                  return (
                    <div
                      key={`${product.id}-${plan.name}`}
                      className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                        isPopular
                          ? 'border-[#1FA9A2] ring-2 ring-[#1FA9A2]/20 bg-white shadow-md'
                          : 'border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs hover:border-[#1565C0]/40'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                          <div className="bg-[var(--lit-navy,#0B2545)] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                            Most Popular
                          </div>
                        </div>
                      )}

                      <div className="p-7 flex flex-col flex-1">
                        <div className="text-[10px] font-mono font-semibold tracking-[0.2em] text-[#1565C0] uppercase mb-2 text-center">
                          {product.name}
                        </div>
                        <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-4 text-center">{plan.name}</h2>

                        <div className="flex flex-col items-center gap-1 pb-6 mb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
                          <div className="flex items-baseline gap-1">
                            {isCustomPlan(plan) ? (
                              <span className="text-4xl font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                                Custom
                              </span>
                            ) : (
                              <>
                                <span className="text-4xl sm:text-5xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight">
                                  {formatPrice(plan.monthlyPrice[currency], currency)}
                                </span>
                                <span className="text-slate-500 text-sm font-medium">/mo</span>
                              </>
                            )}
                          </div>
                          <div className="min-h-[44px] flex flex-col items-center justify-center gap-1 text-center">
                            {plan.setupFee && (
                              <span className="text-xs font-medium text-slate-500">
                                + {formatPrice(plan.setupFee[currency], currency)} one-time setup
                              </span>
                            )}
                            {plan.usageFee && (
                              <span className="text-xs font-semibold text-[#1565C0]">
                                + {formatPrice(plan.usageFee[currency], currency)} {plan.usageFee.description}
                              </span>
                            )}
                            {!plan.setupFee && !plan.usageFee && !isCustomPlan(plan) && (
                              <span className="text-xs font-semibold text-emerald-600">No setup fees</span>
                            )}
                            {isCustomPlan(plan) && (
                              <span className="text-xs font-semibold text-slate-500">Quoted after scoping</span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase mb-4 text-center font-mono">
                            What&apos;s included
                          </p>
                          <ul className="space-y-3 flex-1">
                            {plan.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPopular ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-600'}`}>
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                                <span className="text-xs sm:text-sm text-slate-700 leading-snug">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
                          <Link
                            href={
                              plan.ctaHref ||
                              (plan.name === 'Enterprise' || plan.name === 'Free'
                                ? '/contact'
                                : '/products/' + product.id)
                            }
                            className={`w-full flex items-center justify-center h-11 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                              isPopular
                                ? 'bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white shadow-sm'
                                : 'bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] hover:bg-slate-100'
                            }`}
                          >
                            {plan.ctaLabel ||
                              (plan.name === 'Free'
                                ? 'Start Free'
                                : plan.name === 'Enterprise'
                                  ? 'Contact Sales'
                                  : 'Get Started')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">Compare All Plans</h2>
            <p className="text-slate-600 text-sm sm:text-base">A clear breakdown of included usage and commercial tiers.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
                  <th className="text-left p-4 sm:p-5 text-slate-600 font-semibold w-1/3">Feature</th>
                  <th className="p-4 sm:p-5 text-[var(--lit-navy,#0B2545)] font-bold text-center">Free</th>
                  <th className="p-4 sm:p-5 text-[#1565C0] font-bold text-center bg-blue-50/50">Pro (Web)</th>
                  <th className="p-4 sm:p-5 text-[#1565C0] font-bold text-center bg-blue-50/50">Pro (Voice)</th>
                  <th className="p-4 sm:p-5 text-[var(--lit-navy,#0B2545)] font-bold text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {[
                  { label: 'Monthly Price', values: ['$0', '$39', '$149', 'Custom'] },
                  { label: 'One-Time Setup', values: ['None', '$199', '$599', 'Custom'] },
                  { label: 'Included usage', values: ['100 interactions', '5,000 interactions', '1,000 voice minutes', 'Custom limits'] },
                  { label: 'Overage', values: ['—', '$0.01 / interaction', '$0.12 / minute', 'Volume-tiered'] },
                  { label: 'Knowledge / RAG', values: ['Basic', 'Approved content RAG', 'Workflow config', 'Custom integrations'] },
                  { label: 'CRM Integration', values: ['—', 'Where supported', 'Where supported', 'Enterprise SLA'] },
                  { label: 'Human Handoff / Escalation', values: ['—', '✓', '✓', 'Configurable'] },
                  { label: 'Analytics', values: ['Basic', 'Usage analytics', 'Call analytics', 'Enterprise suite'] },
                  { label: 'Support', values: ['Email', 'Standard', 'Standard', 'Dedicated SLA'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 sm:p-5 text-slate-700 font-medium">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td
                        key={j}
                        className={`p-4 sm:p-5 text-center font-semibold text-xs sm:text-sm ${
                          j === 1 || j === 2 ? 'text-[#1565C0] bg-blue-50/20' : 'text-slate-700'
                        } ${val === '—' ? 'text-slate-400' : ''}`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            * Enterprise AI and healthcare deployments are quoted based on organizational scope. Healthcare plans are available at{' '}
            <Link href="/healthcare/plans" className="text-[#1565C0] font-semibold hover:underline">
              /healthcare/plans
            </Link>.
          </p>
        </section>

        {/* Security & Privacy */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">Security &amp; Privacy</h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Designed with privacy and access-control considerations. Actual compliance depends on deployment configuration, providers and contracts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Data Ownership',
                desc: 'Customer business content and interaction data remain under your control under the agreed processing terms. We do not claim unrestricted rights to train foundational models on your private customer payloads.',
              },
              {
                icon: Lock,
                title: 'Encryption in Transit',
                desc: 'Public site and API traffic use modern TLS. Server-side secrets are not exposed to the browser. Access to admin and product systems is authorization-controlled.',
              },
              {
                icon: FileCheck,
                title: 'Configurable Controls',
                desc: 'Retention, residency and subprocessors depend on the selected product deployment. Enterprise customers can discuss audit and contractual requirements during scoping.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center bg-white border border-[var(--lit-border-light,#DFE7EF)] p-8 rounded-2xl shadow-xs hover:border-[#1565C0]/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-[#E7F3FF] border border-[#1565C0]/20 flex items-center justify-center mb-5 text-[#1565C0] group-hover:scale-105 transition-transform">
                  <item.icon className="w-5 h-5 text-[#1565C0]" />
                </div>
                <h3 className="text-lg font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Enterprise Banner */}
        <section className="mb-24">
          <div className="relative rounded-3xl border border-[#0B2545] bg-[var(--lit-navy,#0B2545)] p-8 sm:p-12 md:p-14 overflow-hidden shadow-xl text-white">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#45D9D2]/10 border border-[#45D9D2]/30 text-[#45D9D2] text-xs font-semibold tracking-wider uppercase">
                  Enterprise Tier
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins text-white tracking-tight">Need a custom solution?</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  For complex workflows, higher volume, or stricter security requirements, we scope Enterprise agreements after discovery — without backend guesswork.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                  {[
                    'Volume-based commercial terms',
                    'Custom SLA options (contract-defined)',
                    'Advanced integrations',
                    'Deployment options where applicable',
                    'Custom configuration (not unrestricted fine-tuning claims)',
                    'Enterprise support options',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-[#1FA9A2]/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#45D9D2]" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
                <Link
                  href="/contact"
                  className="w-full lg:w-60 text-center px-8 py-3.5 bg-white text-[var(--lit-navy,#0B2545)] font-bold tracking-wider uppercase text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Contact Sales</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-slate-400">Response within 1 business day</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm sm:text-base">Pricing and billing fundamentals.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes. Plan changes are handled commercially with the team. Proration depends on the agreement in place.',
              },
              {
                q: 'What does the one-time setup fee cover?',
                a: 'Configuration, knowledge/workflow setup from approved content, agreed integrations, and onboarding within package scope. RAG configuration is not custom model training.',
              },
              {
                q: 'How do usage fees work?',
                a: 'Overage and usage fees (additional website interactions or voice minutes) follow the plan terms. Healthcare plans are structured according to institutional bed count and modules.',
              },
              {
                q: 'Do you offer a free tier?',
                a: 'The AI Agent Free tier is available under current commercial pricing (100 interactions/month). AI Voice Agent, Enterprise, and Healthcare deployments are arranged after a contact or demo request.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'Standard commercial terms are month-to-month unless an Enterprise agreement specifies otherwise.',
              },
              {
                q: 'Do you offer custom Enterprise plans?',
                a: 'Yes. Enterprise scope, volume and security requirements are quoted after discovery — not published as fixed public prices.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <HelpCircle className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">{faq.q}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-slate-500 mt-16 max-w-3xl mx-auto leading-relaxed">
          {PRICING_DISCLAIMER}
        </p>
      </div>
    </main>
  );
}
