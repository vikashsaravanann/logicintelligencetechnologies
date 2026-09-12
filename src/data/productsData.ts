export interface ProductItem {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  features: string[];
  techStack: string[];
  status: "Live" | "Beta" | "Enterprise Ready";
  metrics: { label: string; value: string }[];
}

export const productsData: ProductItem[] = [
  {
    slug: "omni-publisher",
    name: "OmniPublisher AI",
    tagline: "Autonomous Multi-Platform Content Distribution & Social Orchestration",
    category: "AI Marketing & Automation",
    description: "An intelligent autonomous distribution engine that drafts, schedules, optimizes, and broadcasts enterprise content across social networks, newsletters, and developer blogs with zero manual overhead.",
    features: [
      "AI Copy Adaptation for LinkedIn, Twitter/X, and Medium",
      "Automated UTM & Lead Attribution Tracking",
      "Dynamic Trend Analysis & Hashtag Optimization",
      "Multi-Brand Management Workspace"
    ],
    techStack: ["Next.js", "Supabase", "OpenAI / Claude 3.5", "Tailwind CSS", "Redis"],
    status: "Enterprise Ready",
    metrics: [
      { label: "Publishing Velocity", value: "10x Faster" },
      { label: "Audience Engagement", value: "+184%" },
      { label: "Manual Hours Saved", value: "25 hrs/wk" }
    ]
  },
  {
    slug: "nexus-crm",
    name: "Nexus Enterprise CRM",
    tagline: "High-Throughput Lead Intelligence & Predictive Pipeline Management",
    category: "Sales & Enterprise Ops",
    description: "Next-generation customer relationship management platform built for modern B2B organizations. Real-time lead scoring, automated multi-channel sequences, and Kanban contract tracking.",
    features: [
      "Instant Deterministic Intent Scoring (0–100)",
      "Automated Email & WhatsApp Sequence Automation",
      "Contract & Proposal Digital Acceptance",
      "Interactive Financial Forecasting Dashboards"
    ],
    techStack: ["PostgreSQL", "React 19", "Node.js", "Serverless Vercel", "Stripe"],
    status: "Live",
    metrics: [
      { label: "Lead Response Time", value: "< 2 mins" },
      { label: "Close Rate Increase", value: "+38%" },
      { label: "Data Accuracy", value: "99.9%" }
    ]
  },
  {
    slug: "voice-shield",
    name: "VoiceShield AI",
    tagline: "Real-Time Deepfake Detection & Voice Verification Firewall",
    category: "Cybersecurity & Identity",
    description: "Enterprise acoustic verification middleware that authenticates caller identity in real time, neutralizing audio deepfakes and social engineering attempts against call centers and financial institutions.",
    features: [
      "Sub-200ms Acoustic Feature Extraction",
      "Spectral Anomaly & Synthetic Speech Detection",
      "Biometric Voice Enrollment & Hash Verification",
      "Zero-Knowledge Biometric Vault"
    ],
    techStack: ["Python FastSpeech", "WebAssembly", "TensorFlow Lite", "WebRTC"],
    status: "Beta",
    metrics: [
      { label: "Synthetic Audio Recall", value: "99.4%" },
      { label: "Detection Latency", value: "160ms" },
      { label: "False Alarm Rate", value: "< 0.01%" }
    ]
  }
];
