'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING_CONFIG, Currency, formatPrice } from '@/config/pricing';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';
import { Check, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD');

  return (
    <PageShell>
      {/* Absolute Golden/Black Background */}
      <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(184,134,11,0.15)_0%,_rgba(0,0,0,1)_70%)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_rgba(218,165,32,0.1)_0%,_rgba(0,0,0,0)_60%)]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.05)_0%,_rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="container py-32 md:py-40 max-w-7xl relative z-10">
        <SectionHeader
          title="Simple, Transparent Pricing"
          subtitle="Choose the right AI solution for your business. No hidden fees."
          align="center"
        />

        {/* Currency Toggle */}
        <div className="flex justify-center mt-12 mb-20">
          <div className="bg-black/40 backdrop-blur-md border border-yellow-500/20 rounded-full p-1 inline-flex shadow-[0_0_15px_rgba(218,165,32,0.1)]">
            <button
              onClick={() => setCurrency('USD')}
              aria-pressed={currency === 'USD'}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all ${
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
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all ${
                currency === 'INR' 
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Pricing Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32">
          {PRICING_CONFIG.flatMap((product) => 
            product.plans.map((plan) => ({ product, plan }))
          ).map(({ product, plan }, idx) => {
            const isPopular = plan.popular;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={`${product.id}-${plan.name}`} 
                className={`relative bg-black/40 backdrop-blur-xl border p-8 rounded-3xl flex flex-col h-full transition-all duration-300 hover:-translate-y-2 ${
                  isPopular 
                    ? 'border-yellow-500/50 shadow-[0_10px_40px_-10px_rgba(218,165,32,0.2)]' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                
                <div className="text-[10px] font-mono font-bold tracking-widest text-yellow-500/80 uppercase mb-3 text-center">
                  {product.name}
                </div>
                <h4 className="text-3xl font-black text-white mb-6 text-center">{plan.name}</h4>
                
                <div className="mb-8 pb-8 border-b border-white/10 flex flex-col items-center">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                      {formatPrice(plan.monthlyPrice[currency], currency)}
                    </span>
                    <span className="text-zinc-500 font-medium">/mo</span>
                  </div>
                  
                  <div className="mt-4 space-y-1.5 min-h-[48px] text-center">
                    {plan.setupFee && (
                      <div className="text-sm font-medium text-zinc-400">
                        + {formatPrice(plan.setupFee[currency], currency)} one-time setup
                      </div>
                    )}
                    {plan.usageFee && (
                      <div className="text-sm font-medium text-yellow-500/80">
                        + {formatPrice(plan.usageFee[currency], currency)} {plan.usageFee.description}
                      </div>
                    )}
                    {!plan.setupFee && !plan.usageFee && (
                      <div className="text-sm font-medium text-emerald-500/80">
                        No setup fees
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-grow flex flex-col items-center">
                  <p className="text-xs font-bold tracking-wider text-zinc-400 uppercase mb-6 text-center">
                    What's included
                  </p>
                  <ul className="space-y-4 w-full max-w-[280px]">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 shrink-0 ${isPopular ? 'text-yellow-500' : 'text-primary'}`} />
                        <span className="text-sm text-zinc-300 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <Link 
                    href={plan.name === 'Enterprise' ? '/voice-shield/request' : '/products/' + product.id}
                    className={`w-full flex items-center justify-center h-12 rounded-xl text-sm font-bold tracking-wide uppercase transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black hover:opacity-90 shadow-lg'
                        : 'bg-white/5 text-white border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {plan.name === 'Free' ? 'Start Free Trial' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto border-t border-white/10 pt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-lg">Everything you need to know about the product and billing.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Can I change my plan later?</h4>
                  <p className="text-zinc-400 leading-relaxed">Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges will be automatically calculated based on your usage.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">What does the setup fee cover?</h4>
                  <p className="text-zinc-400 leading-relaxed">The one-time setup fee covers custom AI model training, CRM integrations, and dedicated onboarding with our engineering team to ensure perfect alignment with your business workflows.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">How do the usage fees work?</h4>
                  <p className="text-zinc-400 leading-relaxed">Usage fees, such as per-minute VoiceShield scanning, are billed at the end of the billing cycle based on exact consumption. There are no minimum monthly usage requirements.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Do you offer custom Enterprise plans?</h4>
                  <p className="text-zinc-400 leading-relaxed">Yes, for large-scale deployments, custom SLAs, and on-premise infrastructure requirements, please contact our sales team to discuss a custom Enterprise solution tailored to your needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
