'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING_CONFIG, Currency, formatPrice } from '@/config/pricing';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD');

  return (
    <PageShell>
      <div className="container py-24">
        <SectionHeader
          title="Simple, Transparent Pricing"
          subtitle="Choose the right AI solution for your business."
          align="center"
        />

        <div className="flex justify-center mb-12">
          <div className="bg-glass border border-white/10 rounded-full p-1 inline-flex">
            <button
              onClick={() => setCurrency('USD')}
              aria-pressed={currency === 'USD'}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                currency === 'USD' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              aria-pressed={currency === 'INR'}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                currency === 'INR' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_CONFIG.map((product) => (
            <div key={product.id} className="flex flex-col gap-8">
              <h3 className="text-2xl font-bold text-center border-b border-white/10 pb-4">{product.name}</h3>
              {product.plans.map((plan) => (
                <div key={plan.name} className="bg-glass border border-white/10 p-8 rounded-2xl flex flex-col h-full">
                  <h4 className="text-xl font-semibold mb-2">{plan.name} Plan</h4>
                  
                  <div className="my-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{formatPrice(plan.monthlyPrice[currency], currency)}</span>
                      <span className="text-gray-400">/mo</span>
                    </div>
                    {plan.setupFee && (
                      <div className="text-sm text-gray-400 mt-2">
                        + {formatPrice(plan.setupFee[currency], currency)} setup fee
                      </div>
                    )}
                    {plan.usageFee && (
                      <div className="text-sm text-gray-400 mt-1">
                        + {formatPrice(plan.usageFee[currency], currency)} {plan.usageFee.description}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10">
                    <Button
                      asChild
                      variant={plan.name === 'Enterprise' || plan.name === 'Pro' ? 'default' : 'outline'}
                      className="w-full justify-center"
                    >
                      <Link href={plan.name === 'Enterprise' ? '/voice-shield/request' : '/products/' + product.id}>
                        {plan.name === 'Free' ? 'Start Free' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Request Demo'}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
