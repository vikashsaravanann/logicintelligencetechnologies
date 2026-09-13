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
    name: FOUNDER.fullName,
    alternateName: FOUNDER.shortName,
    jobTitle: FOUNDER.title,
    url: FOUNDER.links.portfolio,
    image: {
      "@type": "ImageObject",
      url: `${SITE}${FOUNDER.images.profile}`,
      contentUrl: `${SITE}${FOUNDER.images.profile}`,
      caption: FOUNDER.images.alt,
    },
    worksFor: { "@id": ORG_ID },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: FOUNDER.education.institution,
    },
    knowsAbout: [...FOUNDER.specializations],
    sameAs: [
      FOUNDER.links.portfolio,
      FOUNDER.links.linkedin,
      FOUNDER.links.github,
      FOUNDER.links.instagram,
    ],
    description: FOUNDER.shortBio,
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
