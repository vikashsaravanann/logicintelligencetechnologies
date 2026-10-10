'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING_CONFIG, Currency, formatPrice, isCustomPlan, PRICING_DISCLAIMER } from '@/config/pricing';
import PageShell from '@/components/layout/page-shell';
import { Check, HelpCircle, Shield, Lock, FileCheck, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import BackToHome from "@/components/ui/back-to-home";

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD');

  return (
    <PageShell>
      <BackToHome />
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[85%] h-[60%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[65%] h-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Transparent Commercial Pricing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Choose the right AI solution for your business. Controlled USD and INR display prices with no hidden surprises.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-[#10131A] border border-white/10 rounded-full p-1.5 inline-flex shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <button
              onClick={() => setCurrency('USD')}
              aria-pressed={currency === 'USD'}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 ${
                currency === 'USD'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              aria-pressed={currency === 'INR'}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 ${
                currency === 'INR'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* ── Grouped pricing grid ── */}
        <div className="space-y-16 mb-28">
          {PRICING_CONFIG.map((product, productIdx) => (
            <div key={product.id}>
              {/* Product group label */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-mono font-semibold tracking-[0.2em] text-cyan-400/90 uppercase px-4 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/20">
                  {product.name}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* 3-column row */}
              <div className={`grid gap-6 ${
                product.plans.length === 1
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : product.plans.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {product.plans.map((plan, planIdx) => {
                  const isPopular = plan.popular;
                  const globalIdx = PRICING_CONFIG
                    .slice(0, productIdx)
                    .reduce((acc, p) => acc + p.plans.length, 0) + planIdx;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: globalIdx * 0.08 }}
                      key={`${product.id}-${plan.name}`}
                      className={`relative flex flex-col rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 ${
                        isPopular
                          ? 'border-cyan-500/50 bg-[#181D28] shadow-[0_20px_50px_-20px_rgba(69,217,210,0.2)]'
                          : 'border-white/10 bg-[#151922] hover:border-cyan-500/30'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-black text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                            Most Popular
                          </div>
                        </div>
                      )}

                      <div className="p-7 flex flex-col flex-1">
                        <div className="text-[10px] font-mono font-semibold tracking-[0.2em] text-cyan-400/80 uppercase mb-2 text-center">
                          {product.name}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">{plan.name}</h2>

                        <div className="flex flex-col items-center gap-1 pb-6 mb-6 border-b border-white/10">
                          <div className="flex items-baseline gap-1">
                            {isCustomPlan(plan) ? (
                              <span className={`text-4xl font-bold ${isPopular ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300' : 'text-white'}`}>
                                Custom
                              </span>
                            ) : (
                              <>
                                <span className={`text-4xl sm:text-5xl font-bold tracking-tight ${isPopular ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300' : 'text-white'}`}>
                                  {formatPrice(plan.monthlyPrice[currency], currency)}
                                </span>
                                <span className="text-zinc-400 text-sm font-medium">/mo</span>
                              </>
                            )}
                          </div>
                          <div className="min-h-[44px] flex flex-col items-center justify-center gap-1 text-center">
                            {plan.setupFee && (
                              <span className="text-xs font-medium text-zinc-400">
                                + {formatPrice(plan.setupFee[currency], currency)} one-time setup
                              </span>
                            )}
                            {plan.usageFee && (
                              <span className="text-xs font-semibold text-cyan-400">
                                + {formatPrice(plan.usageFee[currency], currency)} {plan.usageFee.description}
                              </span>
                            )}
                            {!plan.setupFee && !plan.usageFee && !isCustomPlan(plan) && (
                              <span className="text-xs font-semibold text-emerald-400">No setup fees</span>
                            )}
                            {isCustomPlan(plan) && (
                              <span className="text-xs font-semibold text-zinc-400">Quoted after scoping</span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-4 text-center">
                            What&apos;s included
                          </p>
                          <ul className="space-y-3 flex-1">
                            {plan.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPopular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-zinc-300'}`}>
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                                <span className="text-xs sm:text-sm text-zinc-300 leading-snug">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                          <Link
                            href={
                              plan.ctaHref ||
                              (plan.name === 'Enterprise' || plan.name === 'Free'
                                ? '/contact'
                                : '/products/' + product.id)
                            }
                            className={`w-full flex items-center justify-center h-11 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                              isPopular
                                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black hover:opacity-95 shadow-lg shadow-cyan-500/25'
                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
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
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <section className="mb-28">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Compare All Plans</h2>
            <p className="text-zinc-400 text-sm sm:text-base">A clear breakdown of included usage and commercial tiers.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#10131A] backdrop-blur-md shadow-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#151922]">
                  <th className="text-left p-4 sm:p-5 text-zinc-400 font-semibold w-1/3">Feature</th>
                  <th className="p-4 sm:p-5 text-white font-bold text-center">Free</th>
                  <th className="p-4 sm:p-5 text-cyan-400 font-bold text-center bg-cyan-500/5">Pro (Web)</th>
                  <th className="p-4 sm:p-5 text-cyan-400 font-bold text-center bg-cyan-500/5">Pro (Voice)</th>
                  <th className="p-4 sm:p-5 text-white font-bold text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 sm:p-5 text-zinc-400 font-medium">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td
                        key={j}
                        className={`p-4 sm:p-5 text-center font-semibold text-xs sm:text-sm ${
                          j === 1 || j === 2 ? 'text-cyan-400 bg-cyan-500/[0.02]' : 'text-zinc-300'
                        } ${val === '—' ? 'text-zinc-600' : ''}`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-4 text-center">
            * Enterprise AI and healthcare deployments are quoted based on organizational scope. Healthcare plans are available at{' '}
            <Link href="/healthcare/plans" className="text-cyan-400 hover:underline">
              /healthcare/plans
            </Link>.
          </p>
        </section>

        {/* Security & Privacy */}
        <section className="mb-28">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Security & Privacy</h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
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
              <div key={idx} className="flex flex-col items-center text-center bg-[#151922] border border-white/10 p-8 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 text-cyan-400 group-hover:scale-105 transition-transform">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Enterprise Banner */}
        <section className="mb-28">
          <div className="relative bg-gradient-to-br from-[#10131A] via-[#151922] to-[#10131A] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 md:p-14 overflow-hidden shadow-[0_20px_60px_-20px_rgba(69,217,210,0.15)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
                  Enterprise Tier
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Need a custom solution?</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  For complex workflows, higher volume, or stricter security requirements, we scope Enterprise agreements after discovery — without inventing fixed enterprise list prices.
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
                    <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-cyan-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
                <Link
                  href="/contact"
                  className="w-full lg:w-60 text-center px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold tracking-wider uppercase text-xs sm:text-sm rounded-xl hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-zinc-500">Response within 1 business day</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Pricing and billing fundamentals.</p>
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
                className="bg-[#151922] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-zinc-600 mt-20 max-w-3xl mx-auto leading-relaxed">
          {PRICING_DISCLAIMER}
        </p>
      </div>
    </PageShell>
  );
}

