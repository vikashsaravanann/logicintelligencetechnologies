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
  websiteUrl?: string;
  repositoryUrl?: string;
  portalUrl?: string;
}

export const PRODUCTS_CONFIG: ProductItem[] = [
  {
    slug: 'logic-voice',
    name: 'Logic Voice',
    tagline: 'Voice-First Personal AI Assistant & Intelligent Automation',
    category: 'AI Voice Assistant',
    description:
      'Logic Voice is a voice-first personal AI assistant developed by Logic Intelligence Technologies, designed to let users interact naturally through speech. The architecture spans speech recognition, natural-language understanding, reasoning, planning, approved tool execution, research, and intelligent automation with explicit confirmations for sensitive actions.',
    features: [
      'Voice-first natural interaction and real-time speech recognition',
      'Contextual reasoning, multi-step planning, and intelligent automation',
      'Approved tool execution with controlled authorization for sensitive actions',
      'Speech understanding, research synthesis, and contextual voice responses',
      'Engineered toward a long-term personal AI operating system interface',
    ],
    techStack: ['Python', 'FastAPI', 'Speech Recognition (STT)', 'Voice Synthesis (TTS)', 'Supabase', 'Render'],
    status: 'Active Development',
    metrics: [
      { label: 'Interface', value: 'Voice-First' },
      { label: 'Action Model', value: 'Tool-Assisted' },
      { label: 'Target State', value: 'Personal AI OS' },
    ],
    websiteUrl: 'https://logicvoice.logicintelligencetechnologies.in/',
    repositoryUrl: 'https://github.com/vikashsaravanann/logic-voice',
    portalUrl: '/products/logic-voice',
  },
  {
    slug: 'voice-shield',
    name: 'VoiceShield',
    tagline: 'Voice Security & Risk Intelligence',
    category: 'Voice Security & Risk Intelligence',
    description:
      'VoiceShield is an enterprise voice-security and voice-risk intelligence product developed by Logic Intelligence Technologies, designed to analyze voice interactions and produce structured intelligence around security, fraud, risk, and compliance-related signals.',
    features: [
      'Acoustic signal analysis and synthetic speech anomaly indicators',
      'Structured risk intelligence and evidence generation for enterprise workflows',
      'Deterministic real-time detection path without an LLM in the hot loop',
      'Async forensic analysis lab for transcription and in-depth review',
      'API-first architecture for BPOs, contact centers, and financial telecom',
    ],
    techStack: ['Python', 'FastAPI', 'Acoustic Signal Processing', 'DSP Feature Extraction', 'WebRTC', 'Supabase'],
    status: 'Beta',
    metrics: [
      { label: 'Detection Loop', value: 'Streaming DSP' },
      { label: 'Forensic Lab', value: 'Async Queue' },
      { label: 'Integration', value: 'API-First' },
    ],
    websiteUrl: 'https://voiceshield.logicintelligencetechnologies.in/',
    repositoryUrl: 'https://github.com/vikashsaravanann/voice-shield',
    portalUrl: '/voice-shield',
  },
  {
    slug: 'omni-apply',
    name: 'Omni-Apply Workflow Engine',
    tagline: 'Deterministic Headless Browser Automation & Application Dispatch',
    category: 'Intelligent Automation & Workflow Systems',
    description:
      'Autonomous workflow engine engineered for deterministic, schema-validated form submission, headless browser orchestration, and repetitive digital process automation.',
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
];

export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS_CONFIG.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return PRODUCTS_CONFIG.map((p) => p.slug);
}
