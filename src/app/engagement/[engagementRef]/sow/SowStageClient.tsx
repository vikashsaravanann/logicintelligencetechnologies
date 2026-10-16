'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { calculateEngagementFinancials } from '@/lib/engagements/financials';

interface SowStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  metadata?: Record<string, unknown>;
}

export default function SowStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail = 'client@domain.com',
  initialStatus = 'available',
  initialData = {},
  metadata,
}: SowStageClientProps) {
  const router = useRouter();
  const [signerName, setSignerName] = useState(initialData?.signerName || contactName);
  const [signerTitle, setSignerTitle] = useState(initialData?.signerTitle || 'Managing Director / Authorized Representative');
  const [signerEntity, setSignerEntity] = useState(initialData?.signerEntity || companyName);
  const [agreedToAllTerms, setAgreedToAllTerms] = useState(false);
  const [agreedToIpTerms, setAgreedToIpTerms] = useState(false);
  const [agreedToPaymentTerms, setAgreedToPaymentTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const isInitiallySigned = ['signed', 'completed', 'verified', 'approved'].includes(initialStatus || '');
  const [isSigned, setIsSigned] = useState(isInitiallySigned);
  const [signedTimestamp, setSignedTimestamp] = useState(initialData?.signedAt || '');
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | 'all'>(1);

  // Question/Revision Modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionChapter, setQuestionChapter] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState(false);

  // Authoritative SOW Contract Metadata (LIT-01 Master Document)
  const sowMeta = {
    contractRef: 'LIT-01-SOW-2026-084',
    version: 'v1.0 (Bilateral Legal Execution Baseline)',
    effectiveDate: '15 October 2026',
    governingLaw: 'Laws of the Republic of India (Jurisdiction: Coimbatore, Tamil Nadu)',
    provider: {
      legalName: 'LOGIC INTELLIGENCE TECHNOLOGIES',
      registrationType: 'Micro Enterprise (Services)',
      msmeUdyam: 'UDYAM-TN-03-0345274',
      registeredAddress: 'Eachanari, Coimbatore, Tamil Nadu 641021, India',
      officialEmail: 'hello@logicintelligencetechnologies.in',
      officialSignatory: 'S Vikash, Founder',
    },
    client: {
      legalName: companyName,
      primaryContact: contactName,
      contactEmail: contactEmail,
    },
    commercial: (() => {
      const candidateSubtotal =
        initialData?.subtotal ||
        metadata?.contract_subtotal ||
        metadata?.subtotal ||
        metadata?.contract_value ||
        metadata?.budget_range ||
        50;
      const fin = calculateEngagementFinancials(candidateSubtotal);
      return {
        financials: fin,
        subtotal: fin.subtotalFormatted,
        tax: `${fin.gstFormatted} (18% Statutory GST: CGST 9% [${fin.cgstFormatted}] + SGST 9% [${fin.sgstFormatted}])`,
        total: fin.totalFormatted,
        milestones: [
          {
            name: 'Milestone 1: Initial Deposit (Stage 6)',
            amount: `${fin.depositFormatted} (50%)`,
            timing: 'Due upon execution of this SOW, prior to project technical kickoff',
          },
          {
            name: 'Milestone 2: Final Settlement (Stage 11)',
            amount: `${fin.settlementFormatted} (50%)`,
            timing: 'Due upon delivery acceptance sign-off (Stage 10), prior to asset handover',
          },
        ],
      };
    })(),
  };

  const sowChapters = [
    {
      num: 1,
      title: 'Document Identification & Baseline Control',
      summary: 'Establishes contract reference LIT-01-SOW-2026-084, version v1.0, and governing document hierarchy linking Proposal LIT-PROP-2026-084, Technical Spec LIT-04, and Onboarding Guide LIT-03.',
      content: 'This Statement of Work and Master Service Agreement ("Agreement") constitutes a legally binding instrument between Logic Intelligence Technologies and the Client. This document supersedes all prior preliminary discussions, informal memoranda, and email exchanges regarding the contracted project scope.',
    },
    {
      num: 2,
      title: 'Parties & Legal Entity Information',
      summary: 'Defines the legal contracting entities, registered statutory addresses, MSME credentials, and authorized representatives.',
      content: `SERVICE PROVIDER: LOGIC INTELLIGENCE TECHNOLOGIES, a verified Micro Enterprise under MSME registration UDYAM-TN-03-0345274, having its registered office at Eachanari, Coimbatore, Tamil Nadu 641021, India, represented by its Founder, S Vikash.\n\nCLIENT: ${companyName}, represented by authorized corporate signatory ${contactName} (${contactEmail}). Both parties warrant that their respective signatories possess bona fide corporate authority to enter into this Agreement.`,
    },
    {
      num: 3,
      title: 'Project Overview & Platform Mandate',
      summary: 'Outlines the high-performance Next.js 15 web platform, custom REST APIs, Supabase PostgreSQL database architecture, and domain-isolated AI assistant.',
      content: `LIT is engaged by ${companyName} to design, engineer, verify, and deploy a bespoke enterprise digital platform consisting of a responsive Next.js 15 web application, secure Supabase backend with Row-Level Security, direct manual UPI payment clearing portal, and domain-isolated conversational AI pipelines.`,
    },
    {
      num: 4,
      title: 'Business Objectives (OBJ-01 to OBJ-04)',
      summary: 'Measurable organizational outcomes and technical milestones required for successful completion.',
      content: '• OBJ-01: Modern High-Speed Web Infrastructure — Deliver edge TTFB < 50ms and Lighthouse performance scores >= 90.\n• OBJ-02: Relational Data Isolation & RLS — Enforce 100% database Row-Level Security with zero unauthenticated data leaks.\n• OBJ-03: Zero-Gateway Direct UPI Clearance — Provide fraud-resistant manual UPI payment settlement with duplicate UTR locks.\n• OBJ-04: Domain-Isolated AI Assistant — Deploy a privacy-first conversational assistant with zero PHI/PII leakage risk.',
    },
    {
      num: 5,
      title: 'Scope of Work & Workstreams',
      summary: 'Detailed technical work breakdown across discovery, frontend engineering, backend services, database migrations, and CI/CD pipelines.',
      content: 'The engagement spans five integrated workstreams: (1) Architecture Audit & Wireframing, (2) Core Frontend UI & Client Portal, (3) Supabase Schema, RLS & Ledger Services, (4) Direct UPI Payment Engine & PDF Document Generators, and (5) End-to-End QA, Security Hardening & Production Handover.',
    },
    {
      num: 6,
      title: 'Contractual Deliverables (D-01 to D-06)',
      summary: 'Enumerates formal deliverables D-01 through D-06 with corresponding Acceptance Criteria (AC-01 through AC-06).',
      content: '• D-01: 50-Point Enterprise Architectural Audit & Compliance Alignment (AC-01)\n• D-02: Production Next.js 15 Web Application + Custom REST Middleware (AC-02)\n• D-03: Supabase Database Schema with Strict RLS & Immutable Audit Trails (AC-03)\n• D-04: Zero-Gateway Audited Manual UPI Payment Clearance Architecture (AC-04)\n• D-05: AI Assistant Pipeline with Groq LPU + Domain-Isolated RAG Embeddings (AC-05)\n• D-06: Comprehensive Handover Manifest, Transfer Runbooks & 90-Day SLA Support (AC-06)',
    },
    {
      num: 7,
      title: 'Technical Architecture & Component Topology',
      summary: 'Defines the Vercel Edge, Next.js 15 App Router, Supabase PostgreSQL, and Groq LPU component stack.',
      content: 'The application is deployed across Vercel Global Edge CDN nodes with HTTP/3 and TLS 1.3 encryption. Backend data persistence resides in a dedicated Supabase PostgreSQL instance with automated daily point-in-time recovery (PITR). All API communications utilize HTTPS with strict header policies.',
    },
    {
      num: 8,
      title: 'Delivery Schedule & Engineering Milestones (M1 to M5)',
      summary: 'Structured 10-week sprint timeline divided into five sequential engineering checkpoints.',
      content: '• M1 (Weeks 1–2): Discovery Baseline, Wireframes & Scaffolding\n• M2 (Weeks 3–4): Supabase Database Migrations & Security RLS Enforcement\n• M3 (Weeks 5–6): 13-Stage Client Engagement Portal & PDF Generators\n• M4 (Weeks 7–8): Direct UPI Clearance & AI Assistant Integration\n• M5 (Weeks 9–10): Full QA Suite Execution, Security Audit & Production Launch',
    },
    {
      num: 9,
      title: 'Client Responsibilities & Governance',
      summary: 'Specifies client obligations regarding decision-maker availability, asset provision, and 3-day review SLAs.',
      content: `The Client shall: (a) Appoint a primary technical contact with authority to approve deliverables; (b) Supply brand assets, copy, and credentials within 5 business days of request; (c) Review and respond to milestone submissions within three (3) business days; (d) Directly maintain active billing for client-owned cloud providers (Vercel, Supabase, domain registrar).`,
    },
    {
      num: 10,
      title: 'LIT Responsibilities & Engineering Standards',
      summary: 'Codifies LIT code quality standards, weekly sprint updates, Git source control, and security best practices.',
      content: 'LIT shall: (a) Maintain industry-leading coding standards with strict TypeScript type safety; (b) Provide weekly written sprint reports and milestone demonstrations; (c) Maintain code in protected Git repositories with mandatory peer review; (d) Adhere to OWASP Top 10 security standards and zero-trust principles.',
    },
    {
      num: 11,
      title: 'Dependencies, Risks & Operational Assumptions',
      summary: 'Outlines third-party external API dependencies, cloud provider availability, and assumptions.',
      content: 'Delivery timelines are contingent upon timely client asset submission and review feedback. LIT is not liable for temporary availability outages caused by external third-party providers (e.g. Vercel global incidents, Supabase scheduled maintenance, or upstream DNS registry disruptions).',
    },
    {
      num: 12,
      title: 'Acceptance Criteria & Inspection Flow',
      summary: 'Submit → Review → Respond → Resolve → Accept workflow with formal 5-day review period.',
      content: 'Upon delivery of each milestone, the Client has five (5) business days to inspect deliverables against agreed acceptance criteria (AC-01..AC-06). If non-conformance is identified, the Client shall issue written defect logs, and LIT shall rectify defects at no additional cost within five (5) business days.',
    },
    {
      num: 13,
      title: 'Commercial Terms & Scope Quotation',
      summary: `Commercial quotation subtotal of ${sowMeta.commercial.financials.subtotalFormatted} plus applicable 18% GST (${sowMeta.commercial.financials.gstFormatted}), totaling ${sowMeta.commercial.financials.totalFormatted}.`,
      content: `Total Contract Value is ${sowMeta.commercial.financials.totalFormatted} inclusive of 18% Goods & Services Tax (CGST 9% [${sowMeta.commercial.financials.cgstFormatted}] + SGST 9% [${sowMeta.commercial.financials.sgstFormatted}]). This professional services agreement reflects the Super Admin commercial quotation and scope schedule.`,
    },
    {
      num: 14,
      title: 'Payment Schedule (Strictly Two 50% Milestones)',
      summary: 'Preserves the canonical two-installment structure: 50% post-SOW execution at Stage 6, and 50% post-Delivery Acceptance at Stage 11.',
      content: `PAYMENT STRUCTURE (STRICTLY TWO 50% INSTALLMENTS):\n• Milestone 1: ${sowMeta.commercial.financials.depositFormatted} (50%) due upon bilateral execution of this SOW, payable at Stage 6 via verified manual UPI transfer.\n• Milestone 2: ${sowMeta.commercial.financials.settlementFormatted} (50%) due upon formal sign-off of Delivery Acceptance (Stage 10), payable at Stage 11 prior to production handover (Stage 12).`,
    },
    {
      num: 15,
      title: 'Change Control Management (LIT-06 Mini-Workflow)',
      summary: 'Governed process for scope modifications, technical impact assessments, and schedule adjustments.',
      content: 'Any deviation, addition, or reduction in scope from Deliverables D-01..D-06 must be submitted through the Stage 9 Change Request (LIT-06) system. No change is binding unless mutually agreed in writing with explicit commercial and timeline revisions.',
    },
    {
      num: 16,
      title: 'Intellectual Property Assignment & Transfer',
      summary: 'Full assignment of bespoke custom software and documentation to the Client upon verified Stage 11 final payment.',
      content: `Upon verified receipt of the final milestone payment (Stage 11), all intellectual property rights, copyright, and title in the custom code, designs, and documentation developed under this SOW shall transfer exclusively to ${companyName}. LIT retains rights to its pre-existing foundational frameworks, CLI utilities, and open-source tooling.`,
    },
    {
      num: 17,
      title: 'Non-Disclosure & Confidentiality',
      summary: 'Mutual non-disclosure covenants surviving for a period of three (3) years post-termination.',
      content: 'Both parties agree to treat all proprietary information, trade secrets, customer data, and system architectures as strictly confidential. This obligation survives termination of this Agreement for three (3) full calendar years.',
    },
    {
      num: 18,
      title: 'Data Handling, Privacy & Zero-PHI Protocol',
      summary: 'Zero raw password entry, least-privilege credential delegation, and strict data minimization.',
      content: 'LIT engineers operate under a strict credential-free policy. Access to cloud accounts must be delegated via scoped IAM roles or organization invites. Neither party shall store unencrypted sensitive personal data or unauthenticated Protected Health Information (PHI).',
    },
    {
      num: 19,
      title: 'Third-Party Services & Subscriptions',
      summary: 'Clarifies that recurring hosting, domain registration, and API token usage fees belong to the Client.',
      content: `Third-party services (including Vercel hosting tiers, Supabase compute add-ons, and domain registry renewals) shall be registered in the name of ${companyName} and paid directly by the Client. LIT is not an intermediary reseller of third-party cloud infrastructure.`,
    },
    {
      num: 20,
      title: 'Warranty & Post-Launch SLA (90-Day Coverage)',
      summary: 'Guarantees 90 days of priority defect remediation post-handover at zero additional cost.',
      content: 'LIT warrants that the deliverables will operate in accordance with agreed specifications for a period of ninety (90) days from formal Production Handover (Stage 12). Critical defects reported within this window will be remediated without charge pursuant to LIT-07 Service Level Agreements.',
    },
    {
      num: 21,
      title: 'Limitations of Liability & Exclusions',
      summary: 'Mutual liability cap equal to total fees paid under this Agreement, excluding indirect or consequential damages.',
      content: 'To the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, or consequential damages. Each party’s total aggregate liability arising out of or related to this Agreement shall be limited to the total fees actually paid by Client to LIT.',
    },
    {
      num: 22,
      title: 'Termination & Dispute Resolution',
      summary: 'Termination for breach with 14-day cure period; arbitration under Indian Arbitration and Conciliation Act in Coimbatore.',
      content: 'Either party may terminate for material breach if uncured within fourteen (14) days of written notice. In the event of dispute, the parties agree to amicable executive negotiation followed by binding arbitration in Coimbatore, Tamil Nadu, conducted in English.',
    },
    {
      num: 23,
      title: 'Bilateral Digital Execution & Signatures',
      summary: 'Cryptographic execution by authorized representatives of both parties.',
      content: 'By digitally signing below, the parties agree that electronic signatures, timestamped audit logs, and cryptographic SHA-256 digests carry the full legal validity of physical ink signatures under the Information Technology Act, 2000.',
    },
  ];

  const handleSignSow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToAllTerms || !agreedToIpTerms || !agreedToPaymentTerms || !signerName.trim()) {
      setErrorMessage('Please confirm all contractual covenants and provide your legal signatory name.');
      return;
    }

    setIsSigning(true);
    setErrorMessage(null);

    try {
      const now = new Date().toISOString();
      const res = await fetch(`/api/engagements/${engagementRef}/stages/sow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign_sow',
          payload: {
            signerName: signerName.trim(),
            signerTitle: signerTitle.trim(),
            signerEntity: signerEntity.trim(),
            contactEmail: contactEmail.trim().toLowerCase(),
            contractRef: sowMeta.contractRef,
            contractVersion: sowMeta.version,
            signedAt: now,
            agreedClausesCount: 23,
            clientSignatureConfirmed: true,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute Statement of Work');
      }

      setIsSigned(true);
      setSignedTimestamp(now);
      setAuditHash(data.auditHash);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error executing SOW');
    } finally {
      setIsSigning(false);
    }
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/sow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask_question',
          payload: {
            chapterNumber: questionChapter,
            questionText: questionText.trim(),
            askedBy: signerName,
            contactEmail,
            askedAt: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit question');
      }
      setQuestionSuccess(true);
      setTimeout(() => setShowQuestionModal(false), 2000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error sending inquiry');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Document Control Header */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded">
                STAGE 05
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                {sowMeta.contractRef}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {sowMeta.version}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2545]">
              Statement of Work & Master Service Agreement
            </h1>
            <p className="text-xs text-[#52677C]">
              Bilateral Engineering Contract between <strong className="text-slate-800">{sowMeta.provider.legalName}</strong> and <strong className="text-slate-800">{sowMeta.client.legalName}</strong>
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end justify-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Contract Total (Incl. 18% GST)
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B2545] mt-0.5">
              {sowMeta.commercial.total}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1">
              Two 50% Milestones: {sowMeta.commercial.financials.depositFormatted} each
            </span>
          </div>
        </div>

        {/* Legal Identity Verification Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-[#0B2545] block">Service Provider Details</span>
            <div className="text-slate-700 space-y-0.5 text-[11px]">
              <div><strong>{sowMeta.provider.legalName}</strong></div>
              <div>MSME Udyam: <span className="font-mono text-[#1565C0] font-semibold">{sowMeta.provider.msmeUdyam}</span></div>
              <div>Registered: {sowMeta.provider.registeredAddress}</div>
              <div>Signatory: {sowMeta.provider.officialSignatory}</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-[#0B2545] block">Client Entity Details</span>
            <div className="text-slate-700 space-y-0.5 text-[11px]">
              <div><strong>{sowMeta.client.legalName}</strong></div>
              <div>Authorized Signatory: <strong>{sowMeta.client.primaryContact}</strong></div>
              <div>Official Email: {sowMeta.client.contactEmail}</div>
              <div>Jurisdiction: {sowMeta.governingLaw}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 23 Chapters Accordion Viewer */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B2545]">
              Master Agreement Chapters (Complete 23-Section Contract)
            </h2>
            <p className="text-xs text-[#52677C] mt-0.5">
              Review each chapter of the Statement of Work prior to bilateral execution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedChapter(expandedChapter === 'all' ? 1 : 'all')}
              className="text-xs font-semibold text-[#1565C0] hover:underline"
            >
              {expandedChapter === 'all' ? 'Collapse All' : 'Expand All'}
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="text-xs font-semibold text-slate-700 hover:text-[#1565C0]"
            >
              Ask Question on SOW →
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sowChapters.map((ch) => {
            const isExpanded = expandedChapter === 'all' || expandedChapter === ch.num;
            return (
              <div
                key={ch.num}
                className="border border-slate-200/90 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedChapter(isExpanded ? 0 : ch.num)}
                  className="w-full text-left p-4 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {ch.num < 10 ? `0${ch.num}` : ch.num}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-[#0B2545] block">{ch.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{ch.summary}</span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm font-bold shrink-0">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-700 space-y-2">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      Plain English Context: {ch.summary}
                    </div>
                    <div className="whitespace-pre-line leading-relaxed bg-slate-50/60 p-3.5 rounded-lg border border-slate-100 font-sans">
                      {ch.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Chapter 23: Digital Execution & Signatures Block */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="font-mono text-xs font-bold text-[#1565C0]">CHAPTER 23</span>
          <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">
            Authorization & Bilateral Execution Block
          </h2>
          <p className="text-xs text-[#52677C]">
            Electronic signature execution with SHA-256 cryptographic audit verification.
          </p>
        </div>

        {isSigned ? (
          <div className="space-y-6">
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 sm:p-8 text-xs text-[#065F46] space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#065F46] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  ✓
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#065F46]">
                    Statement of Work Formally Executed & Countersigned
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    This contract is active and legally binding upon both parties under the Information Technology Act, 2000.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/90 border border-emerald-200 rounded-xl p-4 font-mono text-[11px] text-slate-800">
                <div className="space-y-1">
                  <div className="font-bold text-[#0B2545]">Client Authorized Signatory:</div>
                  <div>Name: <strong>{signerName}</strong></div>
                  <div>Title: {signerTitle}</div>
                  <div>Entity: {signerEntity}</div>
                  <div>Signed UTC: {signedTimestamp || new Date().toISOString()}</div>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-[#0B2545]">LIT Countersignature:</div>
                  <div>Name: <strong>S Vikash</strong></div>
                  <div>Title: Founder & Principal Architect</div>
                  <div>Entity: LOGIC INTELLIGENCE TECHNOLOGIES</div>
                  <div>MSME: UDYAM-TN-03-0345274</div>
                </div>

                {auditHash && (
                  <div className="sm:col-span-2 break-all pt-2 border-t border-emerald-100 text-slate-600">
                    Cryptographic Contract Digest: <strong>{auditHash}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
              <div className="text-xs text-slate-600">
                SOW execution completes prerequisite for <strong>Stage 6: Initial Payment</strong>.
              </div>
              <Link
                href={`/engagement/${engagementRef}/initial-invoice`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Proceed to Stage 6 Initial Payment & UPI QR</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignSow} className="space-y-6 text-xs">
            {/* Signatory Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-[#0B2545]">Authorized Signatory Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Designation / Title</label>
                  <input
                    type="text"
                    required
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Legal Contracting Entity</label>
                  <input
                    type="text"
                    required
                    value={signerEntity}
                    onChange={(e) => setSignerEntity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
              </div>
            </div>

            {/* Contract Covenants & Declarations */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="font-bold text-[#0B2545] block">Contractual Covenants & Legal Assent</span>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={agreedToAllTerms}
                  onChange={(e) => setAgreedToAllTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                />
                <span className="leading-relaxed">
                  I have read and agree to all 23 chapters of this Statement of Work and Master Service Agreement (LIT-01-SOW-2026-084) on behalf of <strong>{signerEntity}</strong>.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={agreedToIpTerms}
                  onChange={(e) => setAgreedToIpTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                />
                <span className="leading-relaxed">
                  I understand that intellectual property rights in the custom deliverables will transfer exclusively to {signerEntity} upon verified Stage 11 final payment settlement (Chapter 16).
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={agreedToPaymentTerms}
                  onChange={(e) => setAgreedToPaymentTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                />
                <span className="leading-relaxed">
                  I agree to the exact two-milestone payment schedule: 50% ({formatINR(1062000)}) at Stage 6, and 50% ({formatINR(1062000)}) at Stage 11 upon Delivery Acceptance (Chapter 14).
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                LIT Founder Vikash Saravanan countersignature will be appended automatically.
              </div>

              <button
                type="submit"
                disabled={isSigning || !agreedToAllTerms || !agreedToIpTerms || !agreedToPaymentTerms || !signerName.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#1565C0] disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-semibold shadow-xs transition-colors"
              >
                {isSigning ? (
                  <span>Executing Agreement...</span>
                ) : (
                  <>
                    <span>Execute Statement of Work (Digital Signature)</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SOW Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2545]">Ask Question or Request SOW Clarification</h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {questionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                Your question has been received. Our legal and engineering team will provide clarification promptly.
              </div>
            ) : (
              <form onSubmit={handleSendQuestion} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Chapter</label>
                  <select
                    value={questionChapter}
                    onChange={(e) => setQuestionChapter(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  >
                    {sowChapters.map((ch) => (
                      <option key={ch.num} value={ch.num}>
                        Chapter {ch.num < 10 ? `0${ch.num}` : ch.num}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Question or Requested Clarification</label>
                  <textarea
                    rows={4}
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Specify any questions regarding intellectual property, warranties, milestones, or liabilities..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuestion || !questionText.trim()}
                    className="bg-[#0B2545] hover:bg-[#1565C0] disabled:bg-slate-300 text-white px-5 py-2 rounded-lg font-semibold text-xs transition-colors"
                  >
                    {isSubmittingQuestion ? 'Submitting...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
