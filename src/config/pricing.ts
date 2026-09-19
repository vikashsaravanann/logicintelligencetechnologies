/**
 * Canonical commercial pricing — source of truth.
 * Website, PDFs, and docs must derive from this module.
 * USD and INR are controlled display prices (not live FX).
 */

export type CurrencyCode = "USD" | "INR";

export const PRICING_DISCLAIMER =
  "Pricing shown is current commercial pricing and may be updated by Logic Intelligence Technologies. INR values are controlled commercial display prices and are not live foreign-exchange conversions. Applicable taxes, third-party provider charges, payment processing fees and custom integration charges may apply.";

export const productsPricing = {
  website: {
    id: "ai-website-agents",
    name: "AI Website Agents",
    tagline: "Turn website visitors into conversations, qualified leads and customers.",
    free: {
      monthly_usd: 0,
      monthly_inr: 0,
      setup_usd: 0,
      setup_inr: 0,
      included_interactions: 100,
      label: "Free",
    },
    professional: {
      monthly_usd: 39,
      monthly_inr: 3250,
      setup_usd: 199,
      setup_inr: 16500,
      included_interactions: 5000,
      overage_usd: 0.01,
      overage_inr: 0.8,
      label: "Professional",
    },
    enterprise: {
      label: "Enterprise",
      pricing: "Custom",
    },
  },
  voice: {
    id: "ai-voice-agents",
    name: "AI Voice Agents",
    tagline: "Your AI-powered front desk for calls, enquiries and appointments.",
    professional: {
      monthly_usd: 149,
      monthly_inr: 12400,
      setup_usd: 599,
      setup_inr: 50000,
      included_minutes: 1000,
      overage_usd: 0.12,
      overage_inr: 10,
      label: "Professional",
    },
    enterprise: {
      label: "Enterprise",
      pricing: "Custom",
    },
  },
  voiceshield: {
    id: "voice-shield",
    name: "VoiceShield",
    legalLine:
      "VoiceShield — an AI security product by Logic Intelligence Technologies Pvt. Ltd.",
    tagline: "AI-Powered Voice Security & Compliance Intelligence",
    enterprise: {
      monthly_usd: 349,
      monthly_inr: 29000,
      setup_usd: 999,
      setup_inr: 83000,
      usage_usd: 0.05,
      usage_inr: 4,
      usage_unit: "per successfully analyzed call",
      usage_note: "Usage-based pricing subject to final billing definition.",
      label: "Enterprise",
    },
  },
} as const;

export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (currency === "USD") {
    return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
  }
  if (amount % 1 === 0) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type ProductPricingKey = keyof typeof productsPricing;
