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
    label: 'Company',
    items: [
      { href: '/about', label: 'About', description: 'Mission, vision, and approach' },
      { href: '/about/founder', label: 'Founder', description: 'Vikash Saravanan profile' },
      { href: '/careers', label: 'Careers', description: 'Open roles' },
      { href: '/press', label: 'Press', description: 'Media and brand assets' },
      { href: '/investors', label: 'Investors', description: 'Partnership overview' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      { href: '/blog', label: 'Blog', description: 'Engineering and product notes' },
      { href: '/resources', label: 'Resource Center', description: 'Guides and PDF downloads' },
      { href: '/work', label: 'Case Studies', description: 'Selected work' },
      { href: '/checklist', label: 'Website Checklist', description: 'Production QA framework' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { href: '/ai', label: 'AI Assistant', description: 'Company knowledge workspace' },
      { href: '/discovery', label: 'Discovery', description: 'Start a structured discovery' },
      { href: '/free-demo', label: 'Free Demo', description: 'Request a working direction' },
      { href: '/packages', label: 'Packages', description: 'Fixed-scope offerings' },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    items: [
      { href: '/contact', label: 'Contact', description: 'Reach the team' },
      { href: '/support', label: 'Customer Support', description: 'Tickets and help' },
      { href: '/client/login', label: 'Client Portal', description: 'Existing client access' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    items: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/refund-policy', label: 'Refund Policy' },
      { href: '/cookie-policy', label: 'Cookie Policy' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  },
];

export const MORE_NAV_FLAT: NavItem[] = MORE_NAV_GROUPS.flatMap((g) => g.items);
