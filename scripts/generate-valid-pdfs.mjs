import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resourcesDir = path.resolve(__dirname, '../public/resources');

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

const PDF_DOCS = [
  {
    filename: 'company-profile.pdf',
    title: 'Corporate Capability Profile',
    subtitle: 'Logic Intelligence Technologies — Executive Capabilities & Architecture Overview',
    sections: [
      '1. Executive Summary',
      'Logic Intelligence Technologies is a specialized enterprise technology and engineering firm delivering high-performance full-stack web platforms, deterministic workflow automation, and production-grade AI systems. Founded and led by Vikash Saravanan, our systems are engineered with mathematical precision, strict schema validations, and enterprise security guarantees.',
      '2. Core Capabilities',
      '- Scalable Cloud Architectures: Microservices, Next.js App Router, edge computing, distributed relational databases (PostgreSQL/Supabase).',
      '- Intelligent Automation: Headless browser automation (Playwright/Python), deterministic robotic process automation, and multi-system synchronization.',
      '- AI Engineering & Orchestration: Domain-specific RAG systems, schema-enforced LLM integrations, and context-bounded generative assistants.',
      '3. Quality & Verification Standards',
      'Every system engineered by Logic Intelligence Technologies undergoes automated end-to-end testing, static type verification, strict Row Level Security (RLS) enforcement, and WCAG accessibility compliance.'
    ]
  },
  {
    filename: 'services-brochure.pdf',
    title: 'Engineering Services Brochure',
    subtitle: 'Comprehensive Services Catalog & Engagement Models',
    sections: [
      '1. Custom Software Engineering',
      'End-to-end bespoke software systems built for resilience, horizontal scalability, and maintainability. Full-stack TypeScript, React, Next.js, Node.js, and cloud native infrastructure.',
      '2. Intelligent Process & Workflow Automation',
      'High-throughput robotic process automation and autonomous worker pipelines that eliminate repetitive operational overhead and human error.',
      '3. Artificial Intelligence & Applied Machine Learning',
      'Bespoke AI solutions grounded in private organizational knowledge, structured output schemas, and low-latency inference pipelines.',
      '4. Cloud Infrastructure & Security Auditing',
      'Database hardening, Row Level Security auditing, CI/CD pipeline automation, and multi-tenant cloud isolation.'
    ]
  },
  {
    filename: 'capability-statement.pdf',
    title: 'Government & Enterprise Capability Statement',
    subtitle: 'Official Procurement Specifications and Vendor Standards',
    sections: [
      '1. Company Overview',
      'Company Name: Logic Intelligence Technologies\nOfficial Portal: https://www.logicintelligencetechnologies.in/\nFounder & Lead Systems Engineer: Vikash Saravanan\nCore Focus: Enterprise Software, Intelligent Automation, AI Orchestration',
      '2. Technical Differentiators',
      '- Deterministic Execution: State-driven workflow pipelines that guarantee verifiable outcomes.\n- Server-Enforced Security: All authorization and data isolation enforced at PostgreSQL RLS and server layers.\n- High-Performance Delivery: Zero-compromise web vitals and fast execution cycles.'
    ]
  },
  {
    filename: 'website-development-checklist.pdf',
    title: 'Website Development & Launch Checklist',
    subtitle: '50-Point Production Engineering Quality Assurance Protocol',
    sections: [
      '1. Security & Authentication',
      '- RLS enabled on all exposed tables.\n- Server-side authorization verification on all protected endpoints.\n- Content Security Policy (CSP), Strict-Transport-Security, and X-Content-Type-Options headers active.',
      '2. Accessibility & Usability (WCAG 2.1 AA)',
      '- Visible keyboard focus rings with high contrast.\n- Complete screen reader ARIA landmarks and descriptive alt attributes.\n- Accessible fallback surfaces for all glassmorphic and modal components.',
      '3. Performance & SEO',
      '- Canonical tags and Open Graph metadata on all public routes.\n- Clean sitemap.xml and robots.txt excluding private/authenticated routes.\n- Sub-second First Contentful Paint (FCP) and optimal Largest Contentful Paint (LCP).'
    ]
  },
  {
    filename: 'ai-readiness-assessment.pdf',
    title: 'Enterprise AI Readiness Assessment Framework',
    subtitle: 'Diagnostic Methodology for Data Feasibility & Model Deployment',
    sections: [
      '1. Data Governance & Hygiene',
      'Evaluating enterprise data pipelines, schema consistency, deduplication, and regulatory compliance before model ingestion.',
      '2. Latency & Infrastructure Economics',
      'Benchmarking inference latency requirements, local versus cloud model hosting, caching strategies, and token cost forecasting.',
      '3. Deterministic Safety Boundaries',
      'Implementing strict input validation, prompt-injection defense layers, grounded retrieval bounds, and safe fallback responses.'
    ]
  },
  {
    filename: 'business-automation-guide.pdf',
    title: 'Executive Guide to Business Workflow Automation',
    subtitle: 'Strategic Roadmap for Eliminating Manual Bottlenecks',
    sections: [
      '1. Identification of High-Impact Targets',
      'Prioritizing high-volume, repetitive operations: lead intake, CRM synchronization, scheduled invoice dispatch, and automated meeting logistics.',
      '2. Resilient Error Handling & Circuit Breakers',
      'Designing idempotent workers, dead-letter queues, exponential backoff retries, and automated administrative alerts.',
      '3. Human-in-the-Loop Safeguards',
      'Establishing approval gates for high-risk actions, audit logging, and transparent status reporting across the organization.'
    ]
  },
  {
    filename: 'technology-roadmap-template.pdf',
    title: 'Enterprise Technology Roadmap Template',
    subtitle: 'Phased Architectural Transformation & Modernization Standard',
    sections: [
      'Phase 1: Stabilization & Security Baseline',
      'Audit dependencies, eliminate unverified secrets, configure CI/CD gates, and secure all exposed database tables with RLS.',
      'Phase 2: Core Platform Optimization',
      'Implement unified design tokens, responsive layouts, unified back navigation, and high-performance server components.',
      'Phase 3: Automated Growth Engine',
      'Deploy automated lead scoring, CRM pipelines, calendar bookings, and contextual AI assistants.'
    ]
  },
  {
    filename: 'project-proposal-template.pdf',
    title: 'Full-Stack Project Proposal & Scope Template',
    subtitle: 'Standardized Project Scope, Milestones & Acceptance Criteria',
    sections: [
      '1. Project Objectives & Executive Vision',
      'Detailed articulation of the business challenge, required engineering deliverables, and measurable success metrics.',
      '2. Milestone Architecture & Delivery Timeline',
      'Milestone 1: Architectural Foundation & Database Schema Design\nMilestone 2: Core Feature Implementation & Service Integration\nMilestone 3: Rigorous Testing, Security Audits & Production Deployment',
      '3. Terms, Ownership & IP Assignment',
      'Full intellectual property ownership transfers to the client upon milestone settlement. Post-launch support SLAs and warranty terms.'
    ]
  },
  {
    filename: 'statement-of-work.pdf',
    title: 'Enterprise Statement of Work (SOW) Standard',
    subtitle: 'Operational Specifications, Acceptance Criteria & SLA Commitments',
    sections: [
      '1. Scope of Engagement',
      'Explicit enumeration of services, architectural components, third-party integrations, and boundary exclusions.',
      '2. Acceptance Testing Protocol',
      'Formal acceptance testing procedure, defect classification tiers, remediation timeframes, and sign-off requirements.',
      '3. Operational SLA & Escalation Paths',
      'Defined uptime commitments, security incident response thresholds, and dedicated engineering escalation contacts.'
    ]
  },
  {
    filename: 'case-study.pdf',
    title: 'Enterprise Digital Transformation Case Study',
    subtitle: 'High-Throughput Workflow Engineering & Architecture Case Study',
    sections: [
      '1. The Engineering Challenge',
      'A fragmented workflow ecosystem suffering from manual data synchronization errors, slow page loads, and vulnerable database endpoints.',
      '2. The Implemented Solution',
      'Engineered an event-driven Next.js App Router platform backed by PostgreSQL with strict RLS policies, real-time lead ingestion, and automated follow-ups.',
      '3. Verified Architecture Outcomes',
      '- 100% server-side authorization enforcement.\n- Zero unauthorized data leakage in cross-tenant isolation tests.\n- Sub-second median response times across all customer touchpoints.'
    ]
  },
  {
    filename: 'press-kit.pdf',
    title: 'Official Media & Press Kit',
    subtitle: 'Company Boilerplate, Leadership Profile & Brand Guidelines',
    sections: [
      '1. Company Profile',
      'Logic Intelligence Technologies is a technology company delivering scalable software platforms, intelligent automation, and production-oriented workflow systems.',
      '2. Leadership Information',
      'Founder & Lead Systems Engineer: Vikash Saravanan\nEducation: B.Tech in Artificial Intelligence & Data Science, Rathinam Technical Campus\nKey Initiatives: Omni-Apply Autonomous Workflow Engine',
      '3. Approved Media Assets',
      'Official Logo, Brand Typography (Outfit / Inter), High-Resolution Assets, and official corporate color standards.'
    ]
  },
  {
    filename: 'investor-partnership-information-memorandum.pdf',
    title: 'Investor & Strategic Partnership Information Memorandum',
    subtitle: 'Confidential Strategic Overview & Technology Ecosystem',
    sections: [
      '1. Strategic Vision',
      'Building the standard operating system for intelligent enterprise automation, combining high-speed web platforms with deterministic software workers.',
      '2. Technology Moat',
      'Proprietary deterministic workflow orchestration, strict schema-enforced AI bridges, and proven low-overhead full-stack architecture.',
      '3. Expansion Roadmap',
      'Scaling enterprise client engagements, expanding AI capability frameworks, and deepening vertical workflow automation integrations.'
    ]
  }
];

function escapePdfText(str) {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createPdfBuffer(doc) {
  const streamLines = [];
  streamLines.push('BT');
  streamLines.push('/F1 22 Tf');
  streamLines.push('50 740 Td');
  streamLines.push(`(${escapePdfText(doc.title)}) Tj`);
  streamLines.push('/F1 12 Tf');
  streamLines.push('0 -24 Td');
  streamLines.push(`(${escapePdfText(doc.subtitle)}) Tj`);
  streamLines.push('/F1 10 Tf');
  streamLines.push('0 -30 Td');
  streamLines.push('(Logic Intelligence Technologies — Official Corporate Publication) Tj');
  streamLines.push('0 -20 Td');
  streamLines.push('(----------------------------------------------------------------------------------------------------) Tj');

  let currentYOffset = 0;
  for (const sec of doc.sections) {
    const isHeading = /^[0-9]\./.test(sec) || /^Phase/.test(sec);
    streamLines.push('0 -22 Td');
    if (isHeading) {
      streamLines.push('/F1 13 Tf');
      streamLines.push(`(${escapePdfText(sec)}) Tj`);
      streamLines.push('/F1 10 Tf');
    } else {
      // Split long lines
      const words = sec.split(' ');
      let currentLine = '';
      for (const w of words) {
        if ((currentLine + ' ' + w).length > 85) {
          streamLines.push(`(${escapePdfText(currentLine.trim())}) Tj`);
          streamLines.push('0 -14 Td');
          currentLine = w;
        } else {
          currentLine += (currentLine ? ' ' : '') + w;
        }
      }
      if (currentLine) {
        streamLines.push(`(${escapePdfText(currentLine.trim())}) Tj`);
      }
    }
  }

  streamLines.push('0 -35 Td');
  streamLines.push('/F1 9 Tf');
  streamLines.push('(Confidential & Proprietary — Logic Intelligence Technologies | https://www.logicintelligencetechnologies.in) Tj');
  streamLines.push('ET');

  const streamContent = streamLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const objects = [];
  // 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  // 2: Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  // 3: Page
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
  // 4: Font
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  // 5: Stream Contents
  objects.push(`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

  let body = '%PDF-1.4\n';
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(body, 'utf-8'));
    body += objects[i] + '\n';
  }

  const startXref = Buffer.byteLength(body, 'utf-8');
  body += 'xref\n';
  body += `0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (const off of offsets) {
    body += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  body += 'trailer\n';
  body += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += 'startxref\n';
  body += `${startXref}\n`;
  body += '%%EOF\n';

  return Buffer.from(body, 'utf-8');
}

for (const doc of PDF_DOCS) {
  const filePath = path.join(resourcesDir, doc.filename);
  const pdfBuffer = createPdfBuffer(doc);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`Generated valid PDF: ${doc.filename} (${pdfBuffer.length} bytes)`);
}
console.log('All 12 valid PDF files successfully generated!');
