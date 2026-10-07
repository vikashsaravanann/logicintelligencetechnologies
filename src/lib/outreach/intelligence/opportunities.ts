import type { OpportunityType } from "./message-schema";

/**
 * Per-opportunity message guidance (master directive §16–§24). This steers the
 * generator toward an honest observation + proportionate impact + low-friction
 * CTA for each opportunity class. It never asserts an unverified business
 * outcome ("you're losing customers"); impact is always "may / can" framed.
 */
export interface OpportunityGuidance {
  type: OpportunityType;
  label: string;
  /** What to observe — phrased so the model states only what evidence supports. */
  observationHint: string;
  /** Proportionate, non-catastrophic impact framing. */
  impactHint: string;
  /** The low-friction permission CTA to offer. */
  ctaHint: string;
  /** The LIT offer this opportunity maps to (internal, not dumped in message 1). */
  recommendedOffer: string;
}

export const OPPORTUNITY_GUIDANCE: Record<OpportunityType, OpportunityGuidance> = {
  L0_no_website: {
    type: "L0_no_website",
    label: "No official website found",
    observationHint:
      "Could not identify an independent business website from the public profiles checked (do NOT assert none exists).",
    impactHint:
      "That can leave prospective customers relying on third-party listings for services, contact details and information.",
    ctaHint: "Offer to send a short outline of what a simple standalone presence could look like.",
    recommendedOffer: "Digital Launch Pack",
  },
  L1_social_only: {
    type: "L1_social_only",
    label: "Social / directory only",
    observationHint:
      "Most of the online presence found points visitors to a social/directory platform rather than a standalone site.",
    impactHint:
      "That can make it harder to control how services, enquiries and search information are presented.",
    ctaHint: "Offer a simple structure that could sit alongside the existing social presence.",
    recommendedOffer: "Digital Launch Pack",
  },
  L2_broken_website: {
    type: "L2_broken_website",
    label: "Broken website",
    observationHint:
      "A specific, verified issue was still occurring when the site was tested on the stated date.",
    impactHint:
      "That may prevent some visitors from reaching the information or action they came for.",
    ctaHint: "Offer the specific fix plus a cleaner alternative as a short breakdown.",
    recommendedOffer: "Business Pro CRM",
  },
  L3_legacy_website: {
    type: "L3_legacy_website",
    label: "Modernization opportunity",
    observationHint: "The current site appears to use a dated structure or stack (state only what was observed).",
    impactHint: "A refresh may make the site easier to maintain and clearer for visitors.",
    ctaHint: "Offer a short note on what a modern rebuild would change.",
    recommendedOffer: "Business Pro CRM",
  },
  L4_performance: {
    type: "L4_performance",
    label: "Performance opportunity",
    observationHint:
      "A current mobile performance measurement returned a specific score on the stated date (cite tool + value + date).",
    impactHint:
      "That suggests there may be room to reduce the work required before the page becomes usable on mobile.",
    ctaHint: "Offer the main items behind the result.",
    recommendedOffer: "Business Pro CRM",
  },
  L5_mobile_ux: {
    type: "L5_mobile_ux",
    label: "Mobile / UX opportunity",
    observationHint: "A specific, verified mobile UX issue was observed on the site.",
    impactHint: "That can add an extra step for visitors trying to take a specific action.",
    ctaHint: "Offer a simpler mobile flow mock.",
    recommendedOffer: "Business Pro CRM",
  },
  L6_conversion: {
    type: "L6_conversion",
    label: "Conversion opportunity",
    observationHint: "A specific, verified issue on the path to enquiry was observed.",
    impactHint: "For someone ready to enquire, that makes the next action less obvious than it could be.",
    ctaHint: "Offer a cleaner enquiry path as a quick version.",
    recommendedOffer: "Business Pro CRM",
  },
  L7_seo_foundation: {
    type: "L7_seo_foundation",
    label: "SEO / technical foundation",
    observationHint: "A specific, verified technical detail was noticed during the audit (e.g. missing meta/canonical).",
    impactHint: "It is a small technical detail, but it gives search engines less context about the page.",
    ctaHint: "Offer the exact list of changes.",
    recommendedOffer: "Custom Enterprise RAG",
  },
  L8_growth_automation: {
    type: "L8_growth_automation",
    label: "Automation / business systems opportunity",
    observationHint:
      "A public-facing manual process was observed (only the public flow — never claim knowledge of internal processes).",
    impactHint: "There may be an opportunity to reduce manual handling between the website and the next step.",
    ctaHint: "Offer a simple automation approach based only on the public flow.",
    recommendedOffer: "Custom Enterprise RAG",
  },
};

export function guidanceFor(type: OpportunityType): OpportunityGuidance {
  return OPPORTUNITY_GUIDANCE[type];
}
