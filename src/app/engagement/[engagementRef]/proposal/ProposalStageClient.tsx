'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProposalStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  initialStatus?: string;
}

export default function ProposalStageClient({
  engagementRef,
  companyName,
  contactName,
  initialStatus = 'available',
}: ProposalStageClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('exec-summary');
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationTopic, setClarificationTopic] = useState('Scope & Deliverables');
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [clarificationSuccess, setClarificationSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authoritative Commercial Quotation Data (LIT-02 Master Specification)
  const proposalMeta = {
    reference: 'LIT-PROP-2026-084',
    version: 'v1.0 (LIT-Approved Baseline)',
    issueDate: '14 October 2026',
    validUntil: '14 November 2026',
    classification: 'Client Confidential · Commercial in Confidence',
    preparedBy: 'Vikash Saravanan',
    designation: 'Principal Systems Architect & Founder',
    clientEntity: companyName,
    clientContact: contactName,
  };

  const deliverables = [
    {
      id: 'D-01',
      title: '50-Point Enterprise Architectural Audit & Compliance Alignment',
      description: 'Comprehensive assessment of cloud infrastructure, security topology, TLS 1.3, PostgreSQL RLS, and HIPAA/data minimization compliance rules.',
      format: 'Formal Verification Report & Audit Matrix (PDF)',
      acceptance: 'AC-01: Zero failing security checks; signed compliance statement',
      owner: 'LIT Architecture Team',
      status: 'Ready for Review',
    },
    {
      id: 'D-02',
      title: 'Production Next.js 15 Web Application + Custom REST Middleware',
      description: 'Full-stack responsive web application with React Server Components, TypeScript, Tailwind design tokens, and modular domain route handlers.',
      format: 'Production GitHub Repository & Vercel Edge Deployment',
      acceptance: 'AC-02: Lighthouse score >= 90; edge TTFB <= 50ms; zero console errors',
      owner: 'LIT Frontend & Edge Team',
      status: 'Ready for Review',
    },
    {
      id: 'D-03',
      title: 'Supabase Database Schema with Strict RLS & Immutable Audit Trails',
      description: 'PostgreSQL 15 schema featuring Row Level Security (RLS), multi-tenant isolation, automated migrations, and SHA-256 cryptographic audit ledgers.',
      format: 'Supabase Migration Scripts + Verification Test Suite',
      acceptance: 'AC-03: 100% RLS coverage; anon client unauthorized access blocked',
      owner: 'LIT Database & Security Team',
      status: 'Ready for Review',
    },
    {
      id: 'D-04',
      title: 'Zero-Gateway Audited Manual UPI Payment Clearance Architecture',
      description: 'Direct UPI payment verification suite with dynamic amount-specific QR generation, UTR reporting, Super Admin bank reconciliation, and zero third-party gateway cuts.',
      format: 'Payment Clearance Module + Admin Reconciliation Portal',
      acceptance: 'AC-04: UTR uniqueness constraint; verified bank matching workflow',
      owner: 'LIT Financial Systems Team',
      status: 'Ready for Review',
    },
    {
      id: 'D-05',
      title: 'AI Assistant Pipeline with Groq LPU + Domain-Isolated RAG Embeddings',
      description: 'Bespoke conversational AI pipeline utilizing Groq LPU high-speed inference, FastEmbed bge-small-en-v1.5 embeddings, and domain-isolated knowledge retrieval.',
      format: 'Edge AI Service + Knowledge Ingestion CLI Pipeline',
      acceptance: 'AC-05: Zero unauthenticated PHI leakage; p95 latency <= 150ms',
      owner: 'LIT AI & Systems Team',
      status: 'Ready for Review',
    },
    {
      id: 'D-06',
      title: 'Comprehensive Handover Manifest, Transfer Runbooks & 90-Day SLA Support',
      description: 'Complete intellectual property transfer package, deployment runbooks, developer setup documentation, and 90-day comprehensive post-launch warranty.',
      format: 'Transfer Manifest + Signed IP Certificate + Runbooks',
      acceptance: 'AC-06: Verified GitHub org transfer; bilateral handover sign-off',
      owner: 'LIT Delivery & Operations Team',
      status: 'Ready for Review',
    },
  ];

  const commercialItems = [
    {
      item: 'Core Full-Stack Web Application & 13-Stage Portal Engine',
      description: 'Next.js 15, App Router, responsive multi-device design, state management, and real-time client engagement portal.',
      qty: 1,
      unitPrice: 850000,
    },
    {
      item: 'Supabase Security Hardening, Relational Schema & Cryptographic Ledgers',
      description: 'PostgreSQL database architecture, 100% RLS policy enforcement, automated backup triggers, and SHA-256 mutation digests.',
      qty: 1,
      unitPrice: 350000,
    },
    {
      item: 'Audited Direct UPI Payment Engine & Super Admin Reconciliation Suite',
      description: 'Zero-PSP manual UPI QR generator, client billing intake gate, duplicate UTR prevention, and dual-document (Invoice/Receipt) PDF engine.',
      qty: 1,
      unitPrice: 250000,
    },
    {
      item: 'Multi-Corpus Knowledge Base & Domain-Isolated RAG Assistant Engine',
      description: 'FastEmbed vector embeddings, Groq LPU integration, SQLite BM25 retrieval, and zero-PHI privacy enforcement guardrails.',
      qty: 1,
      unitPrice: 200000,
    },
    {
      item: 'Enterprise CI/CD Pipelines, Operating Runbooks & 90-Day SLA Warranty',
      description: 'Automated GitHub Actions workflows, staging/production environments, developer runbooks, and 90 days of priority defect remediation.',
      qty: 1,
      unitPrice: 150000,
    },
  ];

  const subtotalPaise = commercialItems.reduce((acc, curr) => acc + curr.unitPrice, 0);
  const discountPaise = couponApplied ? 50000 : 0; // ₹50,000 promotional credit if coupon applied
  const netSubtotalPaise = subtotalPaise - discountPaise;
  const gstPaise = Math.round(netSubtotalPaise * 0.18);
  const totalPayablePaise = netSubtotalPaise + gstPaise;
  const milestoneAmountPaise = Math.round(totalPayablePaise / 2);

  const formatINR = (paiseOrRupees: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paiseOrRupees);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMessage(null);
    const code = couponCode.trim().toUpperCase();
    if (code === 'WAKEUPINDIA' || code === 'LIT2026' || code === 'FOUNDER50K') {
      setCouponApplied(true);
      setCouponMessage(`Promo coupon "${code}" applied successfully! ₹50,000 launch incentive deducted.`);
    } else {
      setCouponMessage('Invalid or expired coupon code. Standard pricing applies.');
    }
  };

  const handleSubmitClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationNotes.trim()) return;

    setIsSubmittingClarification(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_revision',
          payload: {
            topic: clarificationTopic,
            notes: clarificationNotes,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit clarification request');
      }

      setClarificationSuccess(true);
      setStatusMessage('Your clarification request has been routed to Principal Architect Vikash Saravanan.');
      setTimeout(() => setShowClarificationModal(false), 2000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting clarification request');
    } finally {
      setIsSubmittingClarification(false);
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
                {proposalMeta.reference}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {proposalMeta.version}
              </span>
              <span className="text-xs text-slate-500">
                Issued: {proposalMeta.issueDate} · Valid until: {proposalMeta.validUntil}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2545]">
              Project Proposal & Commercial Quotation
            </h1>
            <p className="text-xs text-[#52677C]">
              Bespoke Enterprise Systems Engineering Proposal for <strong className="text-slate-800">{companyName}</strong> (Attn: {contactName})
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end justify-center bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Total Contract Investment (Incl. 18% GST)
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B2545] mt-0.5">
              {formatINR(totalPayablePaise)}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1">
              Two 50% Milestones: {formatINR(milestoneAmountPaise)} each
            </span>
          </div>
        </div>

        {/* Chapter Navigation Bar */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap min-w-max">
            {[
              { id: 'exec-summary', label: '01 Exec Summary' },
              { id: 'challenge', label: '02 Client Challenge' },
              { id: 'solution', label: '03 LIT Solution' },
              { id: 'architecture', label: '04 Architecture' },
              { id: 'features', label: '05 Capabilities' },
              { id: 'deliverables', label: '06 Deliverables' },
              { id: 'tech-stack', label: '07 Tech Stack' },
              { id: 'roadmap', label: '08 Plan & 09 Timeline' },
              { id: 'commercial', label: '10 Commercial Quote' },
              { id: 'milestones', label: '11 Milestones' },
              { id: 'assumptions', label: '12 Assumptions & 13 Add-ons' },
              { id: 'next-steps', label: '14 Next Steps' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  activeSection === tab.id
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter 01: Executive Summary */}
      {(activeSection === 'exec-summary' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 01</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Executive Summary & Engagement Vision</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">LIT-02 pp. 1–2</span>
          </div>

          <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700 space-y-3">
            <p>
              Logic Intelligence Technologies (LIT) is pleased to submit this comprehensive Project Proposal and Commercial Quotation to <strong>{companyName}</strong>. Following our review of your Stage 1 Enterprise Deployment Checklist and Stage 2 Discovery inputs, this document formalizes our architectural approach, work breakdown structure, technology stack, and commercial terms.
            </p>
            <p>
              Our mandate is to deliver an enterprise-grade, high-performance web platform built on modern Next.js 15, PostgreSQL (Supabase) with Row-Level Security, an audited direct UPI payment settlement system, and domain-isolated artificial intelligence capabilities. This proposal represents a fixed-price, milestone-governed engineering commitment with zero hidden fees.
            </p>
          </div>

          {/* At a Glance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Solution Overview</span>
              <span className="text-xs font-bold text-[#0B2545] block">Next.js 15 + Supabase RLS + AI Assistant</span>
              <span className="text-[11px] text-slate-600">Enterprise Multi-Site Architecture</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Delivery Timeline</span>
              <span className="text-xs font-bold text-[#0B2545] block">10 Weeks (5 Phases)</span>
              <span className="text-[11px] text-slate-600">From Stage 6 Initial Settlement</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Investment</span>
              <span className="text-xs font-bold text-[#0B2545] block">{formatINR(totalPayablePaise)}</span>
              <span className="text-[11px] text-slate-600">Incl. 18% GST (Two 50% Milestones)</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Proposal Expiration</span>
              <span className="text-xs font-bold text-[#0B2545] block">{proposalMeta.validUntil}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Price Guaranteed 30 Days</span>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 02: Client Challenge */}
      {(activeSection === 'challenge' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 02</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">The Client Challenge & Operational Needs</h2>
            </div>
            <button
              onClick={() => setShowClarificationModal(true)}
              className="text-xs font-semibold text-[#1565C0] hover:underline"
            >
              Request Clarification →
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            Based on our technical intake and requirements analysis with {contactName}, {companyName} requires a robust, scalable digital platform that resolves four core business bottlenecks:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <span className="font-bold text-[#0B2545] block">1. Legacy Fragmentation & Latency</span>
              <p className="text-slate-600 leading-relaxed">
                Existing digital workflows rely on disparate tools with no unified database, leading to data synchronization bottlenecks, slow response times, and poor multi-device usability.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <span className="font-bold text-[#0B2545] block">2. Security & Compliance Deficits</span>
              <p className="text-slate-600 leading-relaxed">
                Need for strict credential-free delegated access, database-enforced Row Level Security (RLS), and zero-unauthenticated exposure of sensitive client or patient records.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <span className="font-bold text-[#0B2545] block">3. Opaque Payment Gateway Intermediaries</span>
              <p className="text-slate-600 leading-relaxed">
                Third-party payment gateways incur high transaction surcharges (2–3%), unpredictable settlement holds, and account freeze risks. A direct, bank-verified UPI settlement architecture is needed.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <span className="font-bold text-[#0B2545] block">4. Demand for AI-Driven Intelligent Support</span>
              <p className="text-slate-600 leading-relaxed">
                Customers require immediate, accurate answers to technical and operational queries without exposing private internal documentation or patient data to public AI training loops.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 03 & 04: Solution & Architecture */}
      {(activeSection === 'solution' || activeSection === 'architecture' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 03 & 04</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Proposed LIT Solution & System Architecture</h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ● Approved Architecture Baseline
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            LIT proposes an enterprise full-stack web architecture designed for ultra-low latency, bank-grade data security, and verifiable operational audit trails:
          </p>

          {/* Architecture Topology Card */}
          <div className="bg-[#0B2545] text-white rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#1FA9A2]">
                  LIT Production Architecture Specification
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Multi-Tier Distributed Topology (Next.js 15 · Supabase · Vercel Edge)
                </h3>
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded text-slate-300">
                SSL/TLS 1.3 · HTTP/3 Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#1FA9A2] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#1FA9A2]" />
                  Edge & Application Tier
                </div>
                <ul className="text-slate-300 space-y-1 text-[11px]">
                  <li>• Vercel Global Anycast Edge CDN</li>
                  <li>• Next.js 15 App Router & React Server Components</li>
                  <li>• Route Handlers & Server Actions</li>
                  <li>• Brotli Compression & Security Headers</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#1565C0] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
                  Database & Auth Tier
                </div>
                <ul className="text-slate-300 space-y-1 text-[11px]">
                  <li>• Supabase PostgreSQL 15 Engine</li>
                  <li>• 100% Strict Row Level Security (RLS)</li>
                  <li>• Multi-Tenant Isolation & Role Policies</li>
                  <li>• Automated Daily Backups with PITR</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  AI & Financial Tier
                </div>
                <ul className="text-slate-300 space-y-1 text-[11px]">
                  <li>• Groq LPU Ultra-Low Latency Inference</li>
                  <li>• FastEmbed bge-small-en-v1.5 Embeddings</li>
                  <li>• Direct Manual UPI Clearance (9342877474@ptyes)</li>
                  <li>• Cryptographic SHA-256 Audit Digests</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 05: Features & Capabilities */}
      {(activeSection === 'features' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 05</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Features & Capabilities Matrix</h2>
            </div>
            <span className="text-xs text-slate-500">6 Core Engineering Modules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">1. 13-Stage Client Engagement Portal</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>What it does for you:</strong> Guides your team seamlessly from initial scoping to production handover with automated draft saving, milestone locks, and bilateral digital execution.
              </p>
              <div className="text-[10px] font-mono text-[#1565C0]">Acceptance: Sequential stage gating with SHA-256 integrity</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">2. Direct Audited UPI Payment Portal</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>What it does for you:</strong> Eliminates payment gateway transaction charges via dynamic UPI QR generation, UTR reference tracking, and Super Admin bank-credit verification.
              </p>
              <div className="text-[10px] font-mono text-[#1565C0]">Acceptance: Zero-PSP fraud prevention and UTR unique constraint</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">3. Dual-Document Tax Invoice & Receipt Engine</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>What it does for you:</strong> Automatically issues single-page clean A4 Tax Invoices and Payment Receipts matching statutory GST and MSME Udyam (UDYAM-TN-03-0345274) standards.
              </p>
              <div className="text-[10px] font-mono text-[#1565C0]">Acceptance: Single-page geometry with cryptographic PDF checksum</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">4. Multi-Corpus Knowledge Base & AI Assistant</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>What it does for you:</strong> Ingests company documentation into high-speed vector indices, delivering instant technical answers with zero hallucination and zero PHI risk.
              </p>
              <div className="text-[10px] font-mono text-[#1565C0]">Acceptance: 100% eval suite pass rate across 155+ test cases</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">5. PostgreSQL Row-Level Security & Multi-Tenancy</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>What it does for you:</strong> Enforces data isolation directly at the database engine tier, ensuring clients and staff can only access authorized resources.
              </p>
              <div className="text-[10px] font-mono text-[#1565C0]">Acceptance: 100% test pass on public anon query rejection</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">6. Automated CI/CD & Production Handover Package</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>What it does for you:</strong> Full GitHub repository transfer, Vercel team delegation, operational runbooks, and a 90-day comprehensive post-launch warranty.
              </p>
              <div className="text-[10px] font-mono text-[#1565C0]">Acceptance: Formal IP assignment and bilateral sign-off</div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 06: Deliverables */}
      {(activeSection === 'deliverables' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 06</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Agreed Contractual Deliverables (D-01 to D-06)</h2>
            </div>
            <span className="text-xs text-slate-500">Traceable to Statement of Work</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-16">ID</th>
                  <th className="py-3 px-3">Deliverable & Description</th>
                  <th className="py-3 px-3">Format / Artifact</th>
                  <th className="py-3 px-3">Acceptance Criteria</th>
                  <th className="py-3 px-3 w-28">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliverables.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-[#1565C0] align-top">{d.id}</td>
                    <td className="py-3 px-3 space-y-1 align-top">
                      <div className="font-bold text-[#0B2545]">{d.title}</div>
                      <div className="text-slate-600 text-[11px] leading-relaxed">{d.description}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium text-[11px] align-top">{d.format}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] align-top">{d.acceptance}</td>
                    <td className="py-3 px-3 align-top">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chapter 07: Tech Stack */}
      {(activeSection === 'tech-stack' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 07</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Enterprise Technology Stack</h2>
            </div>
            <span className="text-xs text-slate-500">Production-Grade Infrastructure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">Frontend Framework</span>
              <div className="text-slate-700 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-900">• Next.js 15 (App Router)</div>
                <div>• React 19 Server Components</div>
                <div>• TypeScript (Strict Mode)</div>
                <div>• Tailwind CSS & Mobile Responsive</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">Backend & API Layer</span>
              <div className="text-slate-700 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-900">• Node.js 22 LTS & Vercel Edge Runtime</div>
                <div>• Next.js Server Actions & Route Handlers</div>
                <div>• Zod Schema Validation</div>
                <div>• Cryptographic SHA-256 Digest Engine</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">Database & Security</span>
              <div className="text-slate-700 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-900">• Supabase PostgreSQL 15</div>
                <div>• Row-Level Security (RLS) Policies</div>
                <div>• Automated Daily Point-in-Time Recovery</div>
                <div>• Append-Only Audit Logs</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">Hosting & CDN</span>
              <div className="text-slate-700 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-900">• Vercel Global Edge Network</div>
                <div>• Cloudflare Enterprise DNS & WAF</div>
                <div>• HTTP/3 & TLS 1.3 Strict HTTPS</div>
                <div>• Automated Deploy Previews</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">AI & Intelligence</span>
              <div className="text-slate-700 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-900">• Groq LPU High-Speed Inference</div>
                <div>• FastEmbed bge-small-en-v1.5 Vectors</div>
                <div>• Domain-Isolated SQLite Corpus</div>
                <div>• Zero-PHI Privacy Enforcement</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="font-bold text-[#0B2545] block">CI/CD & Code Quality</span>
              <div className="text-slate-700 space-y-1 text-[11px]">
                <div className="font-semibold text-slate-900">• GitHub Actions Automated Pipeline</div>
                <div>• Vitest Unit & Integration Tests</div>
                <div>• ESLint & TypeScript Compilation Gates</div>
                <div>• Dependabot Security Vulnerability Scanning</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 08 & 09: Implementation Plan & Timeline */}
      {(activeSection === 'roadmap' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 08 & 09</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Implementation Plan & 10-Week Delivery Roadmap</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">5 Structured Phases</span>
          </div>

          <div className="space-y-3">
            {[
              {
                phase: 'Phase 1 · Weeks 1–2',
                title: 'Architecture Audit, Wireframing & Scope Baselining',
                desc: 'Formalize 50-point checklist scope, conduct technical discovery session, finalize schema models, and set up GitHub repository structure.',
                gate: 'Gate 1: Statement of Work (Stage 5) & Initial Payment (Stage 6) cleared.',
              },
              {
                phase: 'Phase 2 · Weeks 3–4',
                title: 'Supabase PostgreSQL Migration & Core Domain Engine',
                desc: 'Implement relational database tables, enforce 100% Row-Level Security, configure auth sessions, and scaffold Next.js App Router layout.',
                gate: 'Gate 2: Technical Specification (Stage 8) approved by client.',
              },
              {
                phase: 'Phase 3 · Weeks 5–6',
                title: 'Client Engagement Portal & PDF Document Generation Engine',
                desc: 'Build 13-stage progression workflows, A4 Tax Invoice / Receipt single-page generators, and interactive checklist interfaces.',
                gate: 'Gate 3: Mid-sprint progress review and demo deployment.',
              },
              {
                phase: 'Phase 4 · Weeks 7–8',
                title: 'Direct UPI Payment Engine & AI Assistant Integration',
                desc: 'Implement dynamic UPI QR code generator, UTR duplicate prevention, Super Admin reconciliation portal, and Groq LPU RAG assistant.',
                gate: 'Gate 4: Integration testing and compliance audit complete.',
              },
              {
                phase: 'Phase 5 · Weeks 9–10',
                title: 'End-to-End QA, Security Audit & Production Launch',
                desc: 'Execute full automated test suite, mobile responsive verification, Lighthouse latency tuning, and formal handover to production.',
                gate: 'Gate 5: Delivery Acceptance (Stage 10) and Final Settlement (Stage 11).',
              },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-mono text-[11px] font-bold text-[#1565C0] block">{p.phase}</span>
                  <div className="font-bold text-[#0B2545] text-sm">{p.title}</div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{p.desc}</p>
                </div>
                <div className="md:w-64 shrink-0 bg-white border border-slate-200 rounded-lg p-2.5 text-[10px] text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Prerequisite Gate:</span>
                  {p.gate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter 10: Commercial Proposal */}
      {(activeSection === 'commercial' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 10</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Commercial Quotation & Financial Breakdown</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">Fixed-Price Engineering Contract</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3">Scope Item & Description</th>
                  <th className="py-3 px-3 text-center w-16">Qty</th>
                  <th className="py-3 px-3 text-right w-36">Rate (INR)</th>
                  <th className="py-3 px-3 text-right w-36">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commercialItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 space-y-0.5">
                      <div className="font-bold text-[#0B2545]">{item.item}</div>
                      <div className="text-slate-600 text-[11px]">{item.description}</div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 font-medium">{item.qty}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{formatINR(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0B2545]">{formatINR(item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 font-medium text-slate-700">
                  <td colSpan={3} className="py-2.5 px-3 text-right">Subtotal Base Amount:</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatINR(subtotalPaise)}</td>
                </tr>
                {couponApplied && (
                  <tr className="bg-emerald-50/50 font-medium text-emerald-800">
                    <td colSpan={3} className="py-2.5 px-3 text-right">
                      Promotional Discount ({couponCode}):
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">- {formatINR(discountPaise)}</td>
                  </tr>
                )}
                <tr className="font-medium text-slate-700">
                  <td colSpan={3} className="py-2.5 px-3 text-right">Goods & Services Tax (GST @ 18%):</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatINR(gstPaise)}</td>
                </tr>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                  <td colSpan={3} className="py-3 px-3 text-right text-sm">Total Contract Value (INR):</td>
                  <td className="py-3 px-3 text-right font-mono text-base font-black text-[#0B2545]">{formatINR(totalPayablePaise)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Coupon Input Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0B2545] block">Promotional Launch Coupon</span>
              <p className="text-[11px] text-slate-600">
                Have an authorized LIT founder promo code or enterprise partnership voucher?
              </p>
            </div>
            <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
              <button
                type="submit"
                disabled={couponApplied || !couponCode.trim()}
                className="bg-[#0B2545] hover:bg-[#1565C0] disabled:bg-slate-300 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </form>
          </div>
          {couponMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium ${couponApplied ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              {couponMessage}
            </div>
          )}
        </div>
      )}

      {/* Chapter 11: Payment Milestones */}
      {(activeSection === 'milestones' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 11</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Milestone Payment Schedule (Strictly Two 50% Milestones)</h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              50% Initial · 50% Final
            </span>
          </div>

          <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-xl p-4 text-xs text-[#0B2545] space-y-1">
            <span className="font-bold block">Policy Notice: Exact Two-Milestone Schedule</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              In accordance with LIT corporate billing policy, all enterprise projects are structured into strictly two 50% installments. Stage 3 does <strong>not</strong> contain an early payment button. Payments are processed exclusively at <strong>Stage 6</strong> (Initial Payment) and <strong>Stage 11</strong> (Final Settlement) upon verified prerequisite execution.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3">Milestone</th>
                  <th className="py-3 px-3">Share</th>
                  <th className="py-3 px-3">Amount (INR)</th>
                  <th className="py-3 px-3">Execution Trigger Event</th>
                  <th className="py-3 px-3">Associated Portal Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0B2545]">Milestone 1: Initial Deposit</td>
                  <td className="py-3 px-3 font-semibold text-[#1565C0]">50.0%</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{formatINR(milestoneAmountPaise)}</td>
                  <td className="py-3 px-3 text-slate-600">Execution of Statement of Work (Stage 5)</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700">
                      Stage 6: Initial Payment
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0B2545]">Milestone 2: Final Settlement</td>
                  <td className="py-3 px-3 font-semibold text-[#1565C0]">50.0%</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{formatINR(milestoneAmountPaise)}</td>
                  <td className="py-3 px-3 text-slate-600">Delivery Acceptance Sign-off & QA Verification (Stage 10)</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 text-slate-700">
                      Stage 11: Final Payment
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chapter 12 & 13: Assumptions & Add-ons */}
      {(activeSection === 'assumptions' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 12 & 13</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Assumptions, Boundaries & Optional Add-ons</h2>
            </div>
            <span className="text-xs text-slate-500">Scope Clarity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className="font-bold text-[#0B2545]">Contractual Assumptions & Exclusions</h3>
              <ul className="space-y-2 text-slate-600 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Client provides timely review feedback within 3 business days of milestone releases.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Third-party provider hosting fees (e.g. Vercel team seat, Supabase DB tier) are billed directly to client.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  All changes to scoped deliverables (D-01 to D-06) must be governed via Stage 9 Change Request (LIT-06).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  Excludes uncontracted native mobile app development unless commissioned via separate work order.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-[#0B2545]">Optional Enterprise Add-ons (Not Included in Base)</h3>
              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0B2545] block">24/7 Dedicated Emergency On-Call SLA</span>
                    <span className="text-slate-500">15-minute response target for critical incidents</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">₹45,000 / mo</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0B2545] block">Multi-Region Read Replica Database Clones</span>
                    <span className="text-slate-500">Global latency optimization for US / EU regions</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">₹75,000 / one-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 14: Next Steps & Navigation Action */}
      {(activeSection === 'next-steps' || activeSection === 'all') && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#1565C0]">CHAPTER 14</span>
              <h2 className="text-lg font-bold text-[#0B2545] mt-0.5">Next Steps & Engagement Progression</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">Roadmap to Execution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border-2 border-[#1565C0] bg-blue-50/50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#1565C0]">STEP 1 (CURRENT)</span>
              <span className="font-bold text-[#0B2545] block">Review Proposal</span>
              <p className="text-slate-600 text-[11px]">Thoroughly examine scope, tech stack, and commercial breakdown.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-slate-400">STEP 2 (STAGE 4)</span>
              <span className="font-bold text-slate-700 block">Formal Acceptance</span>
              <p className="text-slate-500 text-[11px]">Sign proposal assent or request formal scope adjustments.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-slate-400">STEP 3 (STAGE 5)</span>
              <span className="font-bold text-slate-700 block">Execute SOW</span>
              <p className="text-slate-500 text-[11px]">Digitally sign the 23-chapter legal Statement of Work.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-slate-400">STEP 4 (STAGE 6)</span>
              <span className="font-bold text-slate-700 block">Initial 50% Payment</span>
              <p className="text-slate-500 text-[11px]">Pay initial deposit via dynamic UPI QR code.</p>
            </div>
          </div>

          {statusMessage && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowClarificationModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Request Clarification or Modification</span>
            </button>

            <Link
              href={`/engagement/${engagementRef}/acceptance`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Proceed to Formal Proposal Acceptance (Stage 4)</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Clarification Request Modal */}
      {showClarificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2545]">Request Proposal Clarification</h3>
              <button
                onClick={() => setShowClarificationModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {clarificationSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                Clarification request received. Our Principal Architect will review and update the proposal accordingly.
              </div>
            ) : (
              <form onSubmit={handleSubmitClarification} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic / Area of Question</label>
                  <select
                    value={clarificationTopic}
                    onChange={(e) => setClarificationTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  >
                    <option value="Scope & Deliverables">Scope & Deliverables</option>
                    <option value="Commercial Terms & Pricing">Commercial Terms & Pricing</option>
                    <option value="Architecture & Technology">Architecture & Technology</option>
                    <option value="Timeline & Milestones">Timeline & Milestones</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Question or Adjustment Request</label>
                  <textarea
                    rows={4}
                    required
                    value={clarificationNotes}
                    onChange={(e) => setClarificationNotes(e.target.value)}
                    placeholder="Specify any adjustments to line items, deliverables, or questions..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClarificationModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClarification || !clarificationNotes.trim()}
                    className="bg-[#0B2545] hover:bg-[#1565C0] disabled:bg-slate-300 text-white px-5 py-2 rounded-lg font-semibold text-xs transition-colors"
                  >
                    {isSubmittingClarification ? 'Submitting...' : 'Send to LIT Architects'}
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
