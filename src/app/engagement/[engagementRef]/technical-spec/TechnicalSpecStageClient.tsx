'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';
import { StageApprovalModal } from '@/components/shared/StageApprovalModal';

interface TechnicalSpecStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function TechnicalSpecStageClient({
  engagementRef,
  companyName,
  contactName = 'Client Representative',
  contactEmail = '',
  initialStatus = 'available',
  initialData = {},
  document,
}: TechnicalSpecStageClientProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'engineering'>('business');
  const [hasConfirmedArchitecture, setHasConfirmedArchitecture] = useState(
    ['approved', 'completed', 'signed'].includes(initialStatus)
  );
  const [isApproving, setIsApproving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Business Requirements (BR-01..BR-04)
  const businessRequirements = [
    {
      id: 'BR-01',
      title: 'Digital Client Self-Service Onboarding & Transparency',
      goal: 'Eliminate manual paperwork and provide clients with real-time audit visibility into their project stages.',
      priority: 'High',
      source: 'Client Discovery Baseline',
    },
    {
      id: 'BR-02',
      title: 'Manual UPI Dynamic Financial Settlement',
      goal: 'Enable zero-gateway-fee manual UPI payments with dynamic QR generation and Super Admin bank reconciliation.',
      priority: 'Critical',
      source: 'Financial Architecture Spec',
    },
    {
      id: 'BR-03',
      title: 'Dual-Document Automated Tax Compliance',
      goal: 'Issue immutable single-page A4 Tax Invoices and Payment Receipts with verified MSME credentials upon bank settlement.',
      priority: 'High',
      source: 'Statutory GST Compliance',
    },
    {
      id: 'BR-04',
      title: 'Zero-Password Least-Privilege Delegation',
      goal: 'Strict prohibition of raw passwords, API keys, and credentials; all access via IAM and scoped tokens.',
      priority: 'Critical',
      source: 'Enterprise Security Threat Model',
    },
  ];

  // Functional Requirements (FR-01..FR-08)
  const functionalRequirements = [
    {
      id: 'FR-01',
      title: '50-Point Enterprise Deployment Checklist Intake',
      description: 'The system shall record client selections across 50 enterprise deployment criteria with real-time tally.',
      priority: 'High',
      acRef: 'AC-01',
    },
    {
      id: 'FR-02',
      title: 'Bilateral SOW Cryptographic Digital Execution',
      description: 'The system shall compute SHA-256 digests of mutual signatures and lock contract version.',
      priority: 'High',
      acRef: 'AC-02',
    },
    {
      id: 'FR-03',
      title: 'Dynamic Correct-Amount UPI Payment QR Engine',
      description: 'The system shall generate localized UPI payment strings with exact paise amounts linked to 9342877474@ptyes.',
      priority: 'Critical',
      acRef: 'AC-03',
    },
    {
      id: 'FR-04',
      title: 'Super Admin Bank Credit Reconciliation Gate',
      description: 'The system shall restrict Stage 7 and Stage 12 progression until Super Admin enters bank credit proof.',
      priority: 'Critical',
      acRef: 'AC-04',
    },
    {
      id: 'FR-05',
      title: 'LIT-06 Controlled Change Request Engine',
      description: 'The system shall govern out-of-scope alterations with technical, schedule, and commercial impact analysis.',
      priority: 'Medium',
      acRef: 'AC-05',
    },
    {
      id: 'FR-06',
      title: 'Evidence-Backed Delivery & Tri-State Sign-Off',
      description: 'The system shall record delivery acceptance with tri-state decisions (Unconditional, Conditional, Rejected).',
      priority: 'High',
      acRef: 'AC-06',
    },
    {
      id: 'FR-07',
      title: 'Cryptographic PDF Generation & SHA-256 Storage',
      description: 'The system shall generate tamper-evident PDFs for invoices, receipts, and executed agreements.',
      priority: 'High',
      acRef: 'AC-02',
    },
    {
      id: 'FR-08',
      title: 'Role-Based Row Level Security (RLS) Isolation',
      description: 'The system shall enforce PostgreSQL tenant isolation ensuring clients can only query their own records.',
      priority: 'Critical',
      acRef: 'AC-01',
    },
  ];

  // Acceptance Criteria (AC-01..AC-06)
  const acceptanceCriteria = [
    { id: 'AC-01', rule: 'All 50 enterprise checklist items persist to PostgreSQL with zero data loss.', approver: 'Lead QA' },
    { id: 'AC-02', rule: 'Every sign-off mutation computes a verifiable 64-character hex SHA-256 digest.', approver: 'Security Architect' },
    { id: 'AC-03', rule: 'Generated UPI QR matches standard NPCI spec with exact milestone paise amount.', approver: 'Finance Lead' },
    { id: 'AC-04', rule: 'Manual reconciliation atomic RPC verifies bank statement ID before unlocking next stage.', approver: 'Super Admin' },
    { id: 'AC-05', rule: 'Change requests cannot alter approved base contract without bilateral digital assent.', approver: 'Project Lead' },
    { id: 'AC-06', rule: 'Delivery report includes verified test pass counts, commit SHA, and Lighthouse scores.', approver: 'Client Signatory' },
  ];

  // Open Decisions (OD-01..OD-02)
  const openDecisions = [
    {
      id: 'OD-01',
      title: 'Client Portal Session Inactivity Timeout',
      options: ['15 Minutes (Strict Security)', '60 Minutes (Standard Enterprise - Selected)', '24 Hours (Low Security)'],
      selected: '60 Minutes (Standard Enterprise - Selected)',
      owner: 'Client Technical Lead',
    },
    {
      id: 'OD-02',
      title: 'Transactional Email Provider Routing',
      options: ['Resend via Vercel Edge (Selected)', 'AWS SES Dedicated SMTP', 'SendGrid API'],
      selected: 'Resend via Vercel Edge (Selected)',
      owner: 'LIT Infrastructure Lead',
    },
  ];

  const handleApproveSpec = async (remarks: string) => {
    setIsApproving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/technical-spec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_spec',
          payload: {
            specificationVersion: 'v3.1 (Approved Engineering Baseline)',
            approvedByCompany: companyName,
            approvedByContact: contactName,
            approvedAt: new Date().toISOString(),
            clientRemarks: remarks.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record architecture approval.');
      }

      setAuditHash(data.auditHash);
      setHasConfirmedArchitecture(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error occurred while confirming architecture.';
      setErrorMessage(msg);
      throw err;
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef="LIT-04-Technical-Specification.pdf"
        title="LIT-04 Technical Specification Blueprint"
        description="Comprehensive 10-page engineering specification detailing system topology, RESTful APIs, PostgreSQL data models, security parameters, and deployment gates."
        documentMasterPath="/assets/docs/masters/LIT-04-Technical-Specification.pdf"
        version="v3.1 (Approved Engineering Baseline)"
        status="active"
      />

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Usability Split: Business Review vs Engineering Appendix */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] overflow-hidden shadow-xs">
        <div className="border-b border-[#DFE7EF] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              System Blueprint & Architectural Specifications
            </h3>
            <p className="text-xs text-[#52677C]">
              Reviewed technical specification for {companyName} deployment.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'business'
                  ? 'bg-white text-[#1565C0] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Business & Features Review
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('engineering')}
              className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'engineering'
                  ? 'bg-white text-[#1565C0] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Engineering Appendix (Technical)
            </button>
          </div>
        </div>

        {/* Tab 1: Business & Features Review */}
        {activeTab === 'business' && (
          <div className="p-6 sm:p-8 space-y-8">
            {/* Section A: Executive Technical Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                01. Executive Technical Summary & Scope
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Application Type</span>
                  <span className="font-semibold text-slate-800">Enterprise Web Portal & API</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Primary Edge Host</span>
                  <span className="font-semibold text-slate-800">Vercel Global Edge Network</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Database & Storage</span>
                  <span className="font-semibold text-slate-800">Supabase Managed PostgreSQL 15+</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Security Framework</span>
                  <span className="font-semibold text-slate-800">Row Level Security (RLS) + JWT</span>
                </div>
              </div>
            </div>

            {/* Section B: Business Requirements Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                02. Business Requirements Matrix (BR-01..BR-04)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-3 w-16">ID</th>
                      <th className="p-3">Requirement Title</th>
                      <th className="p-3">Business Goal</th>
                      <th className="p-3 w-20">Priority</th>
                      <th className="p-3 w-36">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {businessRequirements.map((br) => (
                      <tr key={br.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-[#1565C0]">{br.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{br.title}</td>
                        <td className="p-3 text-slate-600">{br.goal}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            br.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {br.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{br.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section C: Functional Requirements Register */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                03. Functional Requirements Register (FR-01..FR-08)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {functionalRequirements.map((fr) => (
                  <div key={fr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#1565C0]">{fr.id}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        Linked: {fr.acRef}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900">{fr.title}</h5>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{fr.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section D: Acceptance Criteria Catalog */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                04. Acceptance Criteria Catalog (AC-01..AC-06)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-3 w-16">ID</th>
                      <th className="p-3">Measurable Acceptance Rule</th>
                      <th className="p-3 w-32">Approving Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {acceptanceCriteria.map((ac) => (
                      <tr key={ac.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-[#1565C0]">{ac.id}</td>
                        <td className="p-3 text-slate-700">{ac.rule}</td>
                        <td className="p-3 font-semibold text-slate-800 text-[11px]">{ac.approver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section E: Open Business Decisions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                05. Open Architectural Decisions (OD-01..OD-02)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {openDecisions.map((od) => (
                  <div key={od.id} className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-900">{od.id}</span>
                      <span className="text-[10px] text-blue-700 font-semibold">Owner: {od.owner}</span>
                    </div>
                    <h5 className="font-bold text-slate-900">{od.title}</h5>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <span className="font-semibold block text-blue-950">Agreed Selection:</span>
                      <span className="inline-block px-2 py-1 bg-white border border-blue-300 rounded font-medium text-blue-800">
                        {od.selected}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Engineering Appendix */}
        {activeTab === 'engineering' && (
          <div className="p-6 sm:p-8 space-y-8 font-sans">
            {/* 1. Component Topology Diagram */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                Chapter 05 · Production Component Topology
              </h4>
              <div className="bg-slate-900 rounded-2xl p-6 text-white text-xs font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-300 font-bold">LIT Multi-Tenant Architecture Topology</span>
                  </div>
                  <span className="text-[11px] text-slate-500">TLS 1.3 / HTTP/3 Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-sky-400 font-bold text-[11px] mb-1">CLIENT TIER</div>
                    <div className="text-slate-300 font-sans text-xs">Next.js 15 App Router</div>
                    <div className="text-slate-500 text-[10px] mt-1">React 19 Server Components</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-sky-400 font-bold text-[11px] mb-1">EDGE GATEWAY</div>
                    <div className="text-slate-300 font-sans text-xs">Vercel Global Edge</div>
                    <div className="text-slate-500 text-[10px] mt-1">Route Handlers & SSR</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-sky-400 font-bold text-[11px] mb-1">DATA LAYER</div>
                    <div className="text-slate-300 font-sans text-xs">Supabase PostgreSQL 15</div>
                    <div className="text-slate-500 text-[10px] mt-1">Row Level Security (RLS)</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-sky-400 font-bold text-[11px] mb-1">AUDIT & VAULT</div>
                    <div className="text-slate-300 font-sans text-xs">SHA-256 Ledger & PDF</div>
                    <div className="text-slate-500 text-[10px] mt-1">Automated PITR Backups</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Database Schema & RLS Policies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                Chapter 08 · PostgreSQL Relational Schema & Row Level Security
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden font-mono">
                  <thead className="bg-slate-100 text-slate-700 font-sans font-semibold">
                    <tr>
                      <th className="p-3">Table Name</th>
                      <th className="p-3">Key Columns</th>
                      <th className="p-3">RLS Security Policy</th>
                      <th className="p-3">Backup / Retention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-900">client_engagements</td>
                      <td className="p-3 text-slate-700">id, engagement_ref, company_name, contact_email</td>
                      <td className="p-3 text-emerald-800 font-sans">Tenant isolation by auth.uid()</td>
                      <td className="p-3 font-sans text-slate-500">Continuous PITR (30 days)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-900">engagement_stages</td>
                      <td className="p-3 text-slate-700">id, engagement_id, stage_key, status, snapshot</td>
                      <td className="p-3 text-emerald-800 font-sans">Tenant read; stage actions via RPC</td>
                      <td className="p-3 font-sans text-slate-500">Continuous PITR (30 days)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-900">financial_documents</td>
                      <td className="p-3 text-slate-700">id, doc_type, document_number, sha256_hash, storage_path</td>
                      <td className="p-3 text-emerald-800 font-sans">Immutable write once, read by recipient</td>
                      <td className="p-3 font-sans text-slate-500">Permanent archival storage</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-blue-900">payment_attempts</td>
                      <td className="p-3 text-slate-700">id, utr, reported_amount_paise, status</td>
                      <td className="p-3 text-emerald-800 font-sans">Unique UTR constraint; Admin reconciliation</td>
                      <td className="p-3 font-sans text-slate-500">7-year statutory retention</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Non-Functional Performance & SLA Targets */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                Chapters 04 & 17 · Non-Functional Performance Benchmarks
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Target LCP</span>
                  <span className="text-lg font-bold text-slate-900">&lt; 1.2s</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Observed: 1.1s (Pass)</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">API Latency p95</span>
                  <span className="text-lg font-bold text-slate-900">&lt; 85ms</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Observed: 64ms (Pass)</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Uptime Target</span>
                  <span className="text-lg font-bold text-slate-900">99.9%</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Vercel Multi-Region Edge</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Accessibility</span>
                  <span className="text-lg font-bold text-slate-900">WCAG 2.1 AA</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Zero critical violations</span>
                </div>
              </div>
            </div>

            {/* 4. Document Revision History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                Chapter 22 · Official Specification Revision Log
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2.5 w-20">Version</th>
                      <th className="p-2.5 w-28">Date</th>
                      <th className="p-2.5">Description of Changes</th>
                      <th className="p-2.5 w-32">Prepared By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    <tr>
                      <td className="p-2.5 font-mono font-bold">v1.0</td>
                      <td className="p-2.5 text-slate-600">2026-10-12</td>
                      <td className="p-2.5 text-slate-700">Initial technical architecture draft from Discovery intake.</td>
                      <td className="p-2.5 text-slate-600">LIT Lead Architect</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">v2.0</td>
                      <td className="p-2.5 text-slate-600">2026-10-14</td>
                      <td className="p-2.5 text-slate-700">Incorporated manual UPI payment portal and RLS tenant model.</td>
                      <td className="p-2.5 text-slate-600">Security Team</td>
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="p-2.5 font-mono font-bold text-emerald-900">v3.1</td>
                      <td className="p-2.5 text-emerald-800">2026-10-15</td>
                      <td className="p-2.5 text-emerald-900 font-medium">Final production baseline approved for bilateral sign-off.</td>
                      <td className="p-2.5 text-emerald-800 font-semibold">Principal Architect</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Approval Footer */}
        <div className="border-t border-[#DFE7EF] p-6 sm:p-8 bg-slate-50/80">
          {hasConfirmedArchitecture ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Technical Specification Approved & Version-Locked (v3.1)</span>
              </div>
              <p className="text-xs text-emerald-700 max-w-lg mx-auto">
                Authorized approval recorded for <strong>{companyName}</strong>. The engineering team has initiated sprint execution under Stage 09.
              </p>
              {auditHash && (
                <p className="font-mono text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200 max-w-md mx-auto break-all">
                  Audit Digest: {auditHash}
                </p>
              )}
              <div className="pt-2">
                <Link
                  href={`/engagement/${engagementRef}/development`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
                >
                  <span>Proceed to Stage 09: Development & Milestones</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B2545]">
                  Authoritative Baseline Approval
                </h4>
                <p className="text-xs text-[#52677C] mt-0.5">
                  Formal sign-off locks the functional requirements (FR-01..FR-08) and component topology.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2545] text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Approve Technical Blueprint</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showConfirmModal && (
        <StageApprovalModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleApproveSpec}
          title="Confirm Technical Specification v3.1 Approval"
          stageName="Technical Specification"
          stageOrdinal={8}
          companyName={companyName}
          defaultNotes="Technical architecture, schemas, and SLA specifications approved for implementation."
          inputLabel="Approval Remarks / Architectural Notes (Optional)"
          inputPlaceholder="Add any specific rollout or staging notes..."
        />
      )}
    </div>
  );
}
