import { COMPANY } from "@/config/company";
import { servicesData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";
import { productsData } from "@/data/productsData";
import { PDF_RESOURCES } from "@/config/pdfs";
import { packagesData } from "@/data/packagesData";
import { portfolioProjects } from "@/data/portfolioData";
import { blogPosts } from "@/data/blogData";

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

const ACRONYMS: Record<string, string> = {
  ai: "AI",
  api: "API",
  roi: "ROI",
  pdf: "PDF",
  sop: "SOP",
  rfc: "RFC",
  gst: "GST",
  lit: "LIT",
  ivr: "IVR",
  rag: "RAG",
  llm: "LLM",
  cms: "CMS",
  pwa: "PWA",
  qa: "QA",
  sla: "SLA",
  tn: "TN",
};

function formatSegmentTitle(segment: string): string {
  if (!segment) return "";
  const decoded = decodeURIComponent(segment);
  const parts = decoded.split(/[-_]/).filter(Boolean);
  return parts
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS[lower]) return ACRONYMS[lower];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Canonical static registry of known high-priority routes
const STATIC_REGISTRY: Record<string, BreadcrumbSegment[]> = {
  "/": [{ name: "Home", path: "/" }],
  "/about": [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
  ],
  "/about/founder": [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Founder & Leadership", path: "/about/founder" },
  ],
  "/company/facts": [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Company Facts & Verification", path: "/company/facts" },
  ],
  "/services": [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ],
  "/industries": [
    { name: "Home", path: "/" },
    { name: "Industries", path: "/industries" },
  ],
  "/products": [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ],
  "/products/logic-voice": [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Logic Voice", path: "/products/logic-voice" },
  ],
  "/products/ai-voice-agents": [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "AI Voice Agents", path: "/products/ai-voice-agents" },
  ],
  "/products/ai-website-agents": [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "AI Website Agents", path: "/products/ai-website-agents" },
  ],
  "/products/facts": [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Product Facts & Technical Specs", path: "/products/facts" },
  ],
  "/healthcare": [
    { name: "Home", path: "/" },
    { name: "LIT Healthcare", path: "/healthcare" },
  ],
  "/healthcare/plans": [
    { name: "Home", path: "/" },
    { name: "LIT Healthcare", path: "/healthcare" },
    { name: "Healthcare Plans & Licensing", path: "/healthcare/plans" },
  ],
  "/voice-shield": [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Voice Shield", path: "/voice-shield" },
  ],
  "/pricing": [
    { name: "Home", path: "/" },
    { name: "Pricing & Investment", path: "/pricing" },
  ],
  "/resources": [
    { name: "Home", path: "/" },
    { name: "Resources & Whitepapers", path: "/resources" },
  ],
  "/packages": [
    { name: "Home", path: "/" },
    { name: "Packages & Retainers", path: "/packages" },
  ],
  "/work": [
    { name: "Home", path: "/" },
    { name: "Case Studies & Work", path: "/work" },
  ],
  "/blog": [
    { name: "Home", path: "/" },
    { name: "Engineering Blog", path: "/blog" },
  ],
  "/careers": [
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ],
  "/jobs": [
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
    { name: "Open Positions", path: "/jobs" },
  ],
  "/press": [
    { name: "Home", path: "/" },
    { name: "Press & Media", path: "/press" },
  ],
  "/book-consultation": [
    { name: "Home", path: "/" },
    { name: "Book Consultation", path: "/book-consultation" },
  ],
  "/free-demo": [
    { name: "Home", path: "/" },
    { name: "Request Free Demo", path: "/free-demo" },
  ],
  "/checklist": [
    { name: "Home", path: "/" },
    { name: "50-Point Enterprise Deployment Checklist", path: "/checklist" },
  ],
  "/discovery": [
    { name: "Home", path: "/" },
    { name: "Project Discovery", path: "/discovery" },
  ],
  "/contact": [
    { name: "Home", path: "/" },
    { name: "Contact LIT", path: "/contact" },
  ],
  "/ai": [
    { name: "Home", path: "/" },
    { name: "Autonomous AI Intelligence", path: "/ai" },
  ],
  "/investors": [
    { name: "Home", path: "/" },
    { name: "Investors & Partners", path: "/investors" },
  ],
  "/investor-brief": [
    { name: "Home", path: "/" },
    { name: "Investors", path: "/investors" },
    { name: "Executive Brief", path: "/investor-brief" },
  ],
  "/architecture": [
    { name: "Home", path: "/" },
    { name: "Architecture & Systems Design", path: "/architecture" },
  ],
  "/roi-calculator": [
    { name: "Home", path: "/" },
    { name: "ROI Calculator", path: "/roi-calculator" },
  ],
  "/docs/api": [
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs/api" },
    { name: "API Reference", path: "/docs/api" },
  ],
  "/support": [
    { name: "Home", path: "/" },
    { name: "Support Center", path: "/support" },
  ],
  "/support/new": [
    { name: "Home", path: "/" },
    { name: "Support Center", path: "/support" },
    { name: "Open Support Ticket", path: "/support/new" },
  ],
  "/help-center": [
    { name: "Home", path: "/" },
    { name: "Help Center", path: "/help-center" },
  ],
  "/knowledge-base": [
    { name: "Home", path: "/" },
    { name: "Knowledge Base", path: "/knowledge-base" },
  ],
  "/status": [
    { name: "Home", path: "/" },
    { name: "System Status & Infrastructure", path: "/status" },
  ],
  "/ai-ethics": [
    { name: "Home", path: "/" },
    { name: "AI Ethics & Governance", path: "/ai-ethics" },
  ],
  "/ai-assistant": [
    { name: "Home", path: "/" },
    { name: "Enterprise AI Assistant", path: "/ai-assistant" },
  ],
  "/ai-discovery": [
    { name: "Home", path: "/" },
    { name: "AI Discovery & Roadmapping", path: "/ai-discovery" },
  ],
  "/expertise": [
    { name: "Home", path: "/" },
    { name: "Technical Expertise & Capabilities", path: "/expertise" },
  ],
  "/community": [
    { name: "Home", path: "/" },
    { name: "Engineering Community", path: "/community" },
  ],
  "/sales": [
    { name: "Home", path: "/" },
    { name: "Enterprise Sales", path: "/sales" },
  ],
  "/privacy": [
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
  ],
  "/privacy-policy": [
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ],
  "/security": [
    { name: "Home", path: "/" },
    { name: "Security Architecture & Controls", path: "/security" },
  ],
  "/terms": [
    { name: "Home", path: "/" },
    { name: "Terms of Service", path: "/terms" },
  ],
  "/terms-of-service": [
    { name: "Home", path: "/" },
    { name: "Terms of Service", path: "/terms-of-service" },
  ],
  "/refund-policy": [
    { name: "Home", path: "/" },
    { name: "Refund & Cancellation Policy", path: "/refund-policy" },
  ],
  "/accessibility": [
    { name: "Home", path: "/" },
    { name: "Accessibility Statement", path: "/accessibility" },
  ],
  "/cookie-policy": [
    { name: "Home", path: "/" },
    { name: "Cookie Policy", path: "/cookie-policy" },
  ],
  "/login": [
    { name: "Home", path: "/" },
    { name: "Client Portal Login", path: "/login" },
  ],
  "/reset-password": [
    { name: "Home", path: "/" },
    { name: "Account Recovery", path: "/reset-password" },
  ],
  "/client/dashboard": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Executive Dashboard", path: "/client/dashboard" },
  ],
  "/client/notifications": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Notifications", path: "/client/notifications" },
  ],
  "/client/invoices": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Tax Invoices & Billing", path: "/client/invoices" },
  ],
  "/client/change-requests": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Change Requests (RFC)", path: "/client/change-requests" },
  ],
  "/client/documents": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Legal Documents & Contracts", path: "/client/documents" },
  ],
  "/client/meetings": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Consultation Bookings", path: "/client/meetings" },
  ],
  "/client/messages": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Project Messages", path: "/client/messages" },
  ],
  "/client/profile": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Organization Profile", path: "/client/profile" },
  ],
  "/client/projects": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Active Projects", path: "/client/projects" },
  ],
  "/client/actions": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Action Items & Approvals", path: "/client/actions" },
  ],
  "/client/support": [
    { name: "Home", path: "/" },
    { name: "Client Workspace", path: "/client/dashboard" },
    { name: "Support Tickets", path: "/client/support" },
  ],
};

// Populate known catalog routes dynamically
for (const svc of servicesData) {
  STATIC_REGISTRY[`/services/${svc.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: svc.title, path: `/services/${svc.slug}` },
  ];
}

for (const ind of industriesData) {
  STATIC_REGISTRY[`/industries/${ind.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Industries", path: "/industries" },
    { name: ind.title, path: `/industries/${ind.slug}` },
  ];
}

for (const prod of productsData) {
  STATIC_REGISTRY[`/products/${prod.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: prod.name, path: `/products/${prod.slug}` },
  ];
}

for (const res of PDF_RESOURCES) {
  STATIC_REGISTRY[`/resources/${res.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: res.title, path: `/resources/${res.slug}` },
  ];
}

for (const pkg of packagesData) {
  STATIC_REGISTRY[`/packages/${pkg.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    { name: pkg.title, path: `/packages/${pkg.slug}` },
  ];
}

for (const proj of portfolioProjects) {
  STATIC_REGISTRY[`/work/${proj.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Case Studies", path: "/work" },
    { name: proj.title, path: `/work/${proj.slug}` },
  ];
}

for (const post of blogPosts) {
  STATIC_REGISTRY[`/blog/${post.slug}`] = [
    { name: "Home", path: "/" },
    { name: "Engineering Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];
}

/**
 * Returns hierarchical breadcrumb items for ANY given URL pathname.
 * If the route is registered, returns the official curated hierarchy.
 * Otherwise, dynamically derives a clean, human-readable breadcrumb trail.
 */
export function getBreadcrumbsForPath(rawPathname: string): BreadcrumbSegment[] {
  if (!rawPathname) return [{ name: "Home", path: "/" }];

  // Clean pathname (remove hash, query string, trailing slash)
  const pathname = rawPathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  if (STATIC_REGISTRY[pathname]) {
    return STATIC_REGISTRY[pathname];
  }

  // Fallback: Dynamically generate hierarchical trail from URL segments
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ name: "Home", path: "/" }];
  }

  const trail: BreadcrumbSegment[] = [{ name: "Home", path: "/" }];
  let accumulatedPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    accumulatedPath += `/${segment}`;

    // Check if intermediate path is known in static registry
    if (STATIC_REGISTRY[accumulatedPath]) {
      const match = STATIC_REGISTRY[accumulatedPath];
      const last = match[match.length - 1];
      trail.push(last);
    } else {
      const title = formatSegmentTitle(segment);
      trail.push({
        name: title || segment,
        path: accumulatedPath,
      });
    }
  }

  // Deduplicate consecutive identical paths if any
  const deduped: BreadcrumbSegment[] = [];
  const seenPaths = new Set<string>();
  for (const item of trail) {
    if (!seenPaths.has(item.path)) {
      seenPaths.add(item.path);
      deduped.push(item);
    }
  }

  return deduped;
}

/**
 * Generates the Google Search Console-compliant Schema.org BreadcrumbList JSON-LD object.
 */
export function generateBreadcrumbJsonLd(pathname: string, siteUrl: string = COMPANY.websiteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  const items = getBreadcrumbsForPath(pathname);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? `${base}/` : (item.path.startsWith("http") ? item.path : `${base}${item.path}`),
    })),
  };
}
