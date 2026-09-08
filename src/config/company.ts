export const COMPANY = {
  /** Trading / brand name shown in UI and emails */
  legalName: 'Logic Intelligence Technologies',
  displayName: 'Logic Intelligence Technologies',
  /** Entity type for public copy — startup studio, not a Pvt. Ltd. */
  entityType: 'Startup',
  entityLabel: 'Technology Startup',
  address: 'Coimbatore, Tamil Nadu, India',
  email: 'support@logicintelligencetechnologies.in',
  phone: '+91 93428 77474',
  whatsappNumber: '919342877474',
  whatsappGroupUrl: 'https://chat.whatsapp.com/IHHqqbi0t3P8pC9Dyou53k?mode=gi_t',
  telegramBotUrl: 'https://t.me/LogicIntelligenceTechnologiesbot',
  instagramUrl: 'https://www.instagram.com/logicintelligencetechnologies?igsi=MXVmbGU3M3JiOTNmdw%3D%3D&utm_source=qr',
  linkedinUrl: 'https://www.linkedin.com/company/logic-intelligence-technologies/',
  facebookUrl: 'https://www.facebook.com/share/166anMT53Cj/?mibextid=wwXIfr',
  websiteUrl: 'https://www.logicintelligencetechnologies.in',
  logoIconPath: '/assets/logo-icon.webp',
  logoFullPath: '/assets/logo.jpg',
  bannerPath: '/assets/banner.jpg',
  tagline: 'Where Logic Meets Innovation',
  founder: {
    name: 'Vikash Saravanan',
    title: 'Founder',
    photoPath: '/assets/founder.jpg',
    bio: 'B.Tech student in Artificial Intelligence & Data Science and founder of Logic Intelligence Technologies. Vikash started the studio to give Coimbatore businesses — and teams across India — production-ready web products and practical AI systems, with transparent pricing and a free demo before payment.',
  },
  emails: {
    noReply: 'no-reply@logicintelligencetechnologies.in',
    vikash: 'vikash@logicintelligencetechnologies.in',
    hello: 'hello@logicintelligencetechnologies.in',
    admin: 'admin@logicintelligencetechnologies.in',
    support: 'support@logicintelligencetechnologies.in',
  },
} as const;

export const LEGAL_LAST_UPDATED = 'September 7, 2026';

// Backward-compatibility alias kept for any existing imports
export const companyConfig = COMPANY;
