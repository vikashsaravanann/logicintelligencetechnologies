export interface ProductItem {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  features: string[];
  techStack: string[];
  status: "Live" | "Beta" | "Enterprise Ready" | "Active Development";
  metrics: { label: string; value: string }[];
  websiteUrl?: string;
  repositoryUrl?: string;
}

export const productsData: ProductItem[] = [
  {
    slug: "logic-voice",
    name: "Logic Voice",
    tagline: "Voice-First Personal AI Assistant & Intelligent Automation",
    category: "AI Voice Assistant",
    description: "A voice-first personal AI assistant developed by Logic Intelligence Technologies, designed to let users interact naturally through speech with intelligent reasoning, planning, and approved tool execution.",
    features: [
      "Voice-first natural speech recognition and understanding",
      "Contextual reasoning, multi-step planning, and goal execution",
      "Approved tool execution with confirmations for sensitive actions",
      "Research synthesis, intelligent automation, and voice output"
    ],
    techStack: ["Python", "FastAPI", "STT / Speech Recognition", "TTS / Speech Synthesis", "Supabase", "Render"],
    status: "Active Development",
    metrics: [
      { label: "Interface", value: "Voice-First" },
      { label: "Action Model", value: "Tool-Assisted" },
      { label: "Target State", value: "Personal AI OS" }
    ],
    websiteUrl: "https://logicvoice.logicintelligencetechnologies.in/",
    repositoryUrl: "https://github.com/vikashsaravanann/logic-voice"
  },
  {
    slug: "voice-shield",
    name: "VoiceShield",
    tagline: "Voice Security & Risk Intelligence",
    category: "Voice Security & Risk Intelligence",
    description: "Enterprise voice-security and voice-risk intelligence product developed by Logic Intelligence Technologies, designed to analyze voice interactions and produce structured intelligence around security, fraud, and compliance signals.",
    features: [
      "Real-time acoustic analysis and synthetic speech anomaly indicators",
      "Structured risk intelligence and evidence generation for enterprise workflows",
      "Deterministic detection path without an LLM in the critical loop",
      "Async forensic review lab for transcription and audit trails"
    ],
    techStack: ["Python", "FastAPI", "Acoustic Signal Processing", "DSP Feature Extraction", "WebRTC", "Supabase"],
    status: "Beta",
    metrics: [
      { label: "Detection Loop", value: "Streaming DSP" },
      { label: "Forensic Lab", value: "Async Queue" },
      { label: "Integration", value: "API-First" }
    ],
    websiteUrl: "https://voiceshield.logicintelligencetechnologies.in/",
    repositoryUrl: "https://github.com/vikashsaravanann/voice-shield"
  },
  {
    slug: "omni-publisher",
    name: "OmniPublisher AI",
    tagline: "Autonomous Multi-Platform Content Distribution & Social Orchestration",
    category: "AI Marketing & Automation",
    description: "An intelligent autonomous distribution engine that drafts, schedules, optimizes, and broadcasts enterprise content across social networks, newsletters, and developer blogs with centralized approval.",
    features: [
      "AI Copy Adaptation for LinkedIn, Twitter/X, and Medium",
      "Automated UTM & Lead Attribution Tracking",
      "Dynamic Trend Analysis & Hashtag Optimization",
      "Multi-Brand Management Workspace"
    ],
    techStack: ["Next.js", "Supabase", "FastAPI", "Tailwind CSS", "Redis"],
    status: "Enterprise Ready",
    metrics: [
      { label: "Publishing Workflow", value: "Autonomous" },
      { label: "Platform Adaptation", value: "Multi-Channel" },
      { label: "Editorial Control", value: "Centralized" }
    ]
  },
  {
    slug: "nexus-crm",
    name: "Nexus Enterprise CRM",
    tagline: "High-Throughput Lead Intelligence & Predictive Pipeline Management",
    category: "Sales & Enterprise Ops",
    description: "Customer relationship and pipeline management platform engineered natively into the platform with deterministic lead scoring, automated nurture sequences, and digital proposal acceptance.",
    features: [
      "Deterministic Intent Scoring (0–100)",
      "Automated Email & WhatsApp Sequence Automation",
      "Contract & Proposal Digital Acceptance",
      "Interactive Financial Forecasting Dashboards"
    ],
    techStack: ["PostgreSQL", "React 19", "Node.js", "Serverless Vercel", "Payments"],
    status: "Live",
    metrics: [
      { label: "Lead Scoring", value: "Deterministic" },
      { label: "Nurture Engine", value: "Automated" },
      { label: "Security", value: "PostgreSQL RLS" }
    ]
  }
];

export function getProductVisual(slug: string): string {
  return `/images/products/${slug}.svg`;
}

export function getProductBySlug(slug: string) {
  return productsData.find((p) => p.slug === slug);
}
