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
  /** gated = form + token required; public = intentionally open (e.g. press kit) */
  accessType: ResourceAccessType;
}

export const PDF_RESOURCES: PdfResource[] = [
  {
    id: "pdf-company-profile",
    slug: "company-profile",
    title: "Corporate Capability Profile",
    description: "Official executive overview of Logic Intelligence Technologies, core engineering competencies, leadership, and enterprise client case studies.",
    category: "Corporate",
    filename: "company-profile.pdf",
    publicPath: "/resources/company-profile.pdf",
    coverImage: "/images/resources/company-profile.jpg",
    version: "2026.1",
    publishedAt: "2026-01-15",
    accessType: "gated",
  },
  {
    id: "pdf-services-brochure",
    slug: "services-brochure",
    title: "Engineering Services Brochure",
    description: "Detailed breakdown of our engineering lifecycle, full-stack technologies, engagement models, and dedicated team structures.",
    category: "Services",
    filename: "services-brochure.pdf",
    publicPath: "/resources/services-brochure.pdf",
    coverImage: "/images/resources/services-brochure.jpg",
    version: "2026.1",
    publishedAt: "2026-01-15",
    accessType: "gated",
  },
  {
    id: "pdf-capability-statement",
    slug: "capability-statement",
    title: "Government & Enterprise Capability Statement",
    description: "Official procurement statement detailing past performance, technical capabilities, security certifications, and vendor identification codes.",
    category: "Corporate",
    filename: "capability-statement.pdf",
    publicPath: "/resources/capability-statement.pdf",
    coverImage: "/images/resources/capability-statement.jpg",
    version: "2026.1",
    publishedAt: "2026-01-20",
    accessType: "gated",
  },
  {
    id: "pdf-website-checklist",
    slug: "website-development-checklist",
    title: "Website Development & Production Launch Checklist",
    description: "A 50-point technical checklist covering performance, SEO, mobile responsiveness, accessibility, and security before going live.",
    category: "Technical Guide",
    filename: "website-development-checklist.pdf",
    publicPath: "/resources/website-development-checklist.pdf",
    coverImage: "/images/resources/website-development-checklist.jpg",
    version: "2026.2",
    publishedAt: "2026-02-01",
    accessType: "gated",
  },
  {
    id: "pdf-ai-readiness",
    slug: "ai-readiness-assessment",
    title: "Enterprise AI Readiness Assessment Framework",
    description: "Diagnostic rubric to evaluate organizational data pipelines, model feasibility, latency tolerances, and return on investment.",
    category: "AI & Data",
    filename: "ai-readiness-assessment.pdf",
    publicPath: "/resources/ai-readiness-assessment.pdf",
    coverImage: "/images/resources/ai-readiness-assessment.jpg",
    version: "2026.1",
    publishedAt: "2026-02-10",
    accessType: "gated",
  },
  {
    id: "pdf-automation-guide",
    slug: "business-automation-guide",
    title: "Executive Guide to Business Workflow Automation",
    description: "Strategic playbook for eliminating manual bottlenecks across lead triage, invoicing, customer support, and multi-platform sync.",
    category: "Strategy",
    filename: "business-automation-guide.pdf",
    publicPath: "/resources/business-automation-guide.pdf",
    coverImage: "/images/resources/business-automation-guide.jpg",
    version: "2026.1",
    publishedAt: "2026-02-15",
    accessType: "gated",
  },
  {
    id: "pdf-tech-roadmap",
    slug: "technology-roadmap-template",
    title: "Enterprise Technology Roadmap Template",
    description: "Structured architecture planning template for phasing legacy modernization, cloud migration, and microservice refactoring.",
    category: "Templates",
    filename: "technology-roadmap-template.pdf",
    publicPath: "/resources/technology-roadmap-template.pdf",
    coverImage: "/images/resources/technology-roadmap-template.jpg",
    version: "2026.1",
    publishedAt: "2026-02-20",
    accessType: "gated",
  },
  {
    id: "pdf-proposal-template",
    slug: "project-proposal-template",
    title: "Full-Stack Project Proposal & Scope Template",
    description: "Standardized contract proposal structure detailing milestones, deliverables, payment schedules, assumptions, and client acceptance terms.",
    category: "Templates",
    filename: "project-proposal-template.pdf",
    publicPath: "/resources/project-proposal-template.pdf",
    coverImage: "/images/resources/project-proposal-template.jpg",
    version: "2026.1",
    publishedAt: "2026-02-25",
    accessType: "gated",
  },
  {
    id: "pdf-statement-of-work",
    slug: "statement-of-work",
    title: "Enterprise Statement of Work (SOW) Standard",
    description: "Comprehensive legal and operational SOW document defining acceptance criteria, change request protocols, and IP assignment.",
    category: "Legal & Contracts",
    filename: "statement-of-work.pdf",
    publicPath: "/resources/statement-of-work.pdf",
    coverImage: "/images/resources/statement-of-work.jpg",
    version: "2026.1",
    publishedAt: "2026-03-01",
    accessType: "gated",
  },
  {
    id: "pdf-case-study",
    slug: "case-study",
    title: "Enterprise Digital Transformation Case Study",
    description: "In-depth case study examining how Logic Intelligence Technologies reduced latency by 65% and automated 80% of customer support workflows.",
    category: "Case Studies",
    filename: "case-study.pdf",
    publicPath: "/resources/case-study.pdf",
    coverImage: "/images/resources/case-study.jpg",
    version: "2026.1",
    publishedAt: "2026-03-05",
    accessType: "gated",
  },
  {
    id: "pdf-press-kit",
    slug: "press-kit",
    title: "Official Media & Press Kit",
    description: "Approved company assets, brand guidelines, color palettes, founder biographies, high-resolution logos, and official company boilerplate.",
    category: "Press & Media",
    filename: "press-kit.pdf",
    publicPath: "/resources/press-kit.pdf",
    coverImage: "/images/resources/press-kit.jpg",
    version: "2026.1",
    publishedAt: "2026-03-10",
    accessType: "public",
  },
  {
    id: "pdf-investor-memo",
    slug: "investor-partnership-information-memorandum",
    title: "Investor & Strategic Partnership Information Memorandum",
    description: "Confidential institutional overview outlining market opportunity, proprietary intellectual property, unit economics, and expansion strategy.",
    category: "Investors",
    filename: "investor-partnership-information-memorandum.pdf",
    publicPath: "/resources/investor-partnership-information-memorandum.pdf",
    coverImage: "/images/resources/investor-partnership-information-memorandum.jpg",
    version: "2026.1",
    publishedAt: "2026-03-15",
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
