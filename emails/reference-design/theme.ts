import { COMPANY } from "../../src/config/company";

/** Shared presentation tokens. Business amounts, deadlines and URLs come from callers. */
export const REFERENCE_EMAIL = {
  siteUrl: COMPANY.websiteUrl,
  company: COMPANY.displayName,
  wordmark: COMPANY.displayName.toUpperCase(),
  supportEmail: COMPANY.supportEmail,
  address: COMPANY.address,
  registration: COMPANY.registration.msmeUdyamNumber,
  logoUrl: `${COMPANY.websiteUrl}/assets/logo-icon.jpg`,
  assetUrl: `${COMPANY.websiteUrl}/email-assets/reference`,
  font: "'Nunito Sans', Arial, Helvetica, sans-serif",
  colors: {
    canvas: "#F8F6F3", white: "#FFFFFF", cream: "#FBF8F3",
    ink: "#333333", body: "#505050", muted: "#737373", divider: "#E7E3DE",
    orange: "#F57820", orangeHero: "#FF710B", blue: "#0755ED",
    sky: "#7ABAE9", purple: "#5734A5", navy: "#17153D", charcoal: "#4B5160",
  },
  socials: [
    { name: "LinkedIn", icon: "linkedin", href: COMPANY.linkedinUrl },
    { name: "Instagram", icon: "instagram", href: COMPANY.instagramUrl },
    { name: "X", icon: "x", href: COMPANY.xUrl },
    { name: "YouTube", icon: "youtube", href: COMPANY.youtubeUrl },
  ],
} as const;
