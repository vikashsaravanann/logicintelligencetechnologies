/**
 * LIT EMAIL v3 Enterprise Design System
 * 
 * Master Visual Tokens:
 * - Canvas: Warm off-white / parchment (#F8F6F2)
 * - Card Surface: Soft premium white (#FFFEFC) with subtle border (#E8E4DC)
 * - Wordmark: Single-line "LOGIC INTELLIGENCE TECHNOLOGIES" (never wraps)
 * - Typography: Editorial serif headings (Georgia) + Sans-serif body
 * - Accents: Butter-yellow highlight (#FFE49A)
 * - CTAs: High-contrast near-black (#171717)
 * - Footer: Corporate dark charcoal (#171717) with verified registration & legal links
 */

export const EMAIL = {
  version: "LIT EMAIL v3",
  width: 600, // Standard 600px email container
  logoUrl: "https://www.logicintelligencetechnologies.in/assets/logo-icon.jpg",
  siteUrl: "https://www.logicintelligencetechnologies.in",
  company: "Logic Intelligence Technologies",
  companyFull: "LOGIC INTELLIGENCE TECHNOLOGIES",
  msmeRegistration: "UDYAM-TN-03-0345274",
  registeredAddress: "Coimbatore, Tamil Nadu, India",
  colors: {
    // Canvas & Card Surfaces
    pageBg: "#F8F6F2", // Warm parchment canvas
    cardBg: "#FFFEFC", // Soft card surface
    cardBorder: "#E8E4DC", // Subtle card outline
    border: "#E8E4DC", // Universal border alias
    surfaceMuted: "#F5F1EA", // Soft beige for detail panels & info grids
    surfaceBorder: "#E5E0D8", // Outline for detail panels
    divider: "#EBE6DD", // Light structural divider

    // Typography
    inkPrimary: "#171717", // Rich dark charcoal / near-black
    text: "#171717", // Primary heading ink (backwards-compat)
    body: "#374151", // Readable high-contrast body ink
    muted: "#6B7280", // Slate supporting text
    faint: "#9CA3AF", // Muted metadata

    // Editorial Highlights
    highlightBg: "#FFE49A", // Warm butter-yellow text highlight
    highlightText: "#171717",

    // Action Buttons
    primary: "#171717", // High-contrast primary CTA
    ctaBg: "#171717",
    ctaText: "#FFFFFF",
    ctaSecondaryBg: "#F5F1EA",
    ctaSecondaryText: "#171717",
    ctaSecondaryBorder: "#D9D3C7",

    // Interactive & Status Tints
    link: "#171717", // Understated editorial link style
    linkAccent: "#1565C0",
    accent: "#0F766E", // Teal accent for badges
    softBg: "#F5F1EA",
    tintBg: "#F0EBE1",

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

    // Dark Corporate Footer
    footerBg: "#171717",
    footerText: "#9CA3AF",
    footerHeading: "#FFFFFF",
    footerBorder: "#262626",
    footerLink: "#D1D5DB",
  },
  // Typography Stacks
  fontSerif: "Georgia, Cambria, 'Times New Roman', Times, serif",
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontMono: "'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;
