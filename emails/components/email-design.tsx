export const EMAIL_DESIGNS = {
  verification: { art: "verification", full: false },
  welcome: { art: "welcome", full: true },
  onboarding: { art: "onboarding", full: true },
  campaign: { art: "campaign", full: true },
  workspace: { art: "workspace", full: false },
  milestone: { art: "milestone", full: false },
  payment: { art: "payment", full: false },
  support: { art: "support", full: false },
  maintenance: { art: "maintenance", full: false },
  documents: { art: "milestone", full: false },
  security: { art: "verification", full: false },
  notification: { art: "workspace", full: false },
  transactional: { art: "support", full: false },
} as const;

export type EmailDesign = keyof typeof EMAIL_DESIGNS;
