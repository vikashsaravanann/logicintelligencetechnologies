export interface IndustryData {
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  summary: string;
  challenges: string[];
  solutions: string[];
  features: string[];
  compliance: string[];
}

export const industriesData: IndustryData[] = [
  {
    slug: "healthcare",
    title: "Healthcare & MedTech Systems",
    subtitle: "HIPAA & DISHA-Compliant Medical Platforms & Patient Records",
    iconName: "Activity",
    summary: "Engineering secure, real-time clinical workflows, electronic health records (EHR), telemedicine platforms, and AI-assisted medical diagnostic interfaces.",
    challenges: [
      "Strict data privacy regulations and patient confidential records",
      "Fragmented legacy software across hospital departments",
      "Latency during live telemedicine consultations"
    ],
    solutions: [
      "End-to-end encrypted telemetry and FHIR/HL7 interoperability",
      "Automated clinical scheduling and patient onboarding portals",
      "AI-driven triage assistance and triage document summarization"
    ],
    features: [
      "Doctor & Patient Portals",
      "E-Prescription & Pharmacy API Integration",
      "Remote Health Monitoring Dashboards",
      "Secure Multi-Tenant Clinic Management"
    ],
    compliance: ["HIPAA Compliant", "DISHA Ready", "ISO 27001 Standard"]
  },
  {
    slug: "education",
    title: "Education & EdTech Platforms",
    subtitle: "High-Capacity Learning Management Systems & Virtual Classrooms",
    iconName: "GraduationCap",
    summary: "Architecting interactive educational platforms, proctored examination portals, AI grading systems, and student lifecycle management software.",
    challenges: [
      "Handling massive concurrent traffic spikes during live classes and exams",
      "Lack of engagement in asynchronous e-learning modules",
      "Manual administrative overhead in grading and attendance"
    ],
    solutions: [
      "WebRTC-powered live lecture streaming with low-latency chat",
      "Interactive quiz builders with automated AI evaluation",
      "Centralized student fee collection with automated receipt generation"
    ],
    features: [
      "LMS Course Builder & Video Vault",
      "Automated Attendance via Computer Vision / QR",
      "Parent-Teacher Engagement Mobile App",
      "Certificate Generation & Blockchain Verification"
    ],
    compliance: ["FERPA Compliant", "COPPA Compliant"]
  },
  {
    slug: "retail",
    title: "Retail & E-Commerce Infrastructure",
    subtitle: "Omnichannel POS, High-Velocity Online Stores & Inventory Sync",
    iconName: "ShoppingBag",
    summary: "Transforming retail businesses with multi-store inventory synchronization, high-converting digital storefronts, and automated logistics integration.",
    challenges: [
      "Stock mismatches between physical retail outlets and digital storefronts",
      "Cart abandonment caused by checkout friction or slow load speeds",
      "Complex multi-tier promotional pricing and discounting logic"
    ],
    solutions: [
      "Real-time event-driven inventory synchronization across warehouses",
      "Headless e-commerce architecture guaranteeing sub-second page loads",
      "Unified payment processing with UPI, cards, and Buy-Now-Pay-Later"
    ],
    features: [
      "Custom Headless E-Commerce Frontends",
      "Cloud POS Integration",
      "Automated WhatsApp Order Updates",
      "Dynamic Product Recommendation Engine"
    ],
    compliance: ["PCI-DSS Level 1", "SSL 256-bit Encryption"]
  },
  {
    slug: "manufacturing",
    title: "Manufacturing & Supply Chain ERP",
    subtitle: "Production Scheduling, IoT Tracking & Warehouse Automation",
    iconName: "Factory",
    summary: "Empowering industrial enterprises with real-time shop floor visibility, supply chain telemetry, predictive equipment maintenance, and ERP automation.",
    challenges: [
      "Unplanned machinery downtime stalling critical production lines",
      "Paper-based dispatch logs creating shipping delays and disputes",
      "Lack of real-time material tracking across multi-stage assembly"
    ],
    solutions: [
      "IoT telemetry ingestion pipelines streaming equipment metrics",
      "Custom ERP software with barcode/RFID dispatch verification",
      "Predictive analytics forecasting raw material procurement needs"
    ],
    features: [
      "Shop Floor Work-Order Management",
      "Inventory & Batch Tracking",
      "Vendor Portal & Purchase Order Automation",
      "Machinery Health Monitoring"
    ],
    compliance: ["Industry 4.0 Standard", "SOC 2 Type II"]
  },
  {
    slug: "finance",
    title: "Financial Technology & Banking",
    subtitle: "Automated Invoicing, Payment Gateways & Compliance Ledgers",
    iconName: "Landmark",
    summary: "Building robust FinTech applications, micro-lending platforms, automated reconciliations, and cryptographic transaction ledgers.",
    challenges: [
      "Strict financial auditability and tamper-proof ledgering",
      "High fraud risk during user verification and fund disbursement",
      "Complex regulatory reporting cycles"
    ],
    solutions: [
      "Double-entry bookkeeping database architecture with immutable audit logs",
      "Automated KYC/AML verification with document scanning OCR",
      "Instant bank payout integration via NPCI / IMPS / Stripe Connect"
    ],
    features: [
      "Automated Invoicing & Collections Engine",
      "KYC Document Verification Pipeline",
      "Real-Time Fraud Detection Heuristics",
      "Multi-Currency Wallet Architecture"
    ],
    compliance: ["RBI Guidelines", "PCI-DSS", "GDPR / DPDP Act"]
  },
  {
    slug: "startups",
    title: "High-Growth Startups & Scaleups",
    subtitle: "Rapid MVP Prototyping, Scalable Backend Foundations & Cloud Cost Control",
    iconName: "Rocket",
    summary: "Helping founders launch validated MVPs in weeks, not months, while establishing cloud architecture that gracefully scales to hundreds of thousands of users.",
    challenges: [
      "Limited runway requiring rapid execution to achieve product-market fit",
      "Technical debt from outsourced prototypes that cannot scale",
      "High cloud infrastructure bills without architecture optimization"
    ],
    solutions: [
      "4-week MVP development sprint with modern Next.js/Supabase foundations",
      "Serverless architecture keeping baseline hosting costs near zero",
      "Built-in telemetry, conversion tracking, and analytics from Day 1"
    ],
    features: [
      "Production-Ready SaaS Starter Kits",
      "Subscription Billing & Tier Access Control",
      "AI Co-Pilots & Workflow Automation",
      "Investor-Ready Tech Architecture Diagrams"
    ],
    compliance: ["Scalable Microservices", "Modern CI/CD"]
  }
];
