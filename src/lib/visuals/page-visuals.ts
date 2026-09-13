/** Canonical visual map. Do not invent photos of people or unverified clients. */

export type PageVisual = {
  route: string;
  concept: string;
  asset: string;
  alt: string;
  og?: string;
};

export const PAGE_VISUALS: PageVisual[] = [
  { route: "/", concept: "Studio hero mesh + circular mark", asset: "/assets/backdrops/home-hero.jpg", alt: "Logic Intelligence Technologies homepage", og: "/api/og?title=Logic+Intelligence+Technologies" },
  { route: "/about", concept: "Company architecture diagram", asset: "/images/about/company-architecture.svg", alt: "LIT company architecture", og: "/api/og?title=About+LIT" },
  { route: "/services", concept: "Capability grid", asset: "/images/hero/hero-mesh.svg", alt: "LIT services", og: "/api/og?title=Enterprise+Technology+Services" },
  { route: "/ai", concept: "Intelligent interface", asset: "/images/ai/intelligent-interface.svg", alt: "LIT AI assistant interface", og: "/api/og?title=LIT+AI" },
  { route: "/work", concept: "Case study photography where licensed", asset: "/images/work/freshbite.jpg", alt: "Selected LIT work", og: "/api/og?title=Our+Work" },
  { route: "/packages", concept: "Package covers", asset: "/images/packages/digital-launch-pack.svg", alt: "LIT packages", og: "/api/og?title=Packages" },
  { route: "/jobs", concept: "Technology culture geometry", asset: "/images/careers/tech-culture.svg", alt: "Careers at LIT", og: "/api/og?title=Jobs" },
  { route: "/contact", concept: "Inquiry geometry", asset: "/images/hero/hero-mesh.svg", alt: "Contact Logic Intelligence Technologies", og: "/api/og?title=Contact" },
  { route: "/discovery", concept: "Consultation process", asset: "/images/hero/hero-mesh.svg", alt: "Discovery consultation", og: "/api/og?title=Discovery" },
  { route: "/free-demo", concept: "Product walkthrough", asset: "/images/hero/hero-mesh.svg", alt: "Free demo", og: "/api/og?title=Free+Demo" },
  { route: "/checklist", concept: "Document mock", asset: "/images/resources/website-development-checklist.svg", alt: "Website checklist", og: "/api/og?title=Checklist" },
  { route: "/blog", concept: "Editorial cards per article", asset: "/images/blog/website-pricing-breakdown.svg", alt: "LIT blog", og: "/api/og?title=Blog" },
  { route: "/resources", concept: "Resource covers", asset: "/images/resources/company-profile.svg", alt: "LIT resources", og: "/api/og?title=Resources" },
  { route: "/login", concept: "Glass authentication panel", asset: "/images/hero/hero-mesh.svg", alt: "Sign in to LIT", og: "/api/og?title=Sign+In" },
];

export function visualFor(route: string): PageVisual | undefined {
  return PAGE_VISUALS.find((v) => v.route === route);
}

export const SERVICE_VISUAL = (slug: string) => `/images/services/${slug}.svg`;
