/**
 * Central navigation model for Logic Intelligence Technologies.
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

export const PRIMARY_NAV: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Solutions' },
  { href: '/industries', label: 'Industries' },
  { href: '/work', label: 'Work' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'Company' },
  { href: '/contact', label: 'Contact' },
];

export const PRIMARY_CTA: NavItem = {
  href: '/book-consultation',
  label: 'Book a Consultation',
};

export const MORE_NAV_GROUPS: NavGroup[] = [
  {
    id: 'company',
    label: 'COMPANY',
    items: [
      { href: '/about', label: 'ABOUT', description: 'MISSION, VISION, AND APPROACH' },
      { href: '/about/founder', label: 'FOUNDER', description: 'VIKASH SARAVANAN PROFILE' },
      { href: '/expertise', label: 'TECHNICAL EXPERTISE', description: 'ENGINEERING CAPABILITIES' },
      { href: '/careers', label: 'CAREERS', description: 'OPEN ROLES' },
      { href: '/press', label: 'PRESS', description: 'MEDIA AND BRAND ASSETS' },
      { href: '/investors', label: 'INVESTORS', description: 'PARTNERSHIP OVERVIEW' },
    ],
  },
  {
    id: 'resources',
    label: 'RESOURCES',
    items: [
      { href: '/certifications', label: 'CERTIFICATIONS', description: 'VERIFIED CREDENTIALS' },
      { href: '/blog', label: 'BLOG', description: 'ENGINEERING AND PRODUCT NOTES' },
      { href: '/resources', label: 'RESOURCE CENTER', description: 'GUIDES AND PDF DOWNLOADS' },
      { href: '/work', label: 'CASE STUDIES', description: 'SELECTED WORK' },
      { href: '/checklist', label: 'WEBSITE CHECKLIST', description: 'PRODUCTION QA FRAMEWORK' },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    items: [
      { href: '/ai', label: 'AI ASSISTANT', description: 'COMPANY KNOWLEDGE WORKSPACE' },
      { href: '/discovery', label: 'DISCOVERY', description: 'START A STRUCTURED DISCOVERY' },
      { href: '/free-demo', label: 'FREE DEMO', description: 'REQUEST A WORKING DIRECTION' },
      { href: '/packages', label: 'PACKAGES', description: 'FIXED-SCOPE OFFERINGS' },
    ],
  },
  {
    id: 'support',
    label: 'SUPPORT',
    items: [
      { href: '/contact', label: 'CONTACT', description: 'REACH THE TEAM' },
      { href: '/support', label: 'CUSTOMER SUPPORT', description: 'TICKETS AND HELP' },
      { href: '/login', label: 'CLIENT SIGN IN', description: 'CLIENT & TEAM AUTHENTICATION' },
      { href: '/profile', label: 'ACCOUNT PROFILE', description: 'CLIENT PORTAL & SETTINGS' },
    ],
  },
  {
    id: 'legal',
    label: 'LEGAL',
    items: [
      { href: '/privacy', label: 'PRIVACY' },
      { href: '/terms', label: 'TERMS' },
      { href: '/refund-policy', label: 'REFUND POLICY' },
      { href: '/cookie-policy', label: 'COOKIE POLICY' },
      { href: '/accessibility', label: 'ACCESSIBILITY' },
    ],
  },
];

export const MORE_NAV_FLAT: NavItem[] = MORE_NAV_GROUPS.flatMap((g) => g.items);
