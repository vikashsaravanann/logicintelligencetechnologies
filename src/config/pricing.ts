export type Currency = 'USD' | 'INR';

export interface PricingPlan {
  name: string;
  monthlyPrice: {
    USD: number;
    INR: number;
  };
  setupFee?: {
    USD: number;
    INR: number;
  };
  usageFee?: {
    description: string;
    USD: number;
    INR: number;
  };
}

export interface ProductPricing {
  id: string;
  name: string;
  plans: PricingPlan[];
}

export const PRICING_CONFIG: ProductPricing[] = [
  {
    id: 'ai-website-agents',
    name: 'AI Website Agents',
    plans: [
      {
        name: 'Free',
        monthlyPrice: { USD: 0, INR: 0 },
      },
      {
        name: 'Pro',
        monthlyPrice: { USD: 39, INR: 3250 },
        setupFee: { USD: 199, INR: 16500 },
      },
    ],
  },
  {
    id: 'ai-voice-agents',
    name: 'AI Voice Agents',
    plans: [
      {
        name: 'Pro',
        monthlyPrice: { USD: 149, INR: 12400 },
        setupFee: { USD: 599, INR: 50000 },
      },
    ],
  },
  {
    id: 'voice-shield',
    name: 'VoiceShield',
    plans: [
      {
        name: 'Enterprise',
        monthlyPrice: { USD: 349, INR: 29000 },
        setupFee: { USD: 999, INR: 83000 },
        usageFee: {
          description: 'per minute',
          USD: 0.05,
          INR: 4,
        },
      },
    ],
  },
];

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  }
}
