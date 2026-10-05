export const COMPANY = {
  /** Trading / brand name shown in UI and emails */
  legalName: 'Logic Intelligence Technologies',
  displayName: 'Logic Intelligence Technologies',
  /** Entity type for public copy. Matches LEGAL_CONFIG.entityType; the jobs
   *  page states incorporation is still pending, so no company-form suffix. */
  entityType: 'Technology Startup',
  entityLabel: 'Technology Startup',
  address: 'Coimbatore, Tamil Nadu, India',
  location: {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
  },
  email: 'hello@logicintelligencetechnologies.in',
  contactEmail: 'contact@logicintelligencetechnologies.in',
  supportEmail: 'support@logicintelligencetechnologies.in',
  adminEmail: 'admin@logicintelligencetechnologies.in',
  phone: '+91 7550067712',
  whatsappNumber: '917550067712',
  whatsappGroupUrl: 'https://chat.whatsapp.com/IHHqqbi0t3P8pC9Dyou53k?mode=gi_t',
  telegramBotUrl: 'https://t.me/LogicIntelligenceTechnologiesbot',
  telegramUrl: 'https://t.me/LogicIntelligenceTechnologiesbot',
  instagramUrl: 'https://www.instagram.com/logicintelligencetechnologies/',
  linkedinUrl: 'https://www.linkedin.com/company/logic-intelligence-technologies/',
  xUrl: 'https://x.com/logicintelltech',
  twitterUrl: 'https://x.com/logicintelltech',
  facebookUrl: 'https://www.facebook.com/logicintelligencetechnologies/',
  youtubeUrl: 'https://www.youtube.com/@logicintelligencetechnologies',
  threadsUrl: 'https://www.threads.com/@logicintelligencetechnologies/',
  githubUrl: 'https://github.com/vikashsaravanann',
  websiteUrl: 'https://www.logicintelligencetechnologies.in',
  logoIconPath: '/assets/logo-icon.jpg',
  logoFullPath: '/assets/logo.jpg',
  bannerPath: '/assets/og-banner.png',
  tagline: 'Where Logic Meets Innovation',
  founder: {
    name: 'Vikash Saravanan',
    title: 'Founder & CEO',
    photoPath: '/images/founder/founder-about-card.jpg',
    photoPathWebp: '/images/founder/founder-about-main.jpg',
    photoPathJpg: '/images/founder/founder-about-main.jpg',
    bio: 'Vikash Saravanan is an AI and data science engineer and the Founder & CEO of Logic Intelligence Technologies. His work focuses on full-stack software engineering, intelligent automation, workflow systems, and scalable application architecture.',
    portfolioUrl: 'https://vikashsaravanann.github.io/startupwithvikash/',
    linkedinUrl: 'https://www.linkedin.com/in/vikash-saravanan-j7528/',
    githubUrl: 'https://github.com/vikashsaravanann',
    instagramUrl: 'https://www.instagram.com/vikash.saravanann',
  },
  emails: {
    hello: 'hello@logicintelligencetechnologies.in',
    contact: 'contact@logicintelligencetechnologies.in',
    support: 'support@logicintelligencetechnologies.in',
    admin: 'admin@logicintelligencetechnologies.in',
    noReply: 'no-reply@logicintelligencetechnologies.in',
    vikash: 'vikash@logicintelligencetechnologies.in',
  },
  products: {
    logicVoice: {
      name: 'Logic Voice',
      tagline: 'Voice-First Personal AI Assistant',
      category: 'AI Voice Assistant',
      legalLine:
        'Logic Voice — an AI product by Logic Intelligence Technologies',
      path: '/products/logic-voice',
      websiteUrl: 'https://logicvoice.logicintelligencetechnologies.in/',
      githubUrl: 'https://github.com/vikashsaravanann/logic-voice',
      description:
        'A voice-first personal AI assistant designed to let users interact naturally through speech, understanding, reasoning, planning, and executing approved tools.',
    },
    voiceShield: {
      name: 'VoiceShield',
      tagline: 'Voice Security & Risk Intelligence',
      category: 'Voice Security & Risk Intelligence',
      legalLine:
        'VoiceShield — a product of Logic Intelligence Technologies',
      path: '/voice-shield',
      requestPath: '/voice-shield/request',
      websiteUrl: 'https://voiceshield.logicintelligencetechnologies.in/',
      consoleUrl: 'https://voiceshield.logicintelligencetechnologies.in',
      githubUrl: 'https://github.com/vikashsaravanann/voice-shield',
      description:
        'A voice-security and voice-risk intelligence product designed to analyze voice interactions and produce structured intelligence around security, fraud, risk, and compliance signals.',
    },
  },
} as const;

export const LEGAL_LAST_UPDATED = 'September 19, 2026';

// Backward-compatibility alias kept for any existing imports
export const companyConfig = COMPANY;
