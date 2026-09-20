/**
 * Canonical commercial pricing — source of truth.
 * Website UI and commercial PDFs must stay aligned with this module.
 * USD and INR are controlled display prices (not live FX).
 */

export type Currency = "USD" | "INR";

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
  included?: string;
  features: string[];
  popular?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ProductPricing {
  id: string;
  name: string;
  plans: PricingPlan[];
}

export const PRICING_DISCLAIMER =
  "Pricing shown is current commercial pricing and may be updated by Logic Intelligence Technologies. INR values are controlled commercial display prices and are not live foreign-exchange conversions. Applicable taxes, third-party provider charges, payment processing fees and custom integration charges may apply.";

export const PRICING_CONFIG: ProductPricing[] = [
  {
    id: "ai-website-agents",
    name: "AI Website Agents",
    plans: [
      {
        name: "Free",
        monthlyPrice: { USD: 0, INR: 0 },
        included: "100 AI interactions / month",
        features: [
          "Basic website agent",
          "Up to 100 AI interactions/month",
          "Standard configuration",
          "Email support",
        ],
        ctaLabel: "Start Free",
        ctaHref: "/contact",
      },
      {
        name: "Professional",
        monthlyPrice: { USD: 39, INR: 3250 },
        setupFee: { USD: 199, INR: 16500 },
        included: "5,000 AI interactions / month",
        usageFee: {
          description: "per additional interaction",
          USD: 0.01,
          INR: 0.8,
        },
        popular: true,
        features: [
          "Up to 5,000 AI interactions/month",
          "RAG knowledge configuration (approved business content — not model training)",
          "Lead capture and qualification",
          "Human handoff",
          "CRM integration where supported",
          "Analytics and usage monitoring",
          "Standard maintenance and hosting/platform operation",
        ],
        ctaLabel: "Get Professional",
        ctaHref: "/contact",
      },
      {
        name: "Enterprise",
        monthlyPrice: { USD: 0, INR: 0 },
        features: [
          "Custom usage limits",
          "Advanced integrations",
          "Custom security requirements",
          "Enterprise architecture review",
          "Dedicated support options",
        ],
        ctaLabel: "Contact Sales",
        ctaHref: "/contact",
      },
    ],
  },
  {
    id: "ai-voice-agents",
    name: "AI Voice Agents",
    plans: [
      {
        name: "Professional",
        monthlyPrice: { USD: 149, INR: 12400 },
        setupFee: { USD: 599, INR: 50000 },
        included: "1,000 AI voice minutes / month",
        usageFee: {
          description: "per additional minute",
          USD: 0.12,
          INR: 10,
        },
        popular: true,
        features: [
          "Inbound call handling",
          "Lead qualification and appointment requests",
          "Up to 1,000 AI voice minutes/month",
          "Calendar / CRM integration where applicable",
          "Call transcription and structured extraction",
          "Human escalation",
          "Platform maintenance and monitoring",
        ],
        ctaLabel: "Request Voice Agent",
        ctaHref: "/contact",
      },
      {
        name: "Enterprise",
        monthlyPrice: { USD: 0, INR: 0 },
        features: [
          "Custom minutes and concurrency",
          "Advanced workflows",
          "Security review",
          "Custom SLA options",
        ],
        ctaLabel: "Contact Sales",
        ctaHref: "/contact",
      },
    ],
  },
  {
    id: "voice-shield",
    name: "VoiceShield",
    plans: [
      {
        name: "Enterprise",
        monthlyPrice: { USD: 349, INR: 29000 },
        setupFee: { USD: 999, INR: 83000 },
        usageFee: {
          description: "per successfully analyzed call (billing unit subject to final definition)",
          USD: 0.05,
          INR: 4,
        },
        popular: true,
        features: [
          "Voice risk and configurable security signals",
          "Compliance indicators and evidence extraction",
          "Structured machine-readable output",
          "API-first integration",
          "Enterprise analytics",
          "Configurable retention (standard 30-day policy)",
        ],
        ctaLabel: "Request Access",
        ctaHref: "/voice-shield/request",
      },
    ],
  },
];

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** True when Enterprise plan has no fixed monthly (custom quote). */
export function isCustomPlan(plan: PricingPlan): boolean {
  return plan.name === "Enterprise" && plan.monthlyPrice.USD === 0 && !plan.setupFee;
}
