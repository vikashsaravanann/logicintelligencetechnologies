'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING_CONFIG, Currency, formatPrice } from '@/config/pricing';
import PageShell from '@/components/layout/page-shell';
import { Check, HelpCircle, Shield, Lock, FileCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD');

  const allPlans = PRICING_CONFIG.flatMap((product) =>
    product.plans.map((plan) => ({ product, plan }))
  );

  return (
    <PageShell>
      {/* Golden gradient overlay on top of global background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_center,_rgba(184,134,11,0.18)_0%,_rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(218,165,32,0.08)_0%,_rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Star className="w-3.5 h-3.5" /> Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Choose the right AI solution for your business. No hidden fees, no lock-in, no surprises.
          </p>
        </div>

        {/* ── CURRENCY TOGGLE ────────────────────────────────── */}
        <div className="flex justify-center mb-20">
          <div className="bg-black/60 backdrop-blur-md border border-yellow-500/20 rounded-full p-1 inline-flex shadow-[0_0_20px_rgba(218,165,32,0.1)]">
            <button
              onClick={() => setCurrency('USD')}
              aria-pressed={currency === 'USD'}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currency === 'USD'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              aria-pressed={currency === 'INR'}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                currency === 'INR'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* ── PRICING CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-32">
          {allPlans.map(({ product, plan }, idx) => {
            const isPopular = plan.popular;
            return (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                key={`${product.id}-${plan.name}`}
                className={`relative flex flex-col rounded-3xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${
                  isPopular
                    ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-950/40 via-black/60 to-black/60 shadow-[0_20px_60px_-20px_rgba(218,165,32,0.25)]'
                    : 'border-white/8 bg-black/40 hover:border-white/15'
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Product tag */}
                  <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-yellow-500/70 uppercase mb-2 text-center">
                    {product.name}
                  </div>

                  {/* Plan name */}
                  <h2 className="text-3xl font-black text-white mb-5 text-center">
                    {plan.name}
                  </h2>

                  {/* Price block */}
                  <div className="flex flex-col items-center gap-1 pb-6 mb-6 border-b border-white/8">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-black ${isPopular ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-500' : 'text-white'}`}>
                        {formatPrice(plan.monthlyPrice[currency], currency)}
                      </span>
                      <span className="text-zinc-500 text-sm font-medium">/mo</span>
                    </div>
                    <div className="min-h-[44px] flex flex-col items-center justify-center gap-1 text-center">
                      {plan.setupFee && (
                        <span className="text-xs font-medium text-zinc-400">
                          + {formatPrice(plan.setupFee[currency], currency)} one-time setup
                        </span>
                      )}
                      {plan.usageFee && (
                        <span className="text-xs font-semibold text-yellow-500/80">
                          + {formatPrice(plan.usageFee[currency], currency)} {plan.usageFee.description}
                        </span>
                      )}
                      {!plan.setupFee && !plan.usageFee && (
                        <span className="text-xs font-semibold text-emerald-400">No setup fees</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 flex flex-col">
                    <p className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase mb-5 text-center">
                      What's included
                    </p>
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPopular ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                            <Check className={`w-2.5 h-2.5 ${isPopular ? 'text-yellow-400' : 'text-zinc-400'}`} />
                          </div>
                          <span className="text-sm text-zinc-300 leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8 pt-6 border-t border-white/8">
                    <Link
                      href={plan.name === 'Enterprise' ? '/contact' : '/products/' + product.id}
                      className={`w-full flex items-center justify-center h-12 rounded-xl text-sm font-black tracking-widest uppercase transition-all ${
                        isPopular
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black hover:opacity-90 shadow-lg hover:shadow-yellow-500/20'
                          : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {plan.name === 'Free' ? 'Start Free' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── COMPARE TABLE ──────────────────────────────────── */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Compare All Plans</h2>
            <p className="text-zinc-400 text-lg">A clear breakdown of exactly what you get at every tier.</p>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-white/8 bg-black/40 backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left p-5 text-zinc-400 font-semibold w-1/3">Feature</th>
                  <th className="p-5 text-white font-bold text-center">Free</th>
                  <th className="p-5 text-yellow-400 font-bold text-center bg-yellow-500/5">Pro (Web)</th>
                  <th className="p-5 text-yellow-400 font-bold text-center bg-yellow-500/5">Pro (Voice)</th>
                  <th className="p-5 text-white font-bold text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: 'Monthly Price', values: ['$0', '$39', '$149', '$349'] },
                  { label: 'One-Time Setup', values: ['None', '$199', '$599', '$999'] },
                  { label: 'Conversations / Calls', values: ['500/mo', 'Unlimited', 'Unlimited', 'Unlimited'] },
                  { label: 'AI Customization', values: ['Standard', 'Custom-trained', 'Custom-trained', 'Full fine-tune'] },
                  { label: 'CRM Integration', values: ['—', '✓', '✓', '✓'] },
                  { label: 'Multilingual Support', values: ['—', '50+ languages', '50+ languages', '50+ languages'] },
                  { label: 'Human Handoff', values: ['—', '✓', '✓', '✓'] },
                  { label: 'Analytics Dashboard', values: ['Basic', 'Advanced', 'Advanced', 'Full Fraud Analytics'] },
                  { label: 'SLA Uptime', values: ['—', '99.9%', '99.9%', '99.99%'] },
                  { label: 'Dedicated Account Manager', values: ['—', '—', '—', '✓'] },
                  { label: 'Support', values: ['Email', 'Priority 24/7', 'Priority 24/7', 'Dedicated Engineer'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-zinc-400 font-medium">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td
                        key={j}
                        className={`p-5 text-center font-semibold ${
                          j === 1 || j === 2 ? 'text-yellow-400 bg-yellow-500/[0.03]' : 'text-zinc-300'
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
        </section>

        {/* ── SECURITY & COMPLIANCE ──────────────────────────── */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Enterprise-Grade Security</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Your data is your business. We build with strict privacy controls so your sensitive information stays protected.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Data Privacy & Ownership',
                desc: 'We never use your customer conversations, chat logs, or voice recordings to train our foundational models. Every piece of data you share belongs entirely to you — always.',
              },
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                desc: 'All communications are encrypted in transit using TLS 1.3 and at rest using AES-256. Our zero-trust architecture means every API request is authenticated and scoped.',
              },
              {
                icon: FileCheck,
                title: 'Compliance Ready',
                desc: 'Our platform is built in alignment with GDPR, CCPA, and SOC 2 standards. Custom compliance reports and audit-trail access are available for Enterprise customers.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center bg-white/[0.02] border border-white/8 p-8 rounded-3xl hover:bg-white/[0.04] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ENTERPRISE CUSTOM CTA ──────────────────────────── */}
        <section className="mb-32">
          <div className="relative bg-gradient-to-r from-yellow-950/30 via-black/80 to-yellow-950/30 border border-yellow-500/20 rounded-3xl p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(218,165,32,0.08)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-widest uppercase">
                  Enterprise Scale
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white">Need a custom AI solution?</h3>
                <p className="text-lg text-zinc-400">
                  For large organizations with complex workflows, strict security requirements, or high-volume traffic, we build fully custom Enterprise agreements — tailored to your exact infrastructure.
                </p>
                <ul className="grid grid-cols-2 gap-3 pt-2 text-left">
                  {[
                    'Volume-based discounts',
                    'Custom SLA (up to 99.99%)',
                    'Dedicated Account Manager',
                    'On-premise deployment',
                    'Custom AI model fine-tuning',
                    'Priority 24/7 engineering support',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-yellow-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-4 w-full lg:w-auto">
                <Link
                  href="/contact"
                  className="w-full lg:w-64 text-center px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black tracking-wide uppercase text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-yellow-500/20"
                >
                  Contact Sales
                </Link>
                <p className="text-xs text-zinc-500">Response within 1 business day</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-lg">Everything you need to know about pricing and billing.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. Prorated charges are automatically calculated based on your billing cycle.',
              },
              {
                q: 'What does the one-time setup fee cover?',
                a: 'The setup fee covers custom AI model training on your specific business data, CRM and third-party integrations, and dedicated onboarding sessions with our engineering team to ensure everything is perfectly calibrated to your workflows.',
              },
              {
                q: 'How do usage fees work?',
                a: 'Usage fees (e.g. per-minute VoiceShield scanning) are tracked in real-time and billed at the end of your monthly billing cycle based on exact consumption. There are no minimum usage requirements.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes. The AI Website Agent Free plan is available indefinitely with no credit card required. For Voice Agents and VoiceShield Enterprise, we offer a 14-day trial environment — contact us to set one up.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'All plans are billed month-to-month with no lock-in. Enterprise customers may negotiate annual agreements for significant volume discounts.',
              },
              {
                q: 'Do you offer custom Enterprise plans?',
                a: 'Yes. For large-scale deployments, custom SLAs, white-labelling, and on-premise infrastructure, please contact our sales team to design a solution specifically for your organization.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-white mb-2">{faq.q}</h4>
                    <p className="text-zinc-400 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PageShell>
  );
}
