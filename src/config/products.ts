export interface ProductMetric {
  label: string;
  value: string;
}

export interface ProductItem {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  features: string[];
  techStack: string[];
  status: 'Live' | 'Beta' | 'Enterprise Ready' | 'Active Development';
  metrics?: ProductMetric[];
  repositoryUrl?: string;
  portalUrl?: string;
}

export const PRODUCTS_CONFIG: ProductItem[] = [
  {
    slug: 'omni-apply',
    name: 'Omni-Apply Workflow Engine',
    tagline: 'Deterministic Headless Browser Automation & Application Dispatch',
    category: 'Intelligent Automation & Workflow Systems',
    description:
      'Autonomous workflow engine engineered by Founder Vikash Saravanan for deterministic, schema-validated form submission, headless browser orchestration, and repetitive digital process automation.',
    features: [
      'Playwright and headless browser deterministic orchestration',
      'Pydantic and JSON-schema validated input models',
      'Multi-step form field mapping and state persistence',
      'Dynamic error recovery and screenshot telemetry',
      'Zero-hallucination workflow execution path',
    ],
    techStack: ['Python 3.11', 'Playwright', 'FastAPI', 'Pydantic', 'AsyncIO'],
    status: 'Active Development',
    repositoryUrl: 'https://github.com/vikashsaravanann/omni-apply',
    portalUrl: '/omni',
  },
  {
    slug: 'omni-publisher',
    name: 'OmniPublisher AI',
    tagline: 'Autonomous Multi-Platform Content Distribution & Social Orchestration',
    category: 'AI Marketing & Automation',
    description:
      'Multi-channel autonomous distribution engine that drafts, schedules, formats, and publishes enterprise updates across social platforms, messaging webhooks, and CMS databases.',
    features: [
      'Platform-specific copy adaptation (LinkedIn, X/Twitter, Meta, Discord, Telegram)',
      'Automated campaign UTM parameters and scheduling calendar',
      'Direct Model Context Protocol (MCP) server integration',
      'Multi-channel execution with centralized editorial approval',
    ],
    techStack: ['Next.js App Router', 'FastAPI', 'Supabase PostgreSQL', 'Redis / Celery', 'Tailwind CSS'],
    status: 'Enterprise Ready',
    portalUrl: '/omni',
  },
  {
    slug: 'nexus-crm',
    name: 'Nexus Enterprise CRM',
    tagline: 'Deterministic Lead Intelligence & Pipeline Automation Engine',
    category: 'Operations & Enterprise CRM',
    description:
      'Integrated customer relationship and pipeline intelligence engine built natively into the Logic Intelligence Technologies platform. Features deterministic lead scoring (0–100), automated nurture sequencing, and digital proposal acceptance.',
    features: [
      'Deterministic intent scoring (0–100) based on domain, budget, and behavioral signals',
      '5-step automated follow-up sequences with suppression engine',
      'Cryptographically signed proposal viewing and digital acceptance',
      'Real-time Supabase database synchronization and audit trails',
    ],
    techStack: ['Next.js 16', 'React 19', 'Supabase Database', 'PostgreSQL RLS', 'Tailwind CSS'],
    status: 'Live',
    portalUrl: '/admin/command-center',
  },
  {
    slug: 'voice-shield',
    name: 'VoiceShield AI',
    tagline: 'Real-Time Deepfake Detection & Acoustic Verification Framework',
    category: 'Cybersecurity & Acoustic Verification',
    description:
      'Acoustic verification architecture designed to analyze spectral anomalies, synthetic speech artifacts, and unauthorized voice cloning in telecom and audio streams.',
    features: [
      'Low-latency acoustic feature and spectral frequency analysis',
      'Synthetic vocoder artifact detection and biometric consistency checks',
      'Privacy-preserving local inference capability',
      'Configurable enterprise risk thresholds and alerting webhooks',
    ],
    techStack: ['Python', 'WebRTC', 'FastSpeech Analysis', 'FastAPI'],
    status: 'Beta',
  },
];

export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS_CONFIG.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return PRODUCTS_CONFIG.map((p) => p.slug);
}
