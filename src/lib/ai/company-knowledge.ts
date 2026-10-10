import "server-only";
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

${MASTER_COMPANY_KNOWLEDGE}
`;
}

/**
 * High-fidelity deterministic fallback reply generator.
 * Produces structured, formal, and deeply informative responses when an external LLM call is unavailable.
 */
export function generateAuthoritativeReply(userQuery: string): string {
  const query = (userQuery || "").toLowerCase();

  // 1. Voice Shield / Deepfake / Biometrics
  if (query.includes("voice shield") || query.includes("deepfake") || query.includes("biometric") || query.includes("audio firewall") || query.includes("clone") || query.includes("cloning") || query.includes("voice security")) {
    return (
      `### **Voice Shield — Real-Time AI Voice Biometrics & Deepfake Defense**\n\n` +
      `**Voice Shield** is our enterprise-grade audio security firewall engineered to defend telephony, SIP trunking, WebRTC, and call center infrastructure from synthetic AI voice clones and deepfake wire fraud.\n\n` +
      `**Key Architectural Specifications:**\n` +
      `• **Sub-15ms Inline Latency:** Performs spectral phase and frequency analysis directly on streaming audio with zero perceptual lag.\n` +
      `• **99.4% Deepfake Detection Accuracy:** Identifies zero-shot cloning algorithms (e.g., ElevenLabs, XTTS, Bark, and voice-conversion GANs).\n` +
      `• **Dynamic Acoustic Liveness:** Challenges audio streams with non-repeating acoustic probes to verify physical human vocal tract resonance.\n` +
      `• **Zero-Retention Privacy:** No raw voice audio is ever retained or stored, guaranteeing strict **DPDP Act 2023**, **HIPAA**, and **GDPR** compliance.\n` +
      `• **Key Applications:** Banking wire transfer authorization, CEO/C-Suite impersonation defense, and clinical telephonic prescription validation.\n\n` +
      `Would you like to schedule an enterprise security demonstration? Connect directly with our team on WhatsApp at **${COMPANY.phone}** or explore details at **${COMPANY.websiteUrl}/voice-shield**.`
    );
  }

  // 2. Logic Voice / Conversational AI / Telephony
  if (query.includes("logic voice") || query.includes("voice assistant") || query.includes("telephony") || query.includes("speech") || query.includes("voice agent") || query.includes("voice bot")) {
    return (
      `### **Logic Voice — Conversational Voice Intelligence Engine**\n\n` +
      `**Logic Voice** is our low-latency, voice-first personal AI assistant and autonomous telephony platform developed for natural spoken interaction, reasoning, and approved tool execution.\n\n` +
      `**Key Technical Capabilities:**\n` +
      `• **Sub-120ms P99 Latency:** Delivers conversational voice responses matching natural human conversational cadence.\n` +
      `• **Full-Duplex Audio & Streaming:** Bi-directional streaming over WebRTC and SIP telephone trunks with real-time interruptibility.\n` +
      `• **Polyglot & Multi-Accent Recognition:** Native comprehension of Indian English, Tamil, Hindi, and regional dialects with ambient acoustic noise filtering.\n` +
      `• **Tool-Assisted Execution:** Autonomous multi-step goal planning (scheduling appointments, querying CRM/patient records, sending WhatsApp alerts) secured by confirmation gates for sensitive actions.\n` +
      `• **Live Interactive Console:** Experience real-time voice intelligence directly in our interactive browser console.\n\n` +
      `Explore Logic Voice live at **https://logicvoice.logicintelligencetechnologies.in** or message our engineering desk on WhatsApp at **${COMPANY.phone}**.`
    );
  }

  // 3. LIT Healthcare / Hospital Management OS
  if (query.includes("hospital") || query.includes("healthcare") || query.includes("lit healthcare") || query.includes("clinic") || query.includes("patient") || query.includes("emr") || query.includes("ehr") || query.includes("bed")) {
    return (
      `### **LIT Healthcare — Smart Hospital Management & Clinical Intelligence Platform**\n\n` +
      `**LIT Healthcare** is our enterprise smart hospital operations platform currently deployed across **14 active hospital sites and clinical centers**.\n\n` +
      `**Comprehensive System Capabilities:**\n` +
      `• **Real-Time Bed & Ward Telemetry:** Live visual telemetry of ICU beds, general wards, oxygen units, and triage occupancy.\n` +
      `• **End-to-End Patient Lifecycle:** Outpatient (OPD) token scheduling, inpatient (IPD) admissions, digital clinical notes, and discharge summaries.\n` +
      `• **Pharmacy & Diagnostic Lab Integration:** Prescription sync, drug dispensing inventory control, batch/expiry alerts, and automated diagnostic test report delivery via WhatsApp/SMS.\n` +
      `• **Billing & Claims Processing:** Itemized tariff management, automated insurance pre-authorization documentation, and GST-compliant invoicing.\n` +
      `• **Clinical Governance & HIPAA Compliance:** Multi-tenant architecture with PostgreSQL Row-Level Security (RLS) guaranteeing strict role-based data isolation for medical records.\n\n` +
      `Request a guided hospital walkthrough or live demo on WhatsApp at **${COMPANY.phone}** or view our platform at **${COMPANY.websiteUrl}/healthcare**.`
    );
  }

  // 4. Pricing / Packages / Costs / Demo
  if (query.includes("price") || query.includes("pricing") || query.includes("cost") || query.includes("package") || query.includes("pack") || query.includes("rate") || query.includes("quote") || query.includes("fee") || query.includes("demo")) {
    return (
      `### **Engineering Packages & Commercial Terms**\n\n` +
      `At **Logic Intelligence Technologies**, we provide clear, deterministic pricing backed by our **Free Architecture Demo** policy:\n\n` +
      `1. **Digital Launch Pack — ₹8,999**\n` +
      `   • *Best for:* Startups, retail brands, and practices establishing a high-performance web presence.\n` +
      `   • *Includes:* Responsive Next.js application, mobile-first UX, technical SEO, automated lead capture, SSL, and 1 month complimentary engineering support. Delivery in 5–7 days.\n\n` +
      `2. **Business Pro Pack — ₹18,999**\n` +
      `   • *Best for:* Clinics, growing enterprises, and organizations requiring operational workflow automation.\n` +
      `   • *Includes:* Custom client portal, automated WhatsApp/Email notification flows, payment gateway integration, operational analytics dashboard, and 3 months dedicated support. Delivery in 10–14 days.\n\n` +
      `3. **Enterprise AI Architecture — Starting from ₹38,999 – ₹50,000+**\n` +
      `   • *Best for:* Hospitals, financial institutions, and complex enterprise automation.\n` +
      `   • *Includes:* Custom private RAG, Voice Shield deepfake firewall, autonomous multi-agent pipelines, on-prem/hybrid deployment, and 24/7 priority SLA support.\n\n` +
      `✨ **Free Architecture Demo:** We build an initial architectural demo for prospective clients before any advance payment is made.\n\n` +
      `To schedule your free demo or discuss custom requirements, WhatsApp us at **${COMPANY.phone}** or email **${COMPANY.email}**.`
    );
  }

  // 5. Founder / Leadership
  if (query.includes("founder") || query.includes("ceo") || query.includes("who started") || query.includes("vikash") || query.includes("leadership") || query.includes("team")) {
    return (
      `### **Founder & Executive Leadership**\n\n` +
      `**${FOUNDER.name}** is the Founder, CEO & Chief Systems Architect of **Logic Intelligence Technologies**.\n\n` +
      `• **Background:** Full-stack AI systems architect and clinical software engineer based in Coimbatore, Tamil Nadu, India.\n` +
      `• **Key Engineering Architectures:** Architect of **LIT Healthcare** (active in 14 hospitals), the **Logic Voice** conversational telephony engine, and the **Voice Shield** zero-trust acoustic deepfake firewall.\n` +
      `• **Contact Founder Directly:** Reach out via WhatsApp at **${COMPANY.phone}** or email **${COMPANY.email}**.`
    );
  }

  // 6. Services & Capabilities
  if (query.includes("service") || query.includes("capability") || query.includes("capabilities") || query.includes("what do you do") || query.includes("tech stack") || query.includes("build") || query.includes("develop")) {
    return (
      `### **Engineering Capabilities at Logic Intelligence Technologies**\n\n` +
      `We build clinical-grade software, real-time voice infrastructure, and autonomous AI systems:\n\n` +
      `• **Clinical Systems & Hospital Management:** Multi-tenant hospital OS, bed telemetry, electronic health records (LIT Healthcare).\n` +
      `• **Conversational Voice Engines:** Sub-120ms P99 duplex voice AI, WebRTC & SIP telephone integration (Logic Voice).\n` +
      `• **Voice Biometrics & Deepfake Defense:** Real-time 99.4% acoustic voice firewall protecting banking and healthcare (Voice Shield).\n` +
      `• **Enterprise AI Agents & Swarms:** Autonomous multi-agent pipelines, document intelligence, and automated lead capture.\n` +
      `• **Modern High-Performance Web & Mobile:** Next.js 16, React 19, TypeScript, Tailwind CSS, Turbopack, and Supabase PostgreSQL.\n\n` +
      `Book a technical consultation with our engineering team at **${COMPANY.websiteUrl}/book-consultation** or message us directly on WhatsApp at **${COMPANY.phone}**.`
    );
  }

  // 7. General Executive Welcome & Comprehensive Overview
  return (
    `Welcome to **Logic Intelligence Technologies**. We are an AI engineering, intelligent automation, and clinical systems studio based in Coimbatore, Tamil Nadu.\n\n` +
    `Here is how I can assist you today:\n` +
    `• **LIT Healthcare:** Smart Hospital Management OS active in 14 hospital sites (Bed telemetry, OPD/IPD, Pharmacy, Billing).\n` +
    `• **Logic Voice:** Sub-120ms conversational AI voice engine and autonomous telephony.\n` +
    `• **Voice Shield:** Zero-trust anti-deepfake voice biometric firewall with 99.4% defense gate.\n` +
    `• **Engineering Packages:** Digital Launch Pack (₹8,999), Business Pro Pack (₹18,999), and Enterprise AI Architecture.\n` +
    `• **Free Architecture Demo:** We provide a functional architecture demo before payment.\n\n` +
    `What system or platform can we explore for your organization? You can also message our engineering desk directly on WhatsApp at **${COMPANY.phone}**.`
  );
}
