import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { packagesData } from "@/data/packagesData";
import { servicesData } from "@/data/servicesData";
import { portfolioProjects } from "@/data/portfolioData";
import { productsData } from "@/data/productsData";

/**
 * MASTER COMPREHENSIVE KNOWLEDGE BASE
 * Feeds all company platforms, products, technical specifications, and commercial packages
 * directly to the Chatbot LLM and Local Fallback Engine.
 */
export const MASTER_COMPANY_KNOWLEDGE = `
================================================================================
LOGIC INTELLIGENCE TECHNOLOGIES — MASTER ENTERPRISE KNOWLEDGE DOSSIER
================================================================================

1. COMPANY IDENTITY & MISSION:
- Legal / Trade Name: Logic Intelligence Technologies (LIT)
- Official Domain: ${COMPANY.websiteUrl}
- Headquarters: ${COMPANY.address}
- Leadership: ${FOUNDER.name} (${FOUNDER.title}) — ${FOUNDER.shortBio}
- Mission: Building deterministic AI platforms, high-throughput autonomous agents, real-time voice intelligence, and clinical-grade healthcare software that transforms modern business operations with zero latency and mathematical precision.
- Official Contact Channels:
  • Direct Telephony: ${COMPANY.phone}
  • Executive Email: ${COMPANY.email}
  • Free Demo Portal: ${COMPANY.websiteUrl}/free-demo
  • Consultation Booking: ${COMPANY.websiteUrl}/book-consultation
  • Support Portal: ${COMPANY.websiteUrl}/support

================================================================================
2. FLAGSHIP PRODUCT 1: LIT HEALTHCARE (SMART HOSPITAL OPERATING SYSTEM)
================================================================================
- Product Name: LIT Healthcare (LIT Hospital Management OS)
- Category: Enterprise Smart Hospital Management & Clinical Intelligence Platform
- Live URL: https://healthcare.logicintelligencetechnologies.in/ (or ${COMPANY.websiteUrl}/healthcare)
- Deployment Scale: Active across 14 hospital sites and clinical centers.
- Core Architectural Pillars:
  • Multi-Tenant Clinical Workspaces: Dedicated, isolated environments for multi-branch hospital chains, specialty clinics, and medical trusts.
  • Bed Telemetry & Ward Management: Real-time dynamic visual telemetry of ICU beds, general wards, triage queues, and oxygen-equipped units.
  • Outpatient (OPD) & Inpatient (IPD) Workflows: Digital queue management, doctor appointment slotting, automated token displays, and admission/discharge lifecycle.
  • Doctor & Clinical Records (EMR/EHR): Structured clinical notes, digital prescriptions, diagnosis classification, and biometric access controls.
  • Pharmacy & Drug Inventory: Automated dispensing workflows, inventory stock alerts, batch/expiry tracking, and prescription synchronization.
  • Billing & Insurance Claims: Transparent tariff engines, automated insurance pre-authorization documentation, itemized invoices, and GST-compliant receipts.
  • Laboratory & Diagnostic Telemetry: Automated test orders, pathologist digital sign-offs, and instant patient report delivery via WhatsApp/SMS.
  • Clinical Governance & Security: Zero-trust Role-Based Access Control (RBAC) powered by PostgreSQL Row-Level Security (RLS), full HIPAA & DPDP Act 2023 compliance audit trails, and cryptographic record integrity.

================================================================================
3. FLAGSHIP PRODUCT 2: LOGIC VOICE (CONVERSATIONAL VOICE INTELLIGENCE)
================================================================================
- Product Name: Logic Voice (Personal AI Voice OS & Autonomous Telephony)
- Category: Ultra-Low-Latency Conversational Voice Intelligence Engine
- Live URL: https://logicvoice.logicintelligencetechnologies.in/ (or ${COMPANY.websiteUrl}/products/logic-voice)
- Latency Benchmark: Sub-120ms P99 conversational voice response (imperceptible latency matching human conversational cadence).
- Technical Architecture:
  • Full-Duplex Audio Streaming: Bi-directional WebRTC and SIP trunking bridge for live phone calls and browser voice consoles.
  • Multi-Stage Voice Pipeline: Real-time high-speed Speech-to-Text (STT via specialized acoustic models), contextual neural intent classification, ultra-fast LLM reasoning, and streaming low-jitter Text-to-Speech (TTS).
  • Natural Interruptibility & Acoustic Filtering: Allows users to cut in mid-sentence with intelligent backchanneling, background noise cancellation, and echo suppression.
  • Polyglot & Accent Adaptation: Native comprehension of Indian English, Tamil, Hindi, and regional accents with contextual semantic correction.
  • Tool-Assisted Execution & Safety Gates: Capable of booking calendar appointments, looking up patient records, sending WhatsApp confirmations, and triggering API webhooks with explicit confirmation gates for consequential actions.
  • Telephony & Call Center Automation: Automates tier-1 customer inquiries, patient appointment scheduling, lead qualification, and emergency hospital triage routing with warm human transfer.

================================================================================
4. FLAGSHIP PRODUCT 3: VOICE SHIELD (ZERO-TRUST ANTI-DEEPFAKE VOICE FIREWALL)
================================================================================
- Product Name: Voice Shield
- Category: Real-Time AI Voice Biometrics, Deepfake Defense & Acoustic Threat Firewall
- Live URL: ${COMPANY.websiteUrl}/voice-shield (or ${COMPANY.websiteUrl}/products/voice-shield)
- Defense Gate Accuracy: 99.4% biometric defense gate against synthetic voice cloning and AI impersonation.
- Verification Latency: Sub-15ms fast-path acoustic frequency and spectral phase verification (runs inline on active telephone/SIP streams without conversational lag).
- Key Capabilities & Threat Mitigation:
  • Zero-Shot Voice Clone Intercept: Real-time spectral analysis intercepts models like ElevenLabs, XTTS, Bark, and voice-conversion GANs.
  • Dynamic Acoustic Liveness Validation: Issues non-repeating acoustic challenges and detects vocal tract physiological resonance anomalies that synthetic AI generators cannot mimic.
  • Banking & Treasury Fraud Defense: Protects financial institutions, VIP accounts, and corporate treasury desks from high-stakes CEO impersonation and fraudulent wire transfer authorization.
  • Telemedicine Prescription Protection: Coupled with LIT Healthcare to cryptographically verify doctor voice signatures before releasing narcotic or controlled drug prescriptions over telephone or telemedicine lines.
  • Strict Zero-Retention Privacy: Raw audio waveforms are never permanently written to disk or used for training. Conforms strictly to India's DPDP Act 2023, HIPAA, and GDPR standards.

================================================================================
5. FLAGSHIP PRODUCT 4: NEXUS ENTERPRISE CRM
================================================================================
- Product Name: Nexus CRM
- Category: High-Throughput Lead Intelligence & Predictive Pipeline Management
- Capabilities: Automated lead qualification, deterministic intent scoring (0–100), automated WhatsApp/Email nurture sequences, digital proposal approval, and contract e-signatures.

================================================================================
6. PACKAGES & COMMERCIAL PRICING
================================================================================
- Digital Launch Pack (₹8,999):
  • Target: Startups, retail businesses, and local practices needing modern high-performance web infrastructure.
  • Scope: Fast, responsive multi-page web platform, SEO optimization, mobile-first design, contact/lead capture automation, SSL, domain setup, 1 month complimentary engineering support.
  • Delivery: 5–7 business days.

- Business Pro Pack (₹18,999):
  • Target: Growing companies, clinics, educational institutions, and multi-service agencies.
  • Scope: Custom workflow engines, client portals, automated WhatsApp/Email notifications, payment gateway integration, dynamic admin dashboard, 3 months dedicated engineering support.
  • Delivery: 10–14 business days.

- Enterprise AI Architecture (Starting from ₹38,999 – ₹50,000+ Custom Quote):
  • Target: Hospitals, financial institutions, enterprise supply chains, and high-volume operations.
  • Scope: Custom private RAG, autonomous multi-agent pipelines, Voice Shield audio security, on-premise or hybrid cloud deployment, dedicated SLAs, 6 months 24/7 priority SLA support.

- Free Architecture Demo Policy:
  • Prospective clients can test and review a customized interactive architecture demo BEFORE making any advance payment.
  • 100% money-back guarantee if delivery milestones fail our strict QA criteria.

================================================================================
7. CORE ENGINEERING SERVICES
================================================================================
1. Autonomous AI Agents & Multi-Agent Swarms: Self-healing workflows, document analysis, and automated operational tasks.
2. Clinical Healthcare Systems: Custom hospital EMR, OPD/IPD tracking, and pharmacy management.
3. Real-Time Voice Intelligence: Conversational voice bots, SIP/telephony integration, and contact center automation.
4. Voice Biometrics & Security: Deepfake defense, acoustic anomaly detection, and voice authentication.
5. High-Performance Web & Mobile Apps: Next.js 16, React 19, TypeScript, Tailwind CSS, Turbopack, and PWA.
6. Cloud & Database Architecture: Scalable Supabase PostgreSQL, Redis caching, microservices, and serverless edge functions.

================================================================================
8. FOUNDER & LEADERSHIP DOSSIER
================================================================================
- Name: ${FOUNDER.name}
- Title: ${FOUNDER.title}
- Background: Full-stack AI systems architect and clinical software engineer. Has architected and deployed enterprise systems across healthcare, intelligent voice engines, zero-trust voice security firewalls, and modern data platforms.
- Location: Coimbatore, Tamil Nadu, India.
`;

/**
 * Builds the exhaustive prompt provided to the LLM.
 */
export function buildComprehensiveSystemPrompt(): string {
  return `You are LOGIC AI, the senior executive engineering assistant and commercial solutions advisor for ${COMPANY.displayName} (${COMPANY.websiteUrl}).

YOUR ROLE & CONDUCT:
- You represent the engineering and executive team at Logic Intelligence Technologies.
- Provide authoritative, articulate, formal, and deeply knowledgeable answers.
- Speak with technical clarity, precision, and confidence.
- When asked about company platforms, explain them with high fidelity using the verified facts below.
- Highlight our flagship platforms: LIT Healthcare (Hospital OS), Logic Voice (Conversational AI), and Voice Shield (Anti-deepfake voice firewall).
- If the visitor asks about pricing, packages, or services, outline the exact numbers (₹8,999 Launch Pack, ₹18,999 Business Pro Pack, ₹38,999+ Enterprise) and mention our Free Architecture Demo.
- Always provide helpful next steps: encourage scheduling a consultation (${COMPANY.websiteUrl}/book-consultation), exploring the free demo (${COMPANY.websiteUrl}/free-demo), or messaging our engineering desk on WhatsApp at ${COMPANY.phone}.
- CRITICAL LENGTH & BREVITY REQUIREMENT: Every response must be strictly 4 to 5 lines of words (approx 45–70 words). Never output walls of text. Be direct, authoritative, and provide the most essential facts with a single clear CTA.
GREETING INSTRUCTION: When the user says 'hello', 'hi', or offers a simple greeting, keep your response CONCISE, FORMAL, and HIGHLY PERSUASIVE. Introduce Logic Intelligence Technologies with executive prestige, highlight our flagship platforms (LIT Healthcare, Logic Voice, Voice Shield), state our Free Architecture Demo & fixed-price packages (from ₹8,999), and invite them to explore a working prototype demo or book a consultation.

${MASTER_COMPANY_KNOWLEDGE}
`;
}

/**
 * High-fidelity deterministic fallback reply generator.
 * Produces structured, formal, and deeply informative responses when an external LLM call is unavailable.
 */
export function generateAuthoritativeReply(userQuery: string): string {
  const query = (userQuery || "").toLowerCase();
  const rawTrimmed = (userQuery || "").trim().toLowerCase();
  const stripped = rawTrimmed.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");

  // 0. Specialized Executive Greeting Handling
  // When a user message is a greeting (e.g. /^(hello|hi|hey|greetings|good (morning|afternoon|evening))\b/i or matches "hello", "hi")
  const greetingRegex = /^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))\b/i;
  const isGreeting =
    greetingRegex.test(rawTrimmed) ||
    greetingRegex.test(stripped) ||
    stripped === "hello" ||
    stripped === "hi" ||
    rawTrimmed === "hello" ||
    rawTrimmed === "hi";

  const hasSpecificPlatformDeepTopic =
    query.includes("voice shield") ||
    query.includes("deepfake") ||
    query.includes("biometric") ||
    query.includes("audio firewall") ||
    query.includes("logic voice") ||
    query.includes("hospital") ||
    query.includes("healthcare") ||
    query.includes("lit healthcare") ||
    query.includes("emr") ||
    query.includes("ehr") ||
    query.includes("founder") ||
    query.includes("ceo") ||
    query.includes("vikash");

  if (isGreeting && !hasSpecificPlatformDeepTopic) {
    return (
      `Welcome to **Logic Intelligence Technologies**. I am **LOGIC AI**, your executive systems advisor.\n` +
      `We engineer **LIT Healthcare** (hospital OS in 14 sites), **Logic Voice** (telephony AI), and **Voice Shield** (biometric defense).\n` +
      `Fixed-price engineering packages start from **₹8,999**, backed by our risk-free **Free Architecture Demo** before payment.\n` +
      `May we prepare a prototype demo for you, or connect you with our engineering desk on WhatsApp at **${COMPANY.phone}**?`
    );
  }

  // 1. Voice Shield / Deepfake / Biometrics
  if (query.includes("voice shield") || query.includes("deepfake") || query.includes("biometric") || query.includes("audio firewall") || query.includes("clone") || query.includes("cloning") || query.includes("voice security")) {
    return (
      `**Voice Shield** is our zero-trust acoustic biometric firewall defending telephony and SIP streams against synthetic AI voice fraud.\n` +
      `It delivers **Sub-15ms Inline Latency** for real-time verification alongside a **99.4% Deepfake Detection** defense gate.\n` +
      `Voice clones are intercepted without raw audio retention, guaranteeing strict DPDP Act 2023, HIPAA, and banking compliance.\n` +
      `Explore live at [Voice Shield](${COMPANY.websiteUrl}/voice-shield) or connect with our security desk on WhatsApp at **${COMPANY.phone}**.`
    );
  }

  // 2. Logic Voice / Conversational AI / Telephony
  if (query.includes("logic voice") || query.includes("voice assistant") || query.includes("telephony") || query.includes("speech") || query.includes("voice agent") || query.includes("voice bot")) {
    return (
      `**Logic Voice** is our conversational voice intelligence engine engineered for real-time autonomous telephony and natural speech interaction.\n` +
      `Powered by sub-120ms P99 latency and full-duplex streaming over WebRTC and SIP trunks with native accent adaptation.\n` +
      `It autonomously qualifies inquiries, routes calls, and executes workflow actions with strict security gates.\n` +
      `Test it live at [Logic Voice](https://logicvoice.logicintelligencetechnologies.in) or connect on WhatsApp at **${COMPANY.phone}**.`
    );
  }

  // 3. LIT Healthcare / Hospital Management OS
  if (query.includes("hospital") || query.includes("healthcare") || query.includes("lit healthcare") || query.includes("clinic") || query.includes("patient") || query.includes("emr") || query.includes("ehr") || query.includes("bed")) {
    return (
      `**LIT Healthcare** is our clinical hospital management OS currently deployed across **14 active hospital sites** and clinical centers.\n` +
      `It unifies real-time bed telemetry, OPD/IPD queues, EMR/EHR clinical records, pharmacy inventory, and automated billing.\n` +
      `Built on zero-trust multi-tenant PostgreSQL RLS architecture with complete HIPAA and DPDP Act 2023 compliance.\n` +
      `Request a clinical walkthrough at [LIT Healthcare](${COMPANY.websiteUrl}/healthcare) or message our team on WhatsApp at **${COMPANY.phone}**.`
    );
  }

  // 4. Pricing / Packages / Costs / Demo
  if (query.includes("price") || query.includes("pricing") || query.includes("cost") || query.includes("package") || query.includes("pack") || query.includes("rate") || query.includes("quote") || query.includes("fee") || query.includes("demo")) {
    return (
      `**Logic Intelligence Technologies** provides transparent fixed-price engineering starting from **₹8,999** for the Digital Launch Pack.\n` +
      `We also offer the Business Pro Pack at **₹18,999** and custom Enterprise AI Architecture with private RAG and Voice Shield.\n` +
      `Every engagement includes our risk-free **Free Architecture Demo**—we build a working prototype before any payment is made.\n` +
      `Explore packages at [Packages](${COMPANY.websiteUrl}/packages) or discuss your project on WhatsApp at **${COMPANY.phone}**.`
    );
  }

  // 5. Founder / Leadership
  if (query.includes("founder") || query.includes("ceo") || query.includes("who started") || query.includes("vikash") || query.includes("leadership") || query.includes("team")) {
    return (
      `**${FOUNDER.name}** is the Founder, CEO & Chief Systems Architect of **Logic Intelligence Technologies**.\n` +
      `He architects enterprise AI systems including **LIT Healthcare**, **Logic Voice**, and the **Voice Shield** acoustic firewall.\n` +
      `Based in Coimbatore, Tamil Nadu, he leads our engineering team in building deterministic intelligence platforms.\n` +
      `Connect with our executive desk on WhatsApp at **${COMPANY.phone}** or email **${COMPANY.email}**.`
    );
  }

  // 6. Services & Capabilities
  if (query.includes("service") || query.includes("capability") || query.includes("capabilities") || query.includes("what do you do") || query.includes("tech stack") || query.includes("build") || query.includes("develop")) {
    return (
      `We engineer clinical software (**LIT Healthcare**), conversational voice (**Logic Voice**), and deepfake defense (**Voice Shield**).\n` +
      `Our stack spans modern Next.js applications, multi-agent AI swarms, automated CRM pipelines, and secure cloud backends.\n` +
      `Packages begin from **₹8,999** with our complimentary **Free Architecture Demo** before any financial commitment.\n` +
      `Schedule an architecture session at [Book Consultation](${COMPANY.websiteUrl}/book-consultation) or WhatsApp **${COMPANY.phone}**.`
    );
  }

  // 7. General Executive Welcome & Overview
  return (
    `Welcome to **${COMPANY.displayName}**. I am **LOGIC AI**, your executive systems advisor.\n` +
    `We build **LIT Healthcare** (hospital OS), **Logic Voice** (telephony AI), and **Voice Shield** (anti-deepfake firewall).\n` +
    `Engineering packages start from **₹8,999** with a complimentary **Free Architecture Demo** before any payment.\n` +
    `What system can we build for you today? Connect with our engineering desk on WhatsApp at **${COMPANY.phone}**.`
  );
}
