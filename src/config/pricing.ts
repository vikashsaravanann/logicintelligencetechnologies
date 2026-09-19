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
  features: string[];
  popular?: boolean;
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
        features: [
          'Standard AI Chatbot widget',
          'Up to 500 conversations/mo',
          'Basic knowledge base (10 pages)',
          'Email support',
          'Standard response time',
        ],
      },
      {
        name: 'Pro',
        monthlyPrice: { USD: 39, INR: 3250 },
        setupFee: { USD: 199, INR: 16500 },
        popular: true,
        features: [
          'Custom-trained AI Agent',
          'Unlimited conversations',
          'Advanced knowledge base (1,000+ pages)',
          'Priority 24/7 support',
          'Real-time handoff to human agents',
          'Custom UI/Branding',
        ],
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
        popular: true,
        features: [
          'Inbound/Outbound call handling',
          'Natural voice generation',
          'CRM Integration (HubSpot, Salesforce)',
          'Custom conversational flows',
          'Transcripts and Analytics',
          'Multi-language support',
        ],
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
        popular: true,
        usageFee: {
          description: 'per minute',
          USD: 0.05,
          INR: 4,
        },
        features: [
          'Voice Deepfake Detection API',
          'Real-time audio scanning',
          'Enterprise SLA (99.99% uptime)',
          'Dedicated Account Manager',
          'Fraud Analytics Dashboard',
          'Custom compliance reporting',
        ],
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
