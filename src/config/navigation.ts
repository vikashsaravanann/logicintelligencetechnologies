/**
 * Central navigation model for Logic Intelligence Technologies.
 * Products: AI Agent · AI Voice Agent · VoiceShield
 * /ai = AI Agent interactive assistant experience (not a fourth product).
 */
export type NavItem = {
  href: string;
  label: string;
  description?: string;
  highlight?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Always-visible desktop primary links. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "HOME" },
  { href: "/ai", label: "AI AGENT" },
  { href: "/voice-shield", label: "VOICESHIELD" },
  { href: "/services", label: "SOLUTIONS" },
  { href: "/industries", label: "INDUSTRIES" },
  { href: "/work", label: "WORK" },
  { href: "/resources", label: "RESOURCES" },
  { href: "/about", label: "COMPANY" },
  { href: "/contact", label: "CONTACT" },
];

export const PRIMARY_CTA: NavItem = {
  href: "/book-consultation",
  label: "BOOK A CONSULTATION",
};

export const MORE_NAV_GROUPS: NavGroup[] = [
  {
    id: "company",
    label: "COMPANY",
    items: [
      { href: "/about/founder", label: "FOUNDER", description: "VIKASH SARAVANAN PROFILE", highlight: true },
      { href: "/expertise", label: "TECHNICAL EXPERTISE", description: "ENGINEERING CAPABILITIES" },
      { href: "/careers", label: "CAREERS", description: "CULTURE AND OPEN PATHS", highlight: true },
      { href: "/jobs", label: "LEADERSHIP JOBS", description: "CEO AND DIRECTOR SEATS", highlight: true },
      { href: "/press", label: "PRESS", description: "MEDIA AND BRAND ASSETS" },
      { href: "/investors", label: "INVESTORS", description: "PARTNERSHIP OVERVIEW" },
    ],
  },
  {
    id: "ai-products",
    label: "AI PRODUCTS",
    items: [
      {
        href: "/products/ai-website-agents",
        label: "AI AGENT",
        description: "INTELLIGENT BUSINESS AI — ASSISTANT AT /AI",
        highlight: true,
      },
      {
        href: "/products/ai-voice-agents",
        label: "AI VOICE AGENT",
        description: "AI-POWERED PHONE CONVERSATIONS",
        highlight: true,
      },
      {
        href: "/voice-shield",
        label: "VOICESHIELD",
        description: "AI VOICE SECURITY & COMPLIANCE — LIT PRODUCT",
        highlight: true,
      },
      {
        href: "/pricing",
        label: "PRICING",
        description: "COMMERCIAL PLANS USD / INR",
      },
      {
        href: "/knowledge-base",
        label: "KNOWLEDGE BASE",
        description: "ASSISTANT KNOWLEDGE HUB",
      },
      {
        href: "/ai-discovery",
        label: "AI DISCOVERY",
        description: "DISCOVERY WORKSHOP",
      },
      {
        href: "/ai-ethics",
        label: "AI ETHICS",
        description: "RESPONSIBLE AI PRINCIPLES",
      },
    ],
  },
  {
    id: "engage",
    label: "ENGAGE",
    items: [
      { href: "/free-demo", label: "FREE DEMO", description: "SEE THE WORK BEFORE PAYMENT" },
      { href: "/book-consultation", label: "BOOK CONSULTATION", description: "SCHEDULE A CALL" },
      { href: "/support", label: "SUPPORT", description: "HELP AND TICKETS" },
      { href: "/checklist", label: "CHECKLIST", description: "PROJECT READINESS" },
    ],
  },
];
