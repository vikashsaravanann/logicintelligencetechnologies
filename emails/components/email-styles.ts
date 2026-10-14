/** Shared email design tokens — LIT EMAIL v2 Enterprise Design System */
export const EMAIL = {
  version: "LIT EMAIL v2",
  width: 620, // Centered 620px card container
  logoUrl: "https://www.logicintelligencetechnologies.in/assets/logo-icon.jpg",
  siteUrl: "https://www.logicintelligencetechnologies.in",
  company: "Logic Intelligence Technologies",
  colors: {
    pageBg: "#F7F9FC", // Cloud/off-white canvas
    cardBg: "#FFFFFF", // Crisp white card
    text: "#0B2545", // Corporate navy for headings & primary accents
    body: "#121826", // Readable high-contrast ink
    muted: "#52677C", // Slate supporting text
    faint: "#8898AA", // Subtle metadata / copyright
    border: "#DFE7EF", // Clean light border
    divider: "#DFE7EF",
    primary: "#1565C0", // Corporate action blue
    accent: "#1FA9A2", // Selective accent teal
    ctaBg: "#1565C0", // Primary action button background
    ctaText: "#FFFFFF",
    ctaSecondaryBg: "#0B2545",
    link: "#1565C0",
    softBg: "#F7F9FC",
    tintBg: "#E7F3FF", // Subtle informational tint
    successBg: "#ECFDF5",
    successText: "#065F46",
    successBorder: "#A7F3D0",
    warningBg: "#FFFBEB",
    warningText: "#92400E",
    warningBorder: "#FDE68A",
    alertBg: "#FEF2F2",
    alertText: "#991B1B",
    alertBorder: "#FECACA",
  },
  font: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontMono: "'JetBrains Mono', Consolas, Menlo, Monaco, monospace",
} as const;
