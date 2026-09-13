import { COMPANY } from "./company";

export const LEGAL_CONFIG = {
  entityName: COMPANY.legalName,
  tradeName: COMPANY.displayName,
  entityType: "Technology Startup",
  jurisdiction: "Coimbatore / Karur, Tamil Nadu, India",
  governingLaw: "Laws of India",
  copyrightYear: new Date().getFullYear(),
  lastUpdated: "March 2026",
  officialContactEmail: COMPANY.email,
  policies: {
    privacy: { path: "/privacy", title: "Privacy Policy" },
    terms: { path: "/terms", title: "Terms of Service" },
    refund: { path: "/refund-policy", title: "Refund Policy" },
    cookies: { path: "/cookie-policy", title: "Cookie Policy" },
    accessibility: { path: "/accessibility", title: "Accessibility Statement" },
  },
} as const;
