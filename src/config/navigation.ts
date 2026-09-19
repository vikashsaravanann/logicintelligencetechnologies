/**
 * Central navigation model for Logic Intelligence Technologies.
 * Last updated: 2026-09-19 — Added VoiceShield AI product navigation.
 */
export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Always-visible desktop primary links. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "HOME" },
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

/**
 * More menu — secondary destinations only.
 * Do NOT repeat PRIMARY_NAV hrefs (/about, /work, /resources, /contact).
 * Do NOT repeat header auth (login / profile) — handled by AuthNavControl.
 */
export const MORE_NAV_GROUPS: NavGroup[] = [
  {
    id: "company",
    label: "COMPANY",
    items: [
      { href: "/about/founder", label: "FOUNDER", description: "VIKASH SARAVANAN PROFILE" },
      { href: "/expertise", label: "TECHNICAL EXPERTISE", description: "ENGINEERING CAPABILITIES" },
      { href: "/careers", label: "CAREERS", description: "CULTURE AND OPEN PATHS" },
      { href: "/jobs", label: "LEADERSHIP JOBS", description: "CEO AND DIRECTOR SEATS" },
      { href: "/press", label: "PRESS", description: "MEDIA AND BRAND ASSETS" },
      { href: "/investors", label: "INVESTORS", description: "PARTNERSHIP OVERVIEW" },
    ],
  },
  {
    id: "ai-products",
    label: "AI PRODUCTS",
    items: [
      {
        href: "/voice-shield",
        label: "VOICESHIELD",
        description: "AI VOICE SECURITY & ANTI-SPOOFING",
      },
      {
        href: "/voice-shield/demo",
        label: "VOICESHIELD DEMO",
        description: "REAL-TIME DETECTION EXPERIENCE",
      },
    ],
  },
  {
    id: "resources",
    label: "RESOURCES",
    items: [
      { href: "/blog", label: "BLOG", description: "ENGINEERING AND PRODUCT NOTES" },
      { href: "/certifications", label: "CERTIFICATIONS", description: "VERIFIED CREDENTIALS" },
      { href: "/checklist", label: "WEBSITE CHECKLIST", description: "PRODUCTION QA FRAMEWORK" },
      { href: "/packages", label: "PACKAGES", description: "FIXED-SCOPE OFFERINGS" },
    ],
  },
  {
    id: "tools",
    label: "TOOLS",
    items: [
      { href: "/ai", label: "AI ASSISTANT", description: "COMPANY KNOWLEDGE WORKSPACE" },
      { href: "/discovery", label: "DISCOVERY", description: "START A STRUCTURED DISCOVERY" },
      { href: "/free-demo", label: "FREE DEMO", description: "REQUEST A WORKING DIRECTION" },
      { href: "/knowledge", label: "KNOWLEDGE BASE", description: "ASSISTANT KNOWLEDGE HUB" },
    ],
  },
  {
    id: "support",
    label: "SUPPORT",
    items: [
      { href: "/support", label: "CUSTOMER SUPPORT", description: "TICKETS AND HELP" },
    ],
  },
  {
    id: "legal",
    label: "LEGAL",
    items: [
      { href: "/privacy", label: "PRIVACY", description: "DATA HANDLING POLICIES" },
      { href: "/terms", label: "TERMS", description: "USER AGREEMENTS" },
      { href: "/refund-policy", label: "REFUND POLICY", description: "PAYMENT TERMS" },
      { href: "/cookie-policy", label: "COOKIE POLICY", description: "TRACKING INFORMATION" },
      { href: "/accessibility", label: "ACCESSIBILITY", description: "WCAG COMPLIANCE" },
    ],
  },
];

export const MORE_NAV_FLAT: NavItem[] = MORE_NAV_GROUPS.flatMap((g) => g.items);
