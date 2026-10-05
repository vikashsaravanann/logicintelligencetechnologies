export type ResourceAccessType = "gated" | "public";

export interface PdfResource {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  filename: string;
  /** Legacy public URL — must not be used for gated downloads. */
  publicPath: string;
  coverImage: string;
  version: string;
  publishedAt: string;
  /** gated = form + token required; public = intentionally open */
  accessType: ResourceAccessType;
}

// Official Logic Intelligence Technologies corporate document library.
// All resources are gated: a visitor submits the request form (lead capture),
// then receives the requested PDF by email and via a secure single-use download
// token. Source files live in `private/resources/` and are never served as
// static public assets. Titles/descriptions mirror each document's own cover.
export const PDF_RESOURCES: PdfResource[] = [
  {
    id: "pdf-company-profile",
    slug: "company-profile",
    title: "Company Profile & Executive Overview",
    description:
      "Official corporate document covering the Logic Intelligence Technologies company profile and executive overview.",
    category: "Corporate",
    filename: "company-profile.pdf",
    publicPath: "/resources/company-profile.pdf",
    coverImage: "/images/resources/company-profile.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-services-brochure",
    slug: "services-brochure",
    title: "Services Brochure",
    description:
      "Our core service offerings across the full engineering lifecycle.",
    category: "Services",
    filename: "services-brochure.pdf",
    publicPath: "/resources/services-brochure.pdf",
    coverImage: "/images/resources/services-brochure.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-ai-rpa-capabilities",
    slug: "ai-rpa-capabilities",
    title: "AI & RPA Capabilities",
    description:
      "Autonomous intelligent systems: self-operating pipelines and deterministic AI across our AI and RPA capabilities.",
    category: "AI & Automation",
    filename: "ai-rpa-capabilities.pdf",
    publicPath: "/resources/ai-rpa-capabilities.pdf",
    coverImage: "/images/resources/resources-ai-implementation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-portfolio",
    slug: "portfolio",
    title: "Project Portfolio",
    description:
      "Engineered work, real clients, and production systems. Every project is founder-coded.",
    category: "Case Studies",
    filename: "portfolio.pdf",
    publicPath: "/resources/portfolio.pdf",
    coverImage: "/images/resources/case-study.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-pricing-guide",
    slug: "pricing-guide",
    title: "Transparent Pricing Guide",
    description:
      "Transparent pricing with no hidden fees and a free prototype first.",
    category: "Pricing",
    filename: "pricing-guide.pdf",
    publicPath: "/resources/pricing-guide.pdf",
    coverImage: "/images/resources/resources-digital-transformation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-case-studies",
    slug: "case-studies",
    title: "Engineering Case Studies",
    description:
      "Documented outcomes and measurable results from delivered engineering systems.",
    category: "Case Studies",
    filename: "case-studies.pdf",
    publicPath: "/resources/case-studies.pdf",
    coverImage: "/images/resources/case-study.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-onboarding-guide",
    slug: "onboarding-guide",
    title: "Client Onboarding Guide",
    description:
      "Your journey from first call to live system, step by step.",
    category: "Guides",
    filename: "onboarding-guide.pdf",
    publicPath: "/resources/onboarding-guide.pdf",
    coverImage: "/images/resources/resources-digital-transformation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-technology-stack",
    slug: "technology-stack",
    title: "Technology Stack Reference",
    description:
      "Engineering decisions, stack rationale, and architecture principles.",
    category: "Engineering",
    filename: "technology-stack.pdf",
    publicPath: "/resources/technology-stack.pdf",
    coverImage: "/images/resources/technology-roadmap-template.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-founder-profile",
    slug: "founder-profile",
    title: "Founder Profile",
    description:
      "Founder profile: Vikash Saravanan, engineer, architect, and founder.",
    category: "Corporate",
    filename: "founder-profile.pdf",
    publicPath: "/resources/founder-profile.pdf",
    coverImage: "/images/resources/company-profile.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-security-compliance",
    slug: "security-compliance",
    title: "Security & Compliance",
    description:
      "Row-level security, DPDP alignment, and production-grade hardening.",
    category: "Security",
    filename: "security-compliance.pdf",
    publicPath: "/resources/security-compliance.pdf",
    coverImage: "/images/resources/resources-digital-transformation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-faq",
    slug: "faq",
    title: "Frequently Asked Questions",
    description:
      "Honest answers with technical depth and no spin.",
    category: "Guides",
    filename: "faq.pdf",
    publicPath: "/resources/faq.pdf",
    coverImage: "/images/resources/resources-digital-transformation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-contact-engagement",
    slug: "contact-engagement",
    title: "Contact & Engagement",
    description:
      "How to start a free discovery session and engage with our team.",
    category: "Corporate",
    filename: "contact-engagement.pdf",
    publicPath: "/resources/contact-engagement.pdf",
    coverImage: "/images/resources/resources-digital-transformation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-brand-book",
    slug: "brand-book",
    title: "Brand Book",
    description:
      "The official Logic Intelligence Technologies brand book: identity, logos, and guidelines.",
    category: "Press & Media",
    filename: "brand-book.pdf",
    publicPath: "/resources/brand-book.pdf",
    coverImage: "/images/resources/press-kit.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-investor-briefing",
    slug: "investor-briefing",
    title: "Investor Briefing",
    description:
      "Q3/Q4 2026 operating update and investor briefing.",
    category: "Investors",
    filename: "investor-briefing.pdf",
    publicPath: "/resources/investor-briefing.pdf",
    coverImage: "/images/resources/investor-partnership-information-memorandum.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
  {
    id: "pdf-knowledge-assistant",
    slug: "knowledge-assistant",
    title: "Knowledge Assistant",
    description:
      "Your documents, not the open web: an overview of our private RAG knowledge assistant.",
    category: "AI & Automation",
    filename: "knowledge-assistant.pdf",
    publicPath: "/resources/knowledge-assistant.pdf",
    coverImage: "/images/resources/resources-ai-implementation.webp",
    version: "2026.1",
    publishedAt: "2026-10-05",
    accessType: "gated",
  },
];

export function getPdfResourceBySlug(slug: string): PdfResource | undefined {
  return PDF_RESOURCES.find((r) => r.slug === slug);
}

export function isGatedResource(slug: string): boolean {
  const r = getPdfResourceBySlug(slug);
  return !r || r.accessType === "gated";
}

/** Filenames that must never be served as static public assets */
export const GATED_PDF_FILENAMES: string[] = PDF_RESOURCES.filter(
  (r) => r.accessType === "gated"
).map((r) => r.filename);
