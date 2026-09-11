import { COMPANY } from "@/config/company";
import { packagesData } from "@/data/packagesData";

export const SITE = COMPANY.websiteUrl.replace(/\/$/, "");
export const LOGO_48 = `${SITE}/icon-48.png`;
export const LOGO_192 = `${SITE}/icon-192.png`;
export const LOGO_512 = `${SITE}/icon.png`;
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;

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
    founder: {
      "@type": "Person",
      name: COMPANY.founder.name,
      jobTitle: COMPANY.founder.title,
    },
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
      target: `${SITE}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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
  {
    title: "Director of Sales & Growth",
    slug: "director-sales",
    description:
      "Own pipeline from Logic AI and Discovery through signed scopes. Coimbatore HQ.",
  },
  {
    title: "Director of AI & Product",
    slug: "director-ai",
    description:
      "Own Logic AI, RAG quality, and the product surface that converts visitors into scoped work.",
  },
] as const;

export function jobPostings() {
  return JOB_SEATS.map((seat) => ({
    "@type": "JobPosting",
    title: seat.title,
    description: seat.description,
    datePosted: "2026-09-12",
    validThrough: "2026-12-31",
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@id": ORG_ID,
      name: COMPANY.displayName,
      sameAs: SITE,
      logo: LOGO_192,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Coimbatore",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "India",
    },
    directApply: true,
    url: `${SITE}/jobs#${seat.slug}`,
  }));
}

export const PACKAGES_FAQ = [
  {
    q: "What does a website cost at Logic Intelligence Technologies?",
    a: "Digital Launch Pack starts at ₹8,999. Business Pro Pack starts at ₹18,999. Custom / Enterprise work starts from ₹50,000 after a scoped brief.",
  },
  {
    q: "Do I pay before I see a demo?",
    a: "No. Book a free demo first. You pay after you see the proposed build and agree the 31-point scope.",
  },
  {
    q: "Who owns the source code?",
    a: "You own the source on full payment. Hosting credentials and the repository are handed over at close.",
  },
  {
    q: "How long does Digital Launch take?",
    a: "Typically 5–7 working days after content and photos are provided.",
  },
];

export const AI_FAQ = [
  {
    q: "What is Logic AI?",
    a: "Logic AI is the studio assistant on logicintelligencetechnologies.in/ai. It answers from company packages and, when documents are attached, from that context. Grok is the primary model.",
  },
  {
    q: "Does Logic AI invent prices?",
    a: "Prices are constrained facts: Digital Launch from ₹8,999, Business Pro from ₹18,999, custom from ₹50,000. Ask in Company mode for package answers.",
  },
  {
    q: "Can I book a demo from the chat?",
    a: "Yes. After a pricing or build question, use Book free demo or WhatsApp handoff with the last turns attached.",
  },
];

export const JOBS_FAQ = [
  {
    q: "Are these partnership roles?",
    a: "No. Seats are employment offers or letters of intent. Titles are not for sale and there is no unpaid partnership programme.",
  },
  {
    q: "Where is the role based?",
    a: "Coimbatore headquarters. Hybrid may be discussed after the first 90 days if you have already shipped in the room.",
  },
  {
    q: "How do I apply?",
    a: "Use the confidential application form on /jobs. You receive a confirmation email. We reply within 24 hours.",
  },
];

export const DEMO_FAQ = [
  {
    q: "Is the demo actually free?",
    a: "Yes. No retainer is required to see a scoped prototype or walkthrough of how we would build your site or system.",
  },
  {
    q: "What happens after I submit the form?",
    a: "The submission is stored in our CRM and you receive a confirmation email. We follow up on WhatsApp or email within one business day.",
  },
  {
    q: "Which pack should I pick?",
    a: "First site or brochure: Digital Launch from ₹8,999. Lead-gen and richer modules: Business Pro from ₹18,999. Custom platforms: Enterprise from ₹50,000.",
  },
];

export const HOWTO_STEPS = [
  { name: "Write the business goal", text: "State the outcome: leads, bookings, or operations — not a page count." },
  { name: "List pages and modules", text: "Home, About, Services, Contact, plus any booking, shop, or portal." },
  { name: "Collect brand assets", text: "Logo, colours, type, and photos you already own." },
  { name: "Prepare copy", text: "Service names, prices you will publish, and a short about paragraph." },
  { name: "Confirm integrations", text: "WhatsApp, payments, maps, forms, and any third-party tools." },
  { name: "Agree the 31-point scope", text: "Lock inclusions so the brief does not drift mid-build." },
  { name: "Review the free demo", text: "See the proposed structure before you pay." },
  { name: "Go live and hand over source", text: "DNS, SSL, Search Console, and repository on full payment." },
];
