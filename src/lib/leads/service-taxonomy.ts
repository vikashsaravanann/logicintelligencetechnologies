/**
 * Logic Intelligence Technologies (LIT) Service Taxonomy & Multi-Service Classification Engine
 *
 * Provides canonical service categories, opportunity classification across single and multi-service
 * requests, and commercial packaging details ranging from ₹8,999 to Enterprise tiers.
 */

export const SERVICE_CATEGORIES = [
  "WEB_DEVELOPMENT",
  "WEB_DESIGN",
  "APP_DEVELOPMENT",
  "MOBILE_DEVELOPMENT",
  "GAME_DEVELOPMENT",
  "CUSTOM_SOFTWARE",
  "SAAS_DEVELOPMENT",
  "AI_AUTOMATION",
  "AI_AGENTS",
  "DATABASE_ENGINEERING",
  "API_INTEGRATION",
  "ENTERPRISE_PLATFORM",
  "HEALTHCARE_TECH",
  "CYBERSECURITY",
  "TECHNICAL_CONSULTING",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export type PricingModel =
  | "fixed"
  | "custom_quote"
  | "milestone_based"
  | "retainer";

export interface PackageMapping {
  packageId: string;
  name: string;
  startingPrice: string;
  startingPriceInINR: number;
  description: string;
  targetAudience: string;
}

export interface ServiceOfferDetails {
  category: ServiceCategory;
  displayName: string;
  tagline: string;
  pricingGuidance: {
    startingPrice: string;
    startingPriceInINR: number;
    pricingModel: PricingModel;
    rangeText: string;
    notes?: string;
  };
  packageMappings: PackageMapping[];
  deliveryTimeline: string;
  technicalScopeHints: string[];
  deliverables: string[];
  freeArchitectureDemoEligible: boolean;
}

export interface ClassifyOpportunityInput {
  text?: string;
  techStack?: string[];
  industry?: string;
  requestedServices?: string[];
}

/**
 * Keyword and regex rule definitions for classifying opportunities.
 */
interface CategoryMatcher {
  category: ServiceCategory;
  keywords: RegExp[];
  techStackKeywords: string[];
  industryKeywords: string[];
  directAliases: string[];
}

const CATEGORY_MATCHERS: CategoryMatcher[] = [
  {
    category: "WEB_DEVELOPMENT",
    keywords: [
      /\b(website|web\s*development|web\s*app|frontend|front-end|backend|back-end|full\s*stack|fullstack|nextjs|next\.js|react|vue|angular|html5|css3|landing\s*page|cms|wordpress|shopify|responsive\s*site)\b/i,
    ],
    techStackKeywords: [
      "next.js",
      "nextjs",
      "react",
      "vue",
      "angular",
      "svelte",
      "remix",
      "tailwind",
      "tailwindcss",
      "html5",
      "css3",
      "node.js",
      "express",
      "django",
      "laravel",
      "php",
    ],
    industryKeywords: ["e-commerce", "retail", "hospitality", "education", "corporate", "real estate"],
    directAliases: [
      "web_development",
      "web development",
      "website development",
      "web dev",
      "full stack development",
      "web platform",
    ],
  },
  {
    category: "WEB_DESIGN",
    keywords: [
      /\b(ui\/ux|ui\s*ux|web\s*design|website\s*design|figma|wireframe|mockup|prototype|user\s*interface|user\s*experience|redesign|graphic\s*design|design\s*system|branding|visual\s*identity)\b/i,
    ],
    techStackKeywords: ["figma", "sketch", "adobe xd", "framer", "storybook", "tailwind css", "photoshop", "illustrator"],
    industryKeywords: ["creative", "marketing", "branding", "agency"],
    directAliases: [
      "web_design",
      "web design",
      "ui/ux",
      "ui ux design",
      "website redesign",
      "ui/ux design",
      "graphic design",
    ],
  },
  {
    category: "APP_DEVELOPMENT",
    keywords: [
      /\b(app\s*development|application\s*development|desktop\s*app|cross[- ]platform\s*app|pwa|progressive\s*web\s*app|client\s*portal|internal\s*tool|electron\s*app|tauri)\b/i,
    ],
    techStackKeywords: ["electron", "tauri", "pwa", "ionic", "qt", "flutter", "react native"],
    industryKeywords: ["internal tools", "enterprise applications", "logistics", "field operations"],
    directAliases: [
      "app_development",
      "app development",
      "application development",
      "desktop app development",
      "pwa development",
    ],
  },
  {
    category: "MOBILE_DEVELOPMENT",
    keywords: [
      /\b(mobile\s*app|ios|android|react\s*native|flutter|swift|swiftui|kotlin|app\s*store|play\s*store|mobile\s*development|tablet\s*app|expo)\b/i,
    ],
    techStackKeywords: ["react native", "flutter", "swift", "swiftui", "kotlin", "java", "expo", "ionic", "xcode", "android studio"],
    industryKeywords: ["mobile consumer", "fintech", "delivery", "health & fitness", "ride hailing", "social"],
    directAliases: [
      "mobile_development",
      "mobile development",
      "mobile app",
      "ios development",
      "android development",
      "cross-platform mobile",
    ],
  },
  {
    category: "GAME_DEVELOPMENT",
    keywords: [
      /\b(game\s*dev|game\s*development|gaming|unity|unreal\s*engine|godot|2d\s*game|3d\s*game|gamification|multiplayer|shaders|webgl|three\.js|phaser|gameplay|vr|ar)\b/i,
    ],
    techStackKeywords: ["unity", "unity3d", "unreal", "unreal engine", "godot", "c#", "c++", "three.js", "threejs", "webgl", "phaser", "blender"],
    industryKeywords: ["gaming", "esports", "interactive entertainment", "edutainment", "gamified learning"],
    directAliases: [
      "game_development",
      "game development",
      "unity game",
      "unreal game",
      "gamification",
      "webgl games",
    ],
  },
  {
    category: "CUSTOM_SOFTWARE",
    keywords: [
      /\b(custom\s*software|bespoke\s*software|tailored\s*software|custom\s*erp|custom\s*crm|proprietary\s*system|internal\s*workflow|legacy\s*modernization|automation\s*software)\b/i,
    ],
    techStackKeywords: ["python", "c#", ".net", "java", "spring boot", "go", "golang", "rust", "typescript", "node.js"],
    industryKeywords: ["manufacturing", "logistics", "supply chain", "legal", "accounting", "operations"],
    directAliases: [
      "custom_software",
      "custom software",
      "bespoke software",
      "custom software development",
      "custom enterprise software",
    ],
  },
  {
    category: "SAAS_DEVELOPMENT",
    keywords: [
      /\b(saas|software\s*as\s*a\s*service|multi[- ]tenant|tenant\s*isolation|subscription\s*billing|stripe\s*billing|b2b\s*saas|saas\s*mvp|churn|tier\s*management|usage\s*metering)\b/i,
    ],
    techStackKeywords: ["stripe", "lemonsqueezy", "paddle", "clerk", "auth0", "supabase", "posthog", "next.js", "postgresql", "aws"],
    industryKeywords: ["b2b saas", "cloud services", "martech", "fintech", "proptech", "hrtech"],
    directAliases: [
      "saas_development",
      "saas development",
      "saas platform",
      "b2b saas",
      "software as a service",
    ],
  },
  {
    category: "AI_AUTOMATION",
    keywords: [
      /\b(ai\s*automation|workflow\s*automation|rpa|robotic\s*process\s*automation|zapier|make\.com|n8n|automated\s*pipeline|document\s*parsing|ocr|intelligent\s*automation|data\s*extraction)\b/i,
    ],
    techStackKeywords: ["n8n", "zapier", "make", "make.com", "langchain", "llamaindex", "openrouter", "airflow", "tesseract", "python"],
    industryKeywords: ["back-office", "finance operations", "legal tech", "insurance processing", "customer operations"],
    directAliases: [
      "ai_automation",
      "ai automation",
      "workflow automation",
      "robotic process automation",
      "rpa automation",
    ],
  },
  {
    category: "AI_AGENTS",
    keywords: [
      /\b(ai\s*agent|ai\s*agents|autonomous\s*agent|conversational\s*ai|rag|retrieval\s*augmented|llm|gpt|claude|gemini|vector\s*database|embeddings|multi[- ]agent|voice\s*shield|ai\s*voice|tool\s*calling|function\s*calling|copilot)\b/i,
    ],
    techStackKeywords: ["openai", "anthropic", "gemini", "langchain", "langgraph", "crewai", "autogen", "pinecone", "qdrant", "weaviate", "pgvector", "chromadb"],
    industryKeywords: ["customer support", "knowledge management", "virtual assistants", "intelligence systems"],
    directAliases: [
      "ai_agents",
      "ai agents",
      "ai agent development",
      "rag systems",
      "autonomous agents",
      "llm applications",
    ],
  },
  {
    category: "DATABASE_ENGINEERING",
    keywords: [
      /\b(database\s*engineering|database\s*design|database\s*optimization|query\s*tuning|indexing|sharding|replication|row\s*level\s*security|rls|postgres|postgresql|mongodb|clickhouse|bigquery|data\s*modeling|schema\s*migration)\b/i,
    ],
    techStackKeywords: ["postgresql", "postgres", "mysql", "mongodb", "redis", "supabase", "clickhouse", "snowflake", "bigquery", "prisma", "drizzle", "dynamodb"],
    industryKeywords: ["high volume data", "analytics", "fintech", "adtech", "data platforms"],
    directAliases: [
      "database_engineering",
      "database engineering",
      "database architecture",
      "database migration",
      "database design",
    ],
  },
  {
    category: "API_INTEGRATION",
    keywords: [
      /\b(api\s*integration|rest\s*api|graphql|webhook|webhooks|third[- ]party\s*api|payment\s*gateway|razorpay|stripe\s*integration|microservices|openapi|swagger|grpc|api\s*gateway)\b/i,
    ],
    techStackKeywords: ["rest", "graphql", "grpc", "postman", "trpc", "webhooks", "razorpay", "stripe api", "openapi", "fastapi"],
    industryKeywords: ["fintech", "e-commerce", "travel tech", "logistics aggregators"],
    directAliases: [
      "api_integration",
      "api integration",
      "rest api integration",
      "payment gateway integration",
      "api development",
    ],
  },
  {
    category: "ENTERPRISE_PLATFORM",
    keywords: [
      /\b(enterprise\s*platform|high\s*availability|microservices|kubernetes|k8s|docker|cloud\s*architecture|sso|saml|okta|audit\s*logs|soc2|hipaa\s*enterprise|distributed\s*system|multi[- ]region|load\s*balancer)\b/i,
    ],
    techStackKeywords: ["kubernetes", "k8s", "docker", "aws", "gcp", "azure", "terraform", "okta", "kafka", "rabbitmq", "helm", "istio"],
    industryKeywords: ["enterprise", "banking", "insurance", "telecom", "defense", "government"],
    directAliases: [
      "enterprise_platform",
      "enterprise platform",
      "enterprise architecture",
      "cloud enterprise",
      "distributed systems",
    ],
  },
  {
    category: "HEALTHCARE_TECH",
    keywords: [
      /\b(healthcare|hospital|clinic|ehr|emr|telemedicine|telehealth|hl7|fhir|hipaa|medical\s*records|patient\s*portal|clinical\s*workflow|lit\s*healthcare|medical\s*device|doctor\s*consultation)\b/i,
    ],
    techStackKeywords: ["fhir", "hl7", "dicom", "hipaa", "webrtc", "postgresql", "lit healthcare"],
    industryKeywords: ["healthcare", "hospital", "pharmaceuticals", "medical", "clinical", "biotech", "health"],
    directAliases: [
      "healthcare_tech",
      "healthcare tech",
      "healthtech",
      "telemedicine platform",
      "hospital management software",
      "ehr/emr",
    ],
  },
  {
    category: "CYBERSECURITY",
    keywords: [
      /\b(cybersecurity|security\s*audit|penetration\s*(testing|test)|pen\s*test|vulnerability(\s*(assessment|audit))?|owasp|encryption|zero[-\s]*trust|firewall|threat\s*detection|ddos|code\s*audit|soc2(\s*compliance)?|iso27001)\b/i,
    ],
    techStackKeywords: ["owasp", "burp suite", "ssl/tls", "sonarqube", "snyk", "vault", "cloudflare", "metasploit", "wireshark"],
    industryKeywords: ["cybersecurity", "infosec", "fintech", "banking", "compliance", "government"],
    directAliases: [
      "cybersecurity",
      "cyber security",
      "security audit",
      "penetration testing",
      "vulnerability assessment",
    ],
  },
  {
    category: "TECHNICAL_CONSULTING",
    keywords: [
      /\b(technical\s*consulting|architecture\s*review|code\s*review|tech\s*advisory|fractional\s*cto|cto\s*advisory|system\s*audit|technology\s*roadmap|vendor\s*selection|feasibility\s*study|due\s*diligence)\b/i,
    ],
    techStackKeywords: ["system architecture", "rfc", "tech spec", "benchmarking", "profiling", "cloud cost optimization"],
    industryKeywords: ["venture capital", "private equity", "startups", "digital transformation", "management consulting"],
    directAliases: [
      "technical_consulting",
      "technical consulting",
      "tech advisory",
      "fractional cto",
      "architecture audit",
    ],
  },
];

/**
 * Check if a string is a valid ServiceCategory.
 */
export function isServiceCategory(val: string): val is ServiceCategory {
  return (SERVICE_CATEGORIES as readonly string[]).includes(val);
}

/**
 * Classifies an incoming opportunity into one or more LIT service categories.
 * Supports multi-service discovery, weighting explicit requests, tech stack matches,
 * industry triggers, and natural language text.
 */
export function classifyOpportunity(
  input: ClassifyOpportunityInput
): ServiceCategory[] {
  const scores: Map<ServiceCategory, number> = new Map();

  const addScore = (cat: ServiceCategory, weight: number) => {
    scores.set(cat, (scores.get(cat) || 0) + weight);
  };

  // 1. Process explicit requested services (highest authority)
  if (input.requestedServices && Array.isArray(input.requestedServices)) {
    for (const requested of input.requestedServices) {
      const cleanReq = requested.trim().toLowerCase();
      for (const matcher of CATEGORY_MATCHERS) {
        if (
          matcher.directAliases.some(
            (alias) => cleanReq === alias.toLowerCase() || cleanReq.includes(alias.toLowerCase())
          )
        ) {
          addScore(matcher.category, 50);
        }
      }
    }
  }

  // 2. Process industry matchers
  if (input.industry && input.industry.trim().length > 0) {
    const cleanIndustry = input.industry.trim().toLowerCase();
    for (const matcher of CATEGORY_MATCHERS) {
      if (
        matcher.industryKeywords.some((ind) =>
          cleanIndustry.includes(ind.toLowerCase())
        )
      ) {
        addScore(matcher.category, 25);
      }
    }
  }

  // 3. Process tech stack indicators
  if (input.techStack && Array.isArray(input.techStack)) {
    for (const tech of input.techStack) {
      const cleanTech = tech.trim().toLowerCase();
      for (const matcher of CATEGORY_MATCHERS) {
        if (
          matcher.techStackKeywords.some(
            (k) => cleanTech === k.toLowerCase() || cleanTech.includes(k.toLowerCase())
          )
        ) {
          addScore(matcher.category, 20);
        }
      }
    }
  }

  // 4. Process unstructured text / problem description
  if (input.text && input.text.trim().length > 0) {
    const text = input.text;
    for (const matcher of CATEGORY_MATCHERS) {
      for (const kw of matcher.keywords) {
        const matches = text.match(kw);
        if (matches) {
          addScore(matcher.category, 15);
        }
      }
      // Check tech stack matches inside free text
      for (const techKw of matcher.techStackKeywords) {
        const escaped = techKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const boundaryPattern = /^\w+$/.test(techKw) ? `\\b${escaped}\\b` : `(?:^|\\s|[^\\w])${escaped}(?:$|\\s|[^\\w])`;
        const regex = new RegExp(boundaryPattern, "i");
        if (regex.test(text)) {
          addScore(matcher.category, 10);
        }
      }
    }
  }

  // Filter categories with score >= 10 and sort descending by weight
  const matchedCategories = Array.from(scores.entries())
    .filter(([_, score]) => score >= 10)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  // If no category was detected but text is present, provide a sensible fallback if possible
  if (matchedCategories.length === 0 && input.text && input.text.trim().length > 20) {
    const lower = input.text.toLowerCase();
    if (lower.includes("mobile") || lower.includes("phone")) {
      matchedCategories.push("MOBILE_DEVELOPMENT");
    } else if (lower.includes("ai") || lower.includes("gpt") || lower.includes("bot")) {
      matchedCategories.push("AI_AGENTS");
    } else if (lower.includes("data") || lower.includes("sql")) {
      matchedCategories.push("DATABASE_ENGINEERING");
    } else {
      matchedCategories.push("WEB_DEVELOPMENT");
    }
  }

  return matchedCategories;
}

/**
 * Service offer catalog containing full commercial pricing, packages from ₹8,999 to Enterprise,
 * delivery timelines, and technical scope hints.
 */
const SERVICE_OFFER_CATALOG: Record<ServiceCategory, ServiceOfferDetails> = {
  WEB_DEVELOPMENT: {
    category: "WEB_DEVELOPMENT",
    displayName: "Full-Stack Web Development",
    tagline: "High-performance, Next.js web applications, portals, and conversion-optimized websites.",
    pricingGuidance: {
      startingPrice: "₹8,999",
      startingPriceInINR: 8999,
      pricingModel: "fixed",
      rangeText: "₹8,999 (Digital Launch Pack) to ₹50,000+ (Custom Enterprise)",
      notes: "Transparent fixed pricing for standardized packs; custom quotes for bespoke workflows.",
    },
    packageMappings: [
      {
        packageId: "digital-launch-pack",
        name: "Digital Launch Pack",
        startingPrice: "₹8,999",
        startingPriceInINR: 8999,
        description: "Up to 5 pages, mobile-responsive Next.js build, SEO setup, WhatsApp CTA, contact form, and 1 month warranty.",
        targetAudience: "Small businesses, local services, founders launching their first web presence.",
      },
      {
        packageId: "business-pro-pack",
        name: "Business Pro Pack",
        startingPrice: "₹18,999",
        startingPriceInINR: 18999,
        description: "Up to 10 pages, Razorpay payment gateway integration, admin content portal, blog engine, and interactive quotation module.",
        targetAudience: "Growing SMBs, hospitality businesses, travel agencies, and boutique professional firms.",
      },
      {
        packageId: "enterprise-pack",
        name: "Enterprise Web Platform",
        startingPrice: "₹50,000+",
        startingPriceInINR: 50000,
        description: "Unlimited scale, custom microservices, multi-region deployment on Vercel/AWS, Supabase database, and 6 months SLA.",
        targetAudience: "Scale-ups, established mid-market enterprises, and high-traffic commerce brands.",
      },
    ],
    deliveryTimeline: "5–7 working days for Launch Pack; 2–4 weeks for Custom Platforms",
    technicalScopeHints: [
      "Next.js App Router (React 19 / Server Components)",
      "Tailwind CSS with glassmorphism UI & responsive tokens",
      "Supabase PostgreSQL backend with Row Level Security (RLS)",
      "Vercel Edge Network deployment with 99+ Core Web Vitals target",
      "Automated lead capture, email dispatch, and WhatsApp routing",
    ],
    deliverables: [
      "Production Next.js application codebase with full ownership",
      "Responsive layout for mobile, tablet, and desktop viewports",
      "Google Search Console & schema.org structured data injection",
      "SSL certificate, CDN, and custom domain configuration",
      "30-day post-launch warranty and bug fix guarantee",
    ],
    freeArchitectureDemoEligible: true,
  },

  WEB_DESIGN: {
    category: "WEB_DESIGN",
    displayName: "UI/UX & Web Design",
    tagline: "Conversion-driven UI/UX design, interactive Figma prototypes, and cohesive brand design systems.",
    pricingGuidance: {
      startingPrice: "₹8,999",
      startingPriceInINR: 8999,
      pricingModel: "fixed",
      rangeText: "₹8,999 to ₹40,000+",
      notes: "Includes full Figma master file, component design system, and handoff tokens.",
    },
    packageMappings: [
      {
        packageId: "design-starter-pack",
        name: "UI/UX Starter Pack",
        startingPrice: "₹8,999",
        startingPriceInINR: 8999,
        description: "5 core screen designs, high-fidelity wireframing, color palette & typography system, and mobile viewports.",
        targetAudience: "Early-stage founders validating UI before engineering.",
      },
      {
        packageId: "design-pro-system",
        name: "High-Conversion UI/UX System",
        startingPrice: "₹18,999",
        startingPriceInINR: 18999,
        description: "Comprehensive 12-page clickable Figma prototype, custom icons, micro-animations, and full design tokens.",
        targetAudience: "Established companies doing a brand refresh or full platform redesign.",
      },
      {
        packageId: "enterprise-design-system",
        name: "Enterprise Design System",
        startingPrice: "₹40,000+",
        startingPriceInINR: 40000,
        description: "Complete enterprise component library, multi-brand theming, developer handoff specs in Storybook format, and user testing.",
        targetAudience: "Enterprise engineering teams needing strict design-to-code parity.",
      },
    ],
    deliveryTimeline: "3–5 working days for Starter; 10–14 days for Complete Systems",
    technicalScopeHints: [
      "Figma auto-layout component library with dark/light variants",
      "Design token export (Tailwind CSS compatible JSON tokens)",
      "Interactive clickable prototypes for user acceptance testing",
      "WCAG 2.1 AA accessibility compliance audit",
    ],
    deliverables: [
      "Figma master file with full component hierarchy",
      "Mobile, tablet, and desktop screen specifications",
      "Icon set and high-resolution asset exports (SVG, WebP)",
      "Developer handoff documentation with spacing & animation tokens",
    ],
    freeArchitectureDemoEligible: true,
  },

  APP_DEVELOPMENT: {
    category: "APP_DEVELOPMENT",
    displayName: "Application Development (Web & Desktop)",
    tagline: "Cross-platform Progressive Web Apps (PWA), Electron apps, and internal workflow tools.",
    pricingGuidance: {
      startingPrice: "₹24,999",
      startingPriceInINR: 24999,
      pricingModel: "milestone_based",
      rangeText: "₹24,999 to ₹75,000+",
    },
    packageMappings: [
      {
        packageId: "pwa-application-pack",
        name: "Progressive Web App (PWA)",
        startingPrice: "₹24,999",
        startingPriceInINR: 24999,
        description: "Installable web app with offline cache, service workers, push notifications, and fast touch UX.",
        targetAudience: "Businesses needing an installable mobile experience without App Store overhead.",
      },
      {
        packageId: "business-internal-portal",
        name: "Business Operations Portal",
        startingPrice: "₹45,000",
        startingPriceInINR: 45000,
        description: "Role-based dashboards, staff management, audit trails, and data entry forms with CSV/Excel export.",
        targetAudience: "SMEs seeking to replace manual spreadsheets with custom workflow software.",
      },
      {
        packageId: "desktop-app-enterprise",
        name: "Bespoke Cross-Platform Desktop App",
        startingPrice: "₹75,000+",
        startingPriceInINR: 75000,
        description: "Electron/Tauri desktop executable for Windows and macOS with native hardware access and offline database.",
        targetAudience: "Enterprises requiring offline desktop power and local file-system integration.",
      },
    ],
    deliveryTimeline: "2–4 weeks for PWA; 4–6 weeks for Full Application Suite",
    technicalScopeHints: [
      "React / Next.js with Service Worker offline caching",
      "Tauri / Electron cross-platform desktop compilation",
      "Role-Based Access Control (RBAC) with Supabase Auth",
      "Local-first state synchronization via IndexedDB or SQLite",
    ],
    deliverables: [
      "Installable web app or signed desktop binary installers (macOS/Windows)",
      "Administrative permission matrix and user management dashboard",
      "Automated automated testing suite and deployment pipelines",
      "Comprehensive admin user manual and technical guide",
    ],
    freeArchitectureDemoEligible: true,
  },

  MOBILE_DEVELOPMENT: {
    category: "MOBILE_DEVELOPMENT",
    displayName: "Native & Cross-Platform Mobile Apps",
    tagline: "High-performance iOS and Android applications built with React Native and Flutter.",
    pricingGuidance: {
      startingPrice: "₹34,999",
      startingPriceInINR: 34999,
      pricingModel: "milestone_based",
      rangeText: "₹34,999 (Mobile MVP) to ₹1,20,000+ (Enterprise Mobile Suite)",
    },
    packageMappings: [
      {
        packageId: "mobile-mvp-pack",
        name: "Mobile MVP Launch",
        startingPrice: "₹34,999",
        startingPriceInINR: 34999,
        description: "Single cross-platform React Native / Flutter codebase, core user auth, push notifications, and 5 key flows.",
        targetAudience: "Startups validating an app concept on Google Play and Apple App Store.",
      },
      {
        packageId: "production-mobile-suite",
        name: "Production Mobile Suite",
        startingPrice: "₹65,000",
        startingPriceInINR: 65000,
        description: "Full in-app payments, geolocation, background sync, biometric login, offline store, and deep linking.",
        targetAudience: "Established companies launching customer-facing mobile services.",
      },
      {
        packageId: "enterprise-mobile-ecosystem",
        name: "Enterprise Mobile Ecosystem",
        startingPrice: "₹1,20,000+",
        startingPriceInINR: 120000,
        description: "Multi-tenant architecture, hardware peripheral integration (Bluetooth/NFC), and enterprise MDM compliance.",
        targetAudience: "Healthcare, logistics, and retail corporations with heavy field operations.",
      },
    ],
    deliveryTimeline: "3–4 weeks for MVP; 6–8 weeks for Full Production Suite",
    technicalScopeHints: [
      "React Native / Expo SDK 52+ or Flutter 3.x",
      "Native device integration (Camera, GPS, Biometrics, Push Tokens)",
      "Apple App Store and Google Play Console compliance setup",
      "Secure key storage using iOS Keychain and Android Keystore",
    ],
    deliverables: [
      "Production build artifacts (.ipa and .aab / .apk files)",
      "App Store and Google Play submission assistance and approval support",
      "Cloud backend integration with REST/GraphQL endpoints",
      "Crashlytics and real-time performance monitoring dashboard",
    ],
    freeArchitectureDemoEligible: true,
  },

  GAME_DEVELOPMENT: {
    category: "GAME_DEVELOPMENT",
    displayName: "Game Development & Interactive 3D",
    tagline: "Unity, Godot, and WebGL 2D/3D games, gamified corporate apps, and multiplayer mechanics.",
    pricingGuidance: {
      startingPrice: "₹49,999",
      startingPriceInINR: 49999,
      pricingModel: "milestone_based",
      rangeText: "₹49,999 to ₹1,80,000+",
    },
    packageMappings: [
      {
        packageId: "webgl-casual-game",
        name: "Interactive WebGL / 2D Game",
        startingPrice: "₹49,999",
        startingPriceInINR: 49999,
        description: "Browser-playable lightweight game with leaderboards, reward logic, and social sharing.",
        targetAudience: "Brands running gamified marketing campaigns, education, or casual game publishers.",
      },
      {
        packageId: "unity-crossplatform-pack",
        name: "Unity Cross-Platform Game",
        startingPrice: "₹95,000",
        startingPriceInINR: 95000,
        description: "Full mobile & PC game build, touch controls, sound design, in-game shop, and ad-network integrations.",
        targetAudience: "Indie game studios and interactive entertainment creators.",
      },
      {
        packageId: "multiplayer-3d-title",
        name: "Full 3D / Multiplayer Title",
        startingPrice: "₹1,80,000+",
        startingPriceInINR: 180000,
        description: "Authoritative game servers, matchmaking, 3D asset rigging, custom shaders, and anti-cheat.",
        targetAudience: "Commercial game studios and interactive metaverse/simulations.",
      },
    ],
    deliveryTimeline: "4–6 weeks for 2D/WebGL; 8–12 weeks for 3D/Multiplayer",
    technicalScopeHints: [
      "Unity (C#) / Godot / Three.js WebGL rendering engine",
      "State-synchronized client-server websocket networking",
      "Asset optimization for 60 FPS mobile and browser performance",
      "Leaderboard and analytics telemetry pipelines",
    ],
    deliverables: [
      "Compiled game builds for target platforms (Web, Android, iOS, Windows)",
      "Full source code repository with rigged assets and sound effects",
      "Admin portal for managing leaderboards, seasons, and user items",
      "Deployment documentation for cloud matchmaking servers",
    ],
    freeArchitectureDemoEligible: true,
  },

  CUSTOM_SOFTWARE: {
    category: "CUSTOM_SOFTWARE",
    displayName: "Custom Software Engineering",
    tagline: "Bespoke internal systems, ERPs, operational workflows, and legacy software modernization.",
    pricingGuidance: {
      startingPrice: "₹35,000",
      startingPriceInINR: 35000,
      pricingModel: "milestone_based",
      rangeText: "₹35,000 to ₹1,25,000+",
    },
    packageMappings: [
      {
        packageId: "workflow-automation-tool",
        name: "Operations Workflow Engine",
        startingPrice: "₹35,000",
        startingPriceInINR: 35000,
        description: "Custom internal tool replacing manual paperwork and disconnected spreadsheets.",
        targetAudience: "Traditional businesses digitizing their operations and order fulfillment.",
      },
      {
        packageId: "bespoke-erp-suite",
        name: "Tailored ERP & Inventory Suite",
        startingPrice: "₹65,000",
        startingPriceInINR: 65000,
        description: "Multi-warehouse tracking, invoice dispatch, role-based approval gates, and accounting sync.",
        targetAudience: "Manufacturing, wholesale, and distributor firms.",
      },
      {
        packageId: "legacy-modernization-system",
        name: "Enterprise Core Modernization",
        startingPrice: "₹1,25,000+",
        startingPriceInINR: 125000,
        description: "Migration of legacy desktop or monolithic applications to cloud-native microservices.",
        targetAudience: "Enterprises with mission-critical legacy software needing zero-downtime upgrades.",
      },
    ],
    deliveryTimeline: "3–6 weeks depending on operational complexity",
    technicalScopeHints: [
      "Modular micro-service or clean monolithic architecture",
      "PostgreSQL / MySQL with immutable audit log tables",
      "Secure REST and GraphQL internal endpoints",
      "Automated CI/CD build pipelines and Dockerized deployments",
    ],
    deliverables: [
      "Full custom codebase with documented entity relationship diagrams",
      "Automated database migrations and seed scripts",
      "Executive reporting dashboard and custom export engines",
      "Comprehensive staff training session and handover documentation",
    ],
    freeArchitectureDemoEligible: true,
  },

  SAAS_DEVELOPMENT: {
    category: "SAAS_DEVELOPMENT",
    displayName: "SaaS Product Development",
    tagline: "Multi-tenant cloud architectures, subscription billing, onboarding funnels, and scalable B2B platforms.",
    pricingGuidance: {
      startingPrice: "₹49,999",
      startingPriceInINR: 49999,
      pricingModel: "milestone_based",
      rangeText: "₹49,999 (SaaS MVP) to ₹1,75,000+ (Scale Architecture)",
    },
    packageMappings: [
      {
        packageId: "saas-mvp-launch",
        name: "SaaS MVP Launch Pack",
        startingPrice: "₹49,999",
        startingPriceInINR: 49999,
        description: "Complete B2B SaaS MVP with multi-tenant auth, Stripe/Razorpay billing, and onboarding tour.",
        targetAudience: "SaaS founders seeking rapid go-to-market with paying customers.",
      },
      {
        packageId: "scale-ready-saas",
        name: "Scale-Ready Commercial SaaS",
        startingPrice: "₹95,000",
        startingPriceInINR: 95000,
        description: "Team workspaces, tiered member roles, automated recurring billing, webhooks, and analytics.",
        targetAudience: "Funded software startups scaling from 10 to 1,000+ business tenants.",
      },
      {
        packageId: "enterprise-saas-platform",
        name: "Global Enterprise SaaS Architecture",
        startingPrice: "₹1,75,000+",
        startingPriceInINR: 175000,
        description: "SAML/SSO, dedicated tenant isolation, SOC2-ready audit trails, and multi-region failover.",
        targetAudience: "B2B SaaS companies selling into enterprise procurement teams.",
      },
    ],
    deliveryTimeline: "4–6 weeks for MVP; 8–10 weeks for Commercial Scale",
    technicalScopeHints: [
      "Tenant schema isolation and Row Level Security policies",
      "Stripe / Razorpay Subscriptions with automated webhook handling",
      "Next.js App Router + Redis session caching + Supabase Postgres",
      "Usage-based metering and automated invoice receipt dispatch",
    ],
    deliverables: [
      "Complete SaaS codebase with multi-tenant authentication",
      "Automated subscription checkout and billing management portal",
      "Super-admin governance metrics (MRR, churn, active tenants)",
      "Developer API documentation with rate limiting and API keys",
    ],
    freeArchitectureDemoEligible: true,
  },

  AI_AUTOMATION: {
    category: "AI_AUTOMATION",
    displayName: "AI Workflow Automation & RPA",
    tagline: "Autonomous backend pipelines, automated document parsing, n8n workflows, and hands-free operations.",
    pricingGuidance: {
      startingPrice: "₹18,999",
      startingPriceInINR: 18999,
      pricingModel: "fixed",
      rangeText: "₹18,999 (Single Workflow) to ₹75,000+ (Enterprise RPA)",
    },
    packageMappings: [
      {
        packageId: "automation-starter",
        name: "Automated Workflow Pack",
        startingPrice: "₹18,999",
        startingPriceInINR: 18999,
        description: "Up to 3 multi-step automated workflows (e.g. Lead triage, CRM sync, WhatsApp alerts via n8n).",
        targetAudience: "Small businesses seeking to eliminate repetitive manual copy-pasting.",
      },
      {
        packageId: "intelligent-document-pipeline",
        name: "Intelligent Document Automation",
        startingPrice: "₹38,999",
        startingPriceInINR: 38999,
        description: "AI-driven OCR and data extraction for invoices, contracts, and receipts into ERP/Accounting.",
        targetAudience: "Accounting, logistics, and legal teams processing hundreds of documents weekly.",
      },
      {
        packageId: "enterprise-ai-rpa",
        name: "Enterprise Autonomous Workflow Fabric",
        startingPrice: "₹75,000+",
        startingPriceInINR: 75000,
        description: "Self-healing enterprise RPA cluster with exception alerting, human-in-the-loop approvals, and SLA tracking.",
        targetAudience: "Corporations processing high-volume business transactions.",
      },
    ],
    deliveryTimeline: "5–10 working days for Starter; 2–4 weeks for Document Pipelines",
    technicalScopeHints: [
      "Self-hosted n8n or Temporal durable execution engine",
      "LLM vision & structured JSON extraction (OpenAI / Claude / Gemini)",
      "Webhook receivers with automatic retry mechanisms and error dead-letter queues",
      "End-to-end audit logs tracking every processed payload",
    ],
    deliverables: [
      "Exported workflow definitions and orchestration scripts",
      "Dedicated worker infrastructure configuration (Docker/Fly.io/AWS)",
      "Real-time failure alerting via Slack/WhatsApp/Email",
      "Operator training guide and runbook for error remediation",
    ],
    freeArchitectureDemoEligible: true,
  },

  AI_AGENTS: {
    category: "AI_AGENTS",
    displayName: "AI Agents & Private RAG Systems",
    tagline: "Autonomous agentic reasoning, domain-specific RAG knowledge bases, and secure Voice Shield AI.",
    pricingGuidance: {
      startingPrice: "₹24,999",
      startingPriceInINR: 24999,
      pricingModel: "fixed",
      rangeText: "₹24,999 to ₹95,000+ (Enterprise Private AI Architecture)",
    },
    packageMappings: [
      {
        packageId: "ai-rag-knowledge-bot",
        name: "Domain RAG Assistant",
        startingPrice: "₹24,999",
        startingPriceInINR: 24999,
        description: "Private vector database search over company PDFs, policies, and manuals with hallucination guards.",
        targetAudience: "Customer support teams, internal knowledge bases, and corporate intranets.",
      },
      {
        packageId: "multi-agent-system",
        name: "Autonomous Multi-Agent System",
        startingPrice: "₹48,999",
        startingPriceInINR: 48999,
        description: "Multi-agent coordination (Planner, Researcher, Executor) with real-world tool and API calling.",
        targetAudience: "Tech companies wanting autonomous research, code analysis, or lead triage agents.",
      },
      {
        packageId: "enterprise-voice-shield",
        name: "Enterprise Private AI Architecture",
        startingPrice: "₹95,000+",
        startingPriceInINR: 95000,
        description: "Proprietary LIT Voice Shield integration, on-premise / private VPC model hosting, and zero data leakage.",
        targetAudience: "Healthcare, legal, and financial institutions handling sensitive customer data.",
      },
    ],
    deliveryTimeline: "1–2 weeks for RAG Assistant; 3–5 weeks for Multi-Agent Systems",
    technicalScopeHints: [
      "Vector embeddings (pgvector / Pinecone / Qdrant) with hybrid keyword search",
      "Model routing across OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, and Gemini 1.5",
      "Structured output enforcement via Pydantic / Zod schemas",
      "LIT Voice Shield audio synthesis and real-time streaming",
    ],
    deliverables: [
      "Production-ready AI Agent API endpoints and interactive web widget",
      "Vector embedding ingestion pipeline for PDFs, docs, and databases",
      "Automated evaluation benchmark report proving 95%+ accuracy",
      "System prompt guardrails preventing prompt injection and hallucinations",
    ],
    freeArchitectureDemoEligible: true,
  },

  DATABASE_ENGINEERING: {
    category: "DATABASE_ENGINEERING",
    displayName: "Database Engineering & Optimization",
    tagline: "Schema modeling, Row Level Security (RLS), high-throughput query optimization, and zero-loss migrations.",
    pricingGuidance: {
      startingPrice: "₹18,999",
      startingPriceInINR: 18999,
      pricingModel: "fixed",
      rangeText: "₹18,999 to ₹85,000+",
    },
    packageMappings: [
      {
        packageId: "supabase-rls-setup",
        name: "Database Security & Schema Pack",
        startingPrice: "₹18,999",
        startingPriceInINR: 18999,
        description: "Normalized PostgreSQL relational schema, indexes, and bulletproof Row Level Security (RLS) policies.",
        targetAudience: "SaaS startups launching on Supabase needing secure multi-tenant policies.",
      },
      {
        packageId: "query-optimization-pack",
        name: "Database Tuning & Performance Pack",
        startingPrice: "₹38,999",
        startingPriceInINR: 38999,
        description: "Slow query audit, EXPLAIN ANALYZE profiling, composite index creation, and connection pooling.",
        targetAudience: "Websites and apps experiencing lag, slow page loads, or connection spikes.",
      },
      {
        packageId: "enterprise-migration-sharding",
        name: "Enterprise Migration & Data Engine",
        startingPrice: "₹85,000+",
        startingPriceInINR: 85000,
        description: "Zero-downtime database migration, logical replication, ClickHouse analytics integration, and automated backups.",
        targetAudience: "High-scale platforms managing millions of rows or migrating from legacy engines.",
      },
    ],
    deliveryTimeline: "5–7 working days for Schema/RLS; 2–4 weeks for Enterprise Migrations",
    technicalScopeHints: [
      "PostgreSQL 15+ / Supabase with comprehensive RLS policies",
      "Prisma or Drizzle ORM migration scripts with automated rollbacks",
      "PgBouncer / Supavisor connection pooling configuration",
      "Database read replicas and point-in-time disaster recovery",
    ],
    deliverables: [
      "Version-controlled SQL schema migration repository",
      "Database security audit report with penetration verification",
      "Query execution benchmarking report showing latency reductions",
      "Automated backup and disaster recovery runbook",
    ],
    freeArchitectureDemoEligible: true,
  },

  API_INTEGRATION: {
    category: "API_INTEGRATION",
    displayName: "API Engineering & Integration",
    tagline: "Payment gateways, third-party API synchronization, webhook handlers, and microservice integration.",
    pricingGuidance: {
      startingPrice: "₹12,999",
      startingPriceInINR: 12999,
      pricingModel: "fixed",
      rangeText: "₹12,999 to ₹60,000+",
    },
    packageMappings: [
      {
        packageId: "payment-api-pack",
        name: "Payment Gateway Integration",
        startingPrice: "₹12,999",
        startingPriceInINR: 12999,
        description: "Razorpay / Stripe integration with UPI, NetBanking, Cards, webhook reconciliation, and automated receipts.",
        targetAudience: "Businesses needing reliable payment collection without checkout drop-offs.",
      },
      {
        packageId: "multi-system-sync",
        name: "Multi-Platform API Sync",
        startingPrice: "₹28,999",
        startingPriceInINR: 28999,
        description: "Bi-directional synchronization between CRM, ERP, WhatsApp Cloud API, and marketing tools.",
        targetAudience: "Companies with fragmented SaaS tools needing unified real-time data sync.",
      },
      {
        packageId: "enterprise-api-fabric",
        name: "Enterprise API Gateway & Microservices",
        startingPrice: "₹60,000+",
        startingPriceInINR: 60000,
        description: "Custom OpenAPI/Swagger specification, rate limiting, JWT validation, and high-throughput gRPC federation.",
        targetAudience: "Large engineering teams managing multi-vendor microservice ecosystems.",
      },
    ],
    deliveryTimeline: "3–7 working days for Payments; 2–3 weeks for Multi-Platform Sync",
    technicalScopeHints: [
      "Idempotent webhook receivers with cryptographic signature validation",
      "OpenAPI 3.1 specifications with auto-generated TypeScript SDKs",
      "Resilient retry policies with exponential backoff and jitter",
      "Distributed tracing with correlation IDs for all outbound HTTP requests",
    ],
    deliverables: [
      "Production-ready API integration modules and webhook listener endpoints",
      "Postman collection / OpenAPI specification for developer handoff",
      "Test harness validating edge cases, timeouts, and network failures",
      "Monitoring dashboard showing real-time API uptime and error rates",
    ],
    freeArchitectureDemoEligible: true,
  },

  ENTERPRISE_PLATFORM: {
    category: "ENTERPRISE_PLATFORM",
    displayName: "Enterprise Cloud Platforms & Architecture",
    tagline: "Scalable Kubernetes clusters, multi-region cloud setups, high availability, and compliance-ready systems.",
    pricingGuidance: {
      startingPrice: "₹50,000",
      startingPriceInINR: 50000,
      pricingModel: "milestone_based",
      rangeText: "₹50,000 to ₹2,000,000+",
      notes: "Custom scope tailored to architectural audits, SLA requirements, and cloud infrastructure.",
    },
    packageMappings: [
      {
        packageId: "cloud-foundation-pack",
        name: "Resilient Cloud Infrastructure",
        startingPrice: "₹50,000",
        startingPriceInINR: 50000,
        description: "Dockerized deployments, CI/CD pipeline automation, automated TLS, and multi-zone failover on AWS/GCP.",
        targetAudience: "Scale-ups moving away from fragile single-server setups.",
      },
      {
        packageId: "high-availability-cluster",
        name: "Distributed High-Availability Cluster",
        startingPrice: "₹1,00,000",
        startingPriceInINR: 100000,
        description: "Kubernetes orchestration, Redis caching tier, Kafka/RabbitMQ message queues, and auto-scaling pods.",
        targetAudience: "High-volume transactional platforms handling millions of monthly requests.",
      },
      {
        packageId: "mission-critical-enterprise",
        name: "Mission-Critical Enterprise Fabric",
        startingPrice: "₹2,00,000+",
        startingPriceInINR: 200000,
        description: "Multi-region active-active deployment, SOC2/ISO27001 readiness, and dedicated 24/7 reliability engineering.",
        targetAudience: "Financial institutions, telecom operators, and multinational software conglomerates.",
      },
    ],
    deliveryTimeline: "4–8 weeks depending on compliance and clustering requirements",
    technicalScopeHints: [
      "Terraform Infrastructure as Code (IaC) for AWS / GCP / Azure",
      "Kubernetes (EKS/GKE) with Helm charts and zero-downtime rolling deploys",
      "Prometheus & Grafana observability with automated PagerDuty alerting",
      "Strict network segmentation with VPC peering and Cloudflare WAF",
    ],
    deliverables: [
      "Terraform infrastructure scripts with full parameterization",
      "Automated GitHub Actions CI/CD pipelines deploying to production",
      "Disaster recovery simulation report with RTO < 15 min and RPO < 1 min",
      "Architecture diagram and operational runbooks for internal SRE teams",
    ],
    freeArchitectureDemoEligible: true,
  },

  HEALTHCARE_TECH: {
    category: "HEALTHCARE_TECH",
    displayName: "Healthcare & MedTech Platforms",
    tagline: "LIT Healthcare flagship solutions, HL7/FHIR EHR interoperability, HIPAA compliance, and telemedicine.",
    pricingGuidance: {
      startingPrice: "₹38,999",
      startingPriceInINR: 38999,
      pricingModel: "milestone_based",
      rangeText: "₹38,999 (Clinic Portal) to ₹1,75,000+ (Hospital Platform)",
    },
    packageMappings: [
      {
        packageId: "clinic-telehealth-portal",
        name: "Clinic & Telehealth Portal",
        startingPrice: "₹38,999",
        startingPriceInINR: 38999,
        description: "Patient appointment scheduling, WebRTC encrypted video consults, WhatsApp reminders, and digital prescriptions.",
        targetAudience: "Independent clinics, specialists, diagnostic centers, and wellness networks.",
      },
      {
        packageId: "ehr-interoperability-suite",
        name: "HL7 / FHIR Interoperability Suite",
        startingPrice: "₹85,000",
        startingPriceInINR: 85000,
        description: "Secure bridge connecting hospital lab equipment, billing engines, and external EHR systems with audit logs.",
        targetAudience: "Specialty hospitals and pathology lab chains.",
      },
      {
        packageId: "lit-healthcare-enterprise",
        name: "LIT Healthcare Enterprise Platform",
        startingPrice: "₹1,75,000+",
        startingPriceInINR: 175000,
        description: "Comprehensive hospital operations platform covering OPD, IPD, pharmacy inventory, and HIPAA/NABH compliance.",
        targetAudience: "Multi-specialty hospital networks and healthcare enterprise operators.",
      },
    ],
    deliveryTimeline: "3–4 weeks for Telehealth; 6–10 weeks for Enterprise Hospital Platforms",
    technicalScopeHints: [
      "HL7 v2 / FHIR JSON message parsers and validation",
      "Encrypted patient health records (AES-256 at rest, TLS 1.3 in transit)",
      "Strict HIPAA / ABDM (Ayushman Bharat Digital Mission) compliance",
      "WebRTC peer-to-peer encrypted video consultation with fallback TURN servers",
    ],
    deliverables: [
      "Fully compliant healthcare web/mobile application with role isolation",
      "ABDM / FHIR integration modules and test validation certificates",
      "Cryptographically signed audit log trail for patient record access",
      "Healthcare staff onboarding documentation and video walkthroughs",
    ],
    freeArchitectureDemoEligible: true,
  },

  CYBERSECURITY: {
    category: "CYBERSECURITY",
    displayName: "Cybersecurity & Vulnerability Assessment",
    tagline: "Web and mobile application penetration testing, code security audits, OWASP compliance, and threat mitigation.",
    pricingGuidance: {
      startingPrice: "₹18,999",
      startingPriceInINR: 18999,
      pricingModel: "fixed",
      rangeText: "₹18,999 (Code Audit) to ₹90,000+ (Comprehensive Pen-Test)",
    },
    packageMappings: [
      {
        packageId: "security-audit-starter",
        name: "Static Code & Vulnerability Audit",
        startingPrice: "₹18,999",
        startingPriceInINR: 18999,
        description: "Automated & manual review of source code, dependencies, secrets scanning, and misconfiguration report.",
        targetAudience: "Startups releasing new software or preparing for investor due diligence.",
      },
      {
        packageId: "web-api-pentest",
        name: "Web & API Penetration Testing",
        startingPrice: "₹45,000",
        startingPriceInINR: 45000,
        description: "Black-box and grey-box penetration testing covering OWASP Top 10, auth bypass, SQLi, and business logic flaws.",
        targetAudience: "E-commerce, fintech, and SaaS platforms holding sensitive customer credentials.",
      },
      {
        packageId: "enterprise-zero-trust",
        name: "Enterprise Zero-Trust & SOC2 Hardening",
        startingPrice: "₹90,000+",
        startingPriceInINR: 90000,
        description: "Full infrastructure hardening, cloud IAM policies, encryption key rotation, and audit-readiness documentation.",
        targetAudience: "Enterprises needing third-party security certification before signing enterprise contracts.",
      },
    ],
    deliveryTimeline: "3–5 working days for Starter Audit; 2–3 weeks for Comprehensive Penetration Testing",
    technicalScopeHints: [
      "OWASP Top 10 web vulnerabilities and API Security Top 10 testing",
      "Static Application Security Testing (SAST) and secrets scanning",
      "Cloud IAM posture assessment (AWS IAM, Supabase RLS policies)",
      "Remediation patch validation and re-testing verification",
    ],
    deliverables: [
      "Executive summary report for non-technical leadership and board members",
      "Detailed technical report with reproduction steps, CVSS scores, and code patches",
      "Certificate of Security Assessment upon successful remediation",
      "30-minute debriefing call with our lead security engineer",
    ],
    freeArchitectureDemoEligible: false,
  },

  TECHNICAL_CONSULTING: {
    category: "TECHNICAL_CONSULTING",
    displayName: "Technical Advisory & Fractional CTO",
    tagline: "Architectural blueprinting, technology stack selection, code due diligence, and strategic engineering guidance.",
    pricingGuidance: {
      startingPrice: "₹12,999",
      startingPriceInINR: 12999,
      pricingModel: "retainer",
      rangeText: "₹12,999 (Feasibility Review) to ₹35,000/mo (Fractional CTO)",
    },
    packageMappings: [
      {
        packageId: "architecture-feasibility-review",
        name: "Architecture & Stack Review",
        startingPrice: "₹12,999",
        startingPriceInINR: 12999,
        description: "Comprehensive 1-week evaluation of your proposed or existing architecture, tech stack, and cost projections.",
        targetAudience: "Founders planning a new product or companies considering a complete stack rewrite.",
      },
      {
        packageId: "fractional-cto-advisory",
        name: "Fractional CTO Advisory (Monthly)",
        startingPrice: "₹35,000/mo",
        startingPriceInINR: 35000,
        description: "Weekly architectural steering, code review gates, vendor interviews, and engineering roadmap alignment.",
        targetAudience: "Non-technical founders and growth-stage companies needing executive engineering guidance.",
      },
      {
        packageId: "tech-due-diligence",
        name: "M&A Technical Due Diligence",
        startingPrice: "₹75,000+",
        startingPriceInINR: 75000,
        description: "Deep dive audit into target company codebase, technical debt, licensing risks, and scaling bottlenecks.",
        targetAudience: "Angel investors, VCs, and acquirers evaluating software assets.",
      },
    ],
    deliveryTimeline: "3–5 working days for Reviews; Ongoing for Retainer Partnerships",
    technicalScopeHints: [
      "Microservice vs monolithic trade-off analysis",
      "Cloud hosting cost reduction audit (AWS / GCP / Vercel bill optimization)",
      "Technical debt quantification and remediation sequencing",
      "Hiring rubrics and candidate technical screening for internal engineering teams",
    ],
    deliverables: [
      "Written Architectural Blueprint and System Specification RFC",
      "Cloud cost optimization roadmap identifying potential 30–50% savings",
      "Risk assessment matrix covering scalability, security, and lock-in",
      "Weekly strategic consultation and pull-request architectural reviews",
    ],
    freeArchitectureDemoEligible: true,
  },
};

/**
 * Returns complete commercial and technical offer details for a given LIT service category.
 */
export function getServiceOfferDetails(
  category: ServiceCategory
): ServiceOfferDetails {
  const details = SERVICE_OFFER_CATALOG[category];
  if (!details) {
    throw new Error(`Unknown LIT ServiceCategory: ${category}`);
  }
  return details;
}

/**
 * Returns all 15 LIT service category offer details as an array.
 */
export function getAllServiceOfferDetails(): ServiceOfferDetails[] {
  return SERVICE_CATEGORIES.map((cat) => SERVICE_OFFER_CATALOG[cat]);
}
