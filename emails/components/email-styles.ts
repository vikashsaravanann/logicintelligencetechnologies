import { COMPANY } from "@/config/company";

/**
 * LIT EMAIL v3 Reference-Family Design System
 * 
 * Master Visual Tokens matching reference design family:
 * - Canvas: Warm off-white (#F8F6F3)
 * - Card Surface: Clean white (#FFFFFF)
 * - Detail Surface: Warm cream (#FBF8F3)
 * - Wordmark: Single-line "LOGIC INTELLIGENCE TECHNOLOGIES" (never wraps)
 * - Typography: Friendly rounded sans-serif (Nunito Sans / Arial)
 * - Accents: Reference orange (#F57820), Strong orange hero (#FF710B), Campaign blue (#0755ED), Sky (#7ABAE9)
 * - CTAs: Pill-shaped orange (#F57820) / blue (#0755ED) / charcoal (#4B5160)
 * - Footer: Light reference footer with centered support, thin divider, monochrome social icons
 */

export const EMAIL = {
  version: "LIT EMAIL v3 (Reference-Family)",
  width: 600, // Standard 600px email container
  logoUrl: `${COMPANY.websiteUrl}/assets/logo-icon.jpg`,
  assetUrl: `${COMPANY.websiteUrl}/email-assets/reference`,
  siteUrl: COMPANY.websiteUrl,
  company: COMPANY.displayName,
  companyFull: COMPANY.displayName.toUpperCase(),
  msmeRegistration: COMPANY.registration.msmeUdyamNumber,
  registeredAddress: COMPANY.address,
  supportEmail: COMPANY.supportEmail,
  colors: {
    // Canvas & Card Surfaces
    pageBg: "#F8F6F3", // Warm off-white canvas (parchment)
    cardBg: "#FFFFFF", // Clean white email card surface
    cardBorder: "#E7E3DE", // Subtle outline
    border: "#E7E3DE", // Universal border alias
    surfaceMuted: "#FBF8F3", // Warm cream detail surface
    surfaceBorder: "#E7E3DE", // Outline for detail panels
    divider: "#E7E3DE", // Light structural divider

    // Typography
    inkPrimary: "#333333", // Rich dark charcoal / near-black
    text: "#333333", // Primary heading ink
    body: "#505050", // Readable high-contrast body ink
    muted: "#737373", // Slate supporting text
    faint: "#9CA3AF", // Muted metadata

    // Reference Accent Palettes
    orange: "#F57820", // Orange accent
    orangeHero: "#FF710B", // Strong orange hero
    yellow: "#FFD400", // Bright yellow
    softYellow: "#FFE45B", // Soft yellow
    blue: "#0755ED", // Campaign blue
    sky: "#7ABAE9", // Sky blue
    purple: "#5734A5", // Purple hero
    navy: "#17153D", // Dark navy
    charcoal: "#4B5160", // Charcoal welcome CTA

    // Action Buttons
    primary: "#F57820", // Orange pill primary CTA
    ctaBg: "#F57820",
    ctaText: "#FFFFFF",
    ctaSecondaryBg: "#FBF8F3",
    ctaSecondaryText: "#171717",
    ctaSecondaryBorder: "#E7E3DE",

    // Interactive & Status Tints
    link: "#F57820",
    linkAccent: "#0755ED",
    accent: "#F57820",
    softBg: "#FBF8F3",
    tintBg: "#F8F6F3",

    // Semantic Status Tokens
    successBg: "#ECFDF5",
    successText: "#065F46",
    successBorder: "#A7F3D0",
    warningBg: "#FFFBEB",
    warningText: "#92400E",
    warningBorder: "#FDE68A",
    alertBg: "#FEF2F2",
    alertText: "#991B1B",
    alertBorder: "#FECACA",

    // Light Reference Footer (Replacing dark charcoal default)
    footerBg: "#FFFFFF",
    footerText: "#737373",
    footerHeading: "#171717",
    footerBorder: "#E7E3DE",
    footerLink: "#505050",
  },
  // Typography Stacks: Friendly rounded sans-serif
  fontSerif: "'Nunito Sans', Arial, Helvetica, sans-serif",
  fontSans: "'Nunito Sans', Arial, Helvetica, sans-serif",
  font: "'Nunito Sans', Arial, Helvetica, sans-serif",
  fontMono: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  socials: [
    { name: "LinkedIn", icon: "linkedin", href: COMPANY.linkedinUrl },
    { name: "Instagram", icon: "instagram", href: COMPANY.instagramUrl },
    { name: "X", icon: "x", href: COMPANY.xUrl },
    { name: "YouTube", icon: "youtube", href: COMPANY.youtubeUrl },
  ],
} as const;
