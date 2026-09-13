import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { packagesData } from "@/data/packagesData";

export const SITE = COMPANY.websiteUrl.replace(/\/$/, "");
export const LOGO_48 = `${SITE}/icon-48.png`;
export const LOGO_192 = `${SITE}/icon-192.png`;
export const LOGO_512 = `${SITE}/icon.png`;
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;
export const FOUNDER_ID = `${SITE}/#founder`;

export function breadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE}${item.path}`,
    })),
  };
}

export function organizationNode() {
  return {
    "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
    "@id": ORG_ID,
    name: COMPANY.displayName,
    legalName: COMPANY.legalName,
    url: SITE,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    image: LOGO_512,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE}/#logo`,
      url: LOGO_192,
      contentUrl: LOGO_192,
      width: 192,
      height: 192,
      caption: COMPANY.displayName,
    },
    description:
      "Coimbatore web and AI development studio. Custom websites, software, and private knowledge assistants. Free demo before payment.",
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 11.0168,
      longitude: 76.9558,
    },
    areaServed: ["Coimbatore", "Tamil Nadu", "India"],
    sameAs: [COMPANY.linkedinUrl, COMPANY.instagramUrl, COMPANY.facebookUrl],
    founder: { "@id": FOUNDER_ID },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: COMPANY.phone,
        email: COMPANY.email,
        availableLanguage: ["English", "Tamil"],
      },
    ],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE,
    name: COMPANY.displayName,
    description: COMPANY.tagline,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function founderNode() {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: FOUNDER.name,
    alternateName: FOUNDER.alternateNames,
    url: FOUNDER.portfolioUrl,
    jobTitle: FOUNDER.title,
    description: FOUNDER.shortBio,
    image: {
      "@type": "ImageObject",
      url: FOUNDER.imageUrl,
    },
    worksFor: { "@id": ORG_ID },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: FOUNDER.education.institution,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    knowsAbout: [
      ...FOUNDER.expertise.programmingLanguages,
      ...FOUNDER.expertise.backendAndApiEngineering,
      ...FOUNDER.expertise.frontendEngineering,
      ...FOUNDER.expertise.databaseAndCloudInfrastructure,
      ...FOUNDER.expertise.automationAndAi,
    ],
    sameAs: [
      FOUNDER.portfolioUrl,
      FOUNDER.linkedinUrl,
      FOUNDER.githubUrl,
      FOUNDER.instagramUrl,
      FOUNDER.companyUrl,
    ],
  };
}

export function faqPage(url: string, pairs: Array<{ q: string; a: string }>) {
  return {
    "@type": "FAQPage",
    url,
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.q,
      acceptedAnswer: { "@type": "Answer", text: p.a },
    })),
  };
}

export function packageOffers() {
  const prices: Record<string, number> = {
    "digital-launch-pack": 8999,
    "business-pro-pack": 18999,
    "enterprise-pack": 50000,
  };
  return {
    "@type": "ItemList",
    name: "LOGIC INTELLIGENCE TECHNOLOGIES packages",
    itemListElement: packagesData.map((pack, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: pack.title,
        description: pack.subtitle,
        url: `${SITE}/packages/${pack.slug}`,
        provider: { "@id": ORG_ID },
        areaServed: "IN",
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: prices[pack.slug] ?? 8999,
          availability: "https://schema.org/InStock",
          url: `${SITE}/packages/${pack.slug}`,
        },
      },
    })),
  };
}

export const JOB_SEATS = [
  {
    title: "Chief Executive Officer",
    slug: "ceo",
    description:
      "Own P&L, delivery cadence, and the next 90 days of Logic Intelligence Technologies in Coimbatore. Employment seat — not a purchased title.",
  },
  {
    title: "Director of Engineering",
    slug: "director-engineering",
    description:
      "Own the Next.js, FastAPI, and AI delivery stack. Ship production systems with the founder.",
  },
];

export const HOW_TO_STEPS = [
  { name: "Book a free consultation", text: "Share goals, constraints, and timeline." },
  { name: "Review the free demo", text: "See the proposed structure before you pay." },
  { name: "Go live and hand over source", text: "DNS, SSL, Search Console, and repository on full payment." },
];


export const PACKAGES_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What is included in the Digital Launch Pack?",
    a: "A production-ready marketing site with core pages, contact forms, SEO basics, and deployment to Vercel. Starting from ₹8,999.",
  },
  {
    q: "Can packages be customized?",
    a: "Yes. Fixed-scope packs set a clear floor; Enterprise and custom SOWs expand scope after a discovery call.",
  },
  {
    q: "Do you hand over source code?",
    a: "Yes. On full payment you receive repository access, DNS/SSL guidance, and Search Console setup.",
  },
];

export const JOBS_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Are these partnership seats or employment roles?",
    a: "Employment and leadership seats. Titles are not for sale. Equity, if any, follows entity formation and performance.",
  },
  {
    q: "Where is the team based?",
    a: "Primary base is Coimbatore / Tamil Nadu, India. Early roles expect in-person collaboration with the founder.",
  },
  {
    q: "How do I apply?",
    a: "Use the application form on the Jobs page or email careers through the company contact channels with a short portfolio and CV.",
  },
];

export function jobPostings() {
  return JOB_SEATS.map((seat) => ({
    "@type": "JobPosting",
    title: seat.title,
    description: seat.description,
    identifier: {
      "@type": "PropertyValue",
      name: "Logic Intelligence Technologies",
      value: seat.slug,
    },
    datePosted: "2026-01-15",
    employmentType: "FULL_TIME",
    hiringOrganization: { "@id": ORG_ID },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    url: `${SITE}/jobs`,
  }));
}


/** Alias used by checklist layout */
export const HOWTO_STEPS = HOW_TO_STEPS;

export const DEMO_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Is the free demo really free?",
    a: "Yes. We scope and, when it fits, share a working direction before any payment.",
  },
  {
    q: "How long until a reply?",
    a: "Typically 48–72 hours with next steps after you submit the form.",
  },
  {
    q: "What happens after the demo?",
    a: "If you approve the direction, we move to a fixed-scope package or custom SOW. Source and go-live handoff follow full payment.",
  },
];

export const AI_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What is the Logic AI assistant?",
    a: "A company knowledge workspace for product, packages, and process questions grounded in official company materials.",
  },
  {
    q: "Does it replace human support?",
    a: "No. It accelerates answers; complex delivery and sales still go through the team.",
  },
];

