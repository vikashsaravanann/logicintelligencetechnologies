/** Shared email design tokens — Highly Professional PDF-like layout */
export const EMAIL = {
  width: 680, // Slightly wider for a more professional document look
  logoUrl: "https://www.logicintelligencetechnologies.in/assets/logo-icon.jpg",
  siteUrl: "https://www.logicintelligencetechnologies.in",
  company: "Logic Intelligence Technologies",
  colors: {
    pageBg: "#F5F1E7", // Sandal/Parchment background like a PDF document
    cardBg: "#FFFFFF", // Crisp white for the document body
    text: "#111827", // Almost black for high contrast reading
    body: "#374151",
    muted: "#6B7280",
    faint: "#9CA3AF",
    border: "#E5E7EB",
    divider: "#E5E7EB",
    ctaBg: "#111827", // Professional dark button
    ctaText: "#FFFFFF",
    link: "#2563EB",
    softBg: "#F9FAFB",
    alertBg: "#FEF2F2",
    alertText: "#991B1B",
  },
  font: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontMono: '"JetBrains Mono", Consolas, Menlo, Monaco, monospace',
} as const;
