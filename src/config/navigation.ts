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
  { href: "/products/logic-voice", label: "LOGIC VOICE" },
  { href: "/voice-shield", label: "VOICESHIELD" },
  { href: "/products", label: "PRODUCTS" },
  { href: "/services", label: "SOLUTIONS" },
  { href: "/industries", label: "INDUSTRIES" },
  { href: "/work", label: "WORK" },
  { href: "/about", label: "COMPANY" },
  { href: "/contact", label: "CONTACT" },
];

export const PRIMARY_CTA: NavItem = {
  href: "/book-consultation",
  label: "BOOK A CONSULTATION",
};

/**
 * Every public page, grouped for the desktop "More" menu and the mobile menu.
 * tests/navigation/more-nav.test.ts checks that each public page is listed.
 */
export const MORE_NAV_GROUPS: NavGroup[] = [
  {
    id: "company",
    label: "COMPANY",
    items: [
      { href: "/about", label: "ABOUT US", description: "WHO WE ARE" },
      { href: "/about/founder", label: "FOUNDER", description: "VIKASH SARAVANAN PROFILE" },
      { href: "/expertise", label: "EXPERTISE", description: "ENGINEERING CAPABILITIES" },
      { href: "/certifications", label: "CERTIFICATIONS", description: "PROFESSIONAL CREDENTIALS" },
      { href: "/company/facts", label: "COMPANY FACTS", description: "FACT SHEET" },
      { href: "/careers", label: "CAREERS", description: "CULTURE AND OPEN PATHS" },
      { href: "/jobs", label: "LEADERSHIP JOBS", description: "CEO AND DIRECTOR SEATS" },
      { href: "/press", label: "PRESS KIT", description: "MEDIA AND BRAND ASSETS" },
      { href: "/investors", label: "INVESTORS", description: "PARTNERSHIP OVERVIEW" },
      { href: "/investor-brief", label: "INVESTOR BRIEF", description: "PERFORMANCE AND VISION" },
      { href: "/community", label: "COMMUNITY", description: "ARCHITECT COMMUNITY" },
    ],
  },
  {
    id: "products",
    label: "PRODUCTS",
    items: [
      { href: "/products", label: "ALL PRODUCTS", description: "PRODUCT OVERVIEW" },
      { href: "/products/logic-voice", label: "LOGIC VOICE", description: "VOICE-FIRST PERSONAL AI ASSISTANT" },
      { href: "/voice-shield", label: "VOICESHIELD", description: "AI VOICE SECURITY" },
      { href: "/voice-shield/request", label: "VOICESHIELD ACCESS", description: "REQUEST CONSOLE ACCESS" },
      { href: "/roi-calculator", label: "VOICESHIELD ROI", description: "ESTIMATE THE SAVINGS" },
      { href: "/docs/api", label: "VOICESHIELD API", description: "DEVELOPER REFERENCE" },
      { href: "/products/ai-voice-agents", label: "AI VOICE AGENTS", description: "AI FRONT DESK FOR CALLS" },
      { href: "/products/ai-website-agents", label: "AI WEBSITE AGENTS", description: "TURN VISITORS INTO LEADS" },
      { href: "/ai", label: "AI WEBSITE BUILDER", description: "BUILD AND GROW YOUR SITE" },
      { href: "/ai-assistant", label: "DOCUMENT AI", description: "ANSWERS FROM YOUR DOCUMENTS" },
      { href: "/products/facts", label: "PRODUCT FACTS", description: "PUBLIC FACT SHEET" },
    ],
  },
  {
    id: "services",
    label: "SERVICES & PRICING",
    items: [
      { href: "/services", label: "SOLUTIONS", description: "WHAT WE BUILD" },
      { href: "/industries", label: "INDUSTRIES", description: "SECTOR EXPERIENCE" },
      { href: "/work", label: "OUR WORK", description: "CASE STUDIES" },
      { href: "/packages", label: "PACKAGES", description: "FIXED-SCOPE BUNDLES" },
      { href: "/pricing", label: "PRICING", description: "PLANS IN USD / INR" },
      { href: "/free-demo", label: "FREE DEMO", description: "SEE THE WORK BEFORE PAYMENT" },
      { href: "/ai-discovery", label: "AI DISCOVERY", description: "DISCOVERY WORKSHOP" },
      { href: "/discovery", label: "PROJECT QUESTIONNAIRE", description: "SCOPE YOUR PROJECT" },
      { href: "/checklist", label: "PROJECT CHECKLIST", description: "PROJECT READINESS" },
    ],
  },
  {
    id: "resources",
    label: "RESOURCES",
    items: [
      { href: "/resources", label: "PDF RESOURCES", description: "FRAMEWORKS AND BRIEFS" },
      { href: "/blog", label: "BLOG", description: "ENGINEERING AND BUSINESS" },
      { href: "/knowledge-base", label: "KNOWLEDGE BASE", description: "AI KNOWLEDGE HUB" },
      { href: "/architecture", label: "ARCHITECTURE", description: "HOW OUR SYSTEMS FIT" },
      { href: "/security", label: "SECURITY", description: "SECURITY PRACTICES" },
      { href: "/ai-ethics", label: "AI ETHICS", description: "RESPONSIBLE AI PRINCIPLES" },
      { href: "/status", label: "SYSTEM STATUS", description: "LIVE SERVICE CHECKS" },
      { href: "/search", label: "SEARCH", description: "FIND ANY PAGE" },
    ],
  },
  {
    id: "support",
    label: "CONTACT & SUPPORT",
    items: [
      { href: "/contact", label: "CONTACT", description: "START YOUR PROJECT" },
      { href: "/book-consultation", label: "BOOK CONSULTATION", description: "SCHEDULE A CALL" },
      { href: "/sales", label: "ENTERPRISE SALES", description: "LARGER ENGAGEMENTS" },
      { href: "/support", label: "SUPPORT", description: "HELP AND TICKETS" },
      { href: "/support/new", label: "NEW TICKET", description: "REPORT AN ISSUE" },
      { href: "/help-center", label: "HELP CENTER", description: "GUIDES AND ANSWERS" },
    ],
  },
  {
    id: "legal",
    label: "LEGAL",
    items: [
      { href: "/privacy", label: "PRIVACY POLICY" },
      { href: "/terms", label: "TERMS OF SERVICE" },
      { href: "/cookie-policy", label: "COOKIE POLICY" },
      { href: "/refund-policy", label: "REFUND POLICY" },
      { href: "/accessibility", label: "ACCESSIBILITY" },
    ],
  },
];
