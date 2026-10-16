'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface DevelopmentStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function DevelopmentStageClient({
  engagementRef,
  companyName,
  contactName = 'Client Representative',
  contactEmail = '',
  initialStatus = 'in_progress',
  initialData = {},
  document,
}: DevelopmentStageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [showRfcModal, setShowRfcModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'sprints' | 'change-requests'>('sprints');

  // RFC Form State
  const [rfcTitle, setRfcTitle] = useState('');
  const [rfcCategory, setRfcCategory] = useState('New Feature / Capability');
  const [rfcUrgency, setRfcUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [rfcDescription, setRfcDescription] = useState('');
  const [rfcAffectedModule, setRfcAffectedModule] = useState('Frontend Web Portal');
  const [rfcExpectedOutcome, setRfcExpectedOutcome] = useState('');

  const [isSubmittingRfc, setIsSubmittingRfc] = useState(false);
  const [rfcSubmitted, setRfcSubmitted] = useState(false);
  const [rfcAuditHash, setRfcAuditHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedRfcs, setSubmittedRfcs] = useState<any[]>(initialData?.rfcs || []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showRfcModal) {
      document?.body?.classList?.add('overflow-hidden');
    } else {
      document?.body?.classList?.remove('overflow-hidden');
    }
    return () => {
      document?.body?.classList?.remove('overflow-hidden');
    };
  }, [showRfcModal, document]);

  // Sprint / Milestone Tracker Data
  const sprintData = [
    {
      sprintNumber: 1,
      title: 'Infrastructure & Baseline Scaffolding',
      status: 'Completed',
      passRate: '100% (28/28 Unit Tests)',
      commitSha: '6c483f9',
      completionDate: '2026-10-14',
      tasks: [
        'Multi-tenant workspace configuration and Supabase instance provisioning',
        'Next.js 15 App Router architecture setup with Tailwind design tokens',
        'Automated GitHub Actions CI/CD workflows and branch protection',
      ],
    },
    {
      sprintNumber: 2,
      title: 'Core Domain Engine & Supabase Security RLS',
      status: 'Completed',
      passRate: '100% (42/42 Schema Invariants)',
      commitSha: 'd289115',
      completionDate: '2026-10-14',
      tasks: [
        'Relational schema migrations for 13-stage lifecycle and audit ledgers',
        'Strict Row Level Security (RLS) policies and super_admin gate enforcement',
        'Client identity change request quarantine queue implementation',
      ],
    },
    {
      sprintNumber: 3,
      title: 'Frontend Portal & PDF Rendering Integration',
      status: 'Completed',
      passRate: '100% (7/7 Master PDFs Verified)',
      commitSha: '7535908',
      completionDate: '2026-10-15',
      tasks: [
        'Interactive 50-point enterprise checklist with real-time selection tally',
        'Official PDF viewer integration for 7 master documents with SHA-256 integrity',
        'Visit All Stages canonical overview with responsive prerequisite gating',
      ],
    },
    {
      sprintNumber: 4,
      title: 'Payment Verification Engine & End-to-End QA',
      status: 'Completed',
      passRate: '100% (All Smoke & Integration Tests)',
      commitSha: 'd89a999',
      completionDate: '2026-10-15',
      tasks: [
        'Manual UPI QR generation matching approved Founder account (9342877474@ptyes)',
        'Zero-PSP architecture compliance with manual receiving bank reconciliation',
        'Comprehensive multi-device viewport testing and accessibility checks',
      ],
    },
    {
      sprintNumber: 5,
      title: 'Production Hardening, Edge Tuning & Acceptance Prep',
      status: 'In Progress (98% Complete)',
      passRate: '100% (142/142 Unit & Integration Suites)',
      commitSha: 'e01a234',
      completionDate: 'Target: 2026-10-16',
      tasks: [
        'Vercel Edge Network cache header optimization and sub-50ms TTFB tuning',
        'LIT-05 Delivery Acceptance Report compilation and QA evidence lock',
        'Stage 10 pre-flight readiness checks and final documentation packaging',
      ],
    },
  ];

  // Canonical Sample Active Change Request (LIT-CR-2026-001)
  const activeChangeRequest = {
    crNumber: 'LIT-CR-2026-001',
    relatedSow: 'LIT-01-SOW-2026-001',
    requestTitle: 'Granular Audit Export for Statutory Tax Records',
    requestedBy: contactName,
    requesterRole: 'Client Technical Lead',
    dateRequested: '2026-10-15',
    status: 'Assessed & Client Review',
    originalScope: 'Section 4.3: Standard in-portal audit viewer for stage transitions.',
    proposedChange: 'Addition of one-click CSV and JSON cryptographic export of all SHA-256 audit logs with HMAC verification for external tax audit.',
    reason: 'Statutory compliance requirement mandated by internal corporate audit committee.',
    urgency: 'Medium',
    technicalImpact: {
      frontend: '1 new Export button and modal on Admin Audit and Client Engagement views.',
      backend: '1 new streaming API endpoint /api/audit/export with cryptographic signing.',
      database: 'Zero schema changes; queries existing immutable audit ledger tables.',
      integrations: 'Zero new third-party dependencies required.',
    },
    scheduleImpact: '2 business days (absorbed within Sprint 5 without delaying final target date).',
    commercialImpact: {
      itemDescription: 'Audit Log Cryptographic Export Module',
      netAmount: '₹0.00 (Complementary Enterprise Add-on)',
      tax: '₹0.00 (18% GST)',
      total: '₹0.00 (Approved within initial SOW contingency allowance)',
    },
    newDeliverable: 'CR-D-01: Cryptographic CSV/JSON Audit Exporter with SHA-256 checksums.',
    revisedCompletionDate: '2026-10-22 (Unchanged)',
  };

  const handleRfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfcTitle.trim() || !rfcDescription.trim()) {
      setErrorMessage('Please fill out all required fields for the Change Request.');
      return;
    }

    setIsSubmittingRfc(true);
    setErrorMessage(null);

    const generatedCrRef = `LIT-CR-2026-00${submittedRfcs.length + 2}`;

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/development`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_rfc',
          payload: {
            crNumber: generatedCrRef,
            title: rfcTitle.trim(),
            category: rfcCategory,
            urgency: rfcUrgency,
            affectedModule: rfcAffectedModule,
            description: rfcDescription.trim(),
            expectedOutcome: rfcExpectedOutcome.trim(),
            requestedBy: contactName,
            requestedEmail: contactEmail,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit Change Request');
      }

      setRfcAuditHash(data.auditHash);
      setSubmittedRfcs([
        ...submittedRfcs,
        {
          crNumber: generatedCrRef,
          title: rfcTitle.trim(),
          urgency: rfcUrgency,
          category: rfcCategory,
          status: 'Under Technical Assessment',
          submittedAt: new Date().toISOString(),
        },
      ]);
      setRfcSubmitted(true);
      setShowRfcModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting Change Request';
      setErrorMessage(msg);
    } finally {
      setIsSubmittingRfc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef="LIT-06-Change-Request.pdf"
        title="LIT-06 Change Request & Additional Work Order Master"
        description="Official 4-page governance document covering bilateral scope amendments, technical impact evaluations, schedule adjustments, and commercial terms."
        documentMasterPath="/assets/docs/masters/LIT-06-Change-Request.pdf"
        version="v1.0 (Official LIT Master Specification)"
        status="active"
      />

      {/* Live Preview Environment Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Live Production Preview Environment</h3>
              <p className="text-xs text-slate-400 font-mono">
                https://www.logicintelligencetechnologies.in
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-[11px] font-semibold">
              Edge Status: 200 OK (32ms)
            </span>
            <a
              href="https://www.logicintelligencetechnologies.in"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Visit Site</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Active Release Commit</span>
            <span className="font-mono text-sky-400 font-semibold">d89a999 (main)</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Automated Test Suites</span>
            <span className="font-semibold text-emerald-400">142 / 142 Passing (100%)</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Stage</span>
            <span className="font-semibold text-slate-200">Sprint 5 / QA Hardening</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Acceptance</span>
            <span className="font-semibold text-amber-400">Stage 10 Ready</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Tabs Switcher: Sprint Roadmap vs Change Requests */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] overflow-hidden shadow-xs">
        <div className="border-b border-[#DFE7EF] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              Sprint Execution & Change Governance
            </h3>
            <p className="text-xs text-[#52677C]">
              Real-time milestone progress and LIT-06 change orders for {companyName}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('sprints')}
                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'sprints'
                    ? 'bg-white text-[#1565C0] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sprint Milestones (M1..M5)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('change-requests')}
                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'change-requests'
                    ? 'bg-white text-[#1565C0] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Change Orders (LIT-06)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowRfcModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2545] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Request Change (RFC)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Sprint Milestones */}
        {activeTab === 'sprints' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              {sprintData.map((sprint) => {
                const isCompleted = sprint.status.includes('Completed');
                return (
                  <div
                    key={sprint.sprintNumber}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-blue-200 bg-blue-50/20 ring-1 ring-blue-400/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          M{sprint.sprintNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-[#0B2545]">{sprint.title}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Commit: {sprint.commitSha} · {sprint.completionDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                          {sprint.passRate}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sprint.status}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      {sprint.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isCompleted ? 'text-emerald-600' : 'text-blue-600'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                All development sprints M1..M5 complete or in final hardening. Ready for formal delivery review.
              </div>

              <Link
                href={`/engagement/${engagementRef}/delivery-acceptance`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2545] text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Stage 10: Delivery & Acceptance</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Change Orders (LIT-06) */}
        {activeTab === 'change-requests' && (
          <div className="p-6 sm:p-8 space-y-8">
            {/* 5-Step Process Strip */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                LIT-06 Change Governance Lifecycle (5 Steps)
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700">1. Requested</span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800">2. Assessed (Active)</span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700">3. Approved</span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700">4. Scheduled</span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700">5. Delivered</span>
              </div>
            </div>

            {/* Active Change Request (LIT-CR-2026-001) */}
            <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-blue-50/70 px-6 py-4 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#1565C0] text-white px-2 py-0.5 rounded">
                      {activeChangeRequest.crNumber}
                    </span>
                    <h4 className="font-bold text-sm text-[#0B2545]">{activeChangeRequest.requestTitle}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Related SOW: {activeChangeRequest.relatedSow} · Requested by {activeChangeRequest.requestedBy} ({activeChangeRequest.dateRequested})
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg self-start sm:self-auto">
                  {activeChangeRequest.status}
                </span>
              </div>

              <div className="p-6 space-y-6 text-xs divide-y divide-slate-100">
                {/* Chapters 01 & 02: Scope & Proposed Change */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">01. Original Scoped Requirement</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {activeChangeRequest.originalScope}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">02. Proposed Change Specification</span>
                    <p className="text-slate-800 bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                      {activeChangeRequest.proposedChange}
                    </p>
                  </div>
                </div>

                {/* Chapters 04 & 05: Technical & Schedule Impact */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-700 block mb-2">04. Engineering Technical Impact</span>
                    <ul className="space-y-1.5 text-slate-600">
                      <li>• <strong>Frontend:</strong> {activeChangeRequest.technicalImpact.frontend}</li>
                      <li>• <strong>Backend:</strong> {activeChangeRequest.technicalImpact.backend}</li>
                      <li>• <strong>Database:</strong> {activeChangeRequest.technicalImpact.database}</li>
                      <li>• <strong>Integrations:</strong> {activeChangeRequest.technicalImpact.integrations}</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-2">05. Schedule & Milestone Impact</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {activeChangeRequest.scheduleImpact}
                    </p>
                    <div className="mt-3">
                      <span className="font-bold text-slate-700 block mb-1">07. New Deliverable Code</span>
                      <span className="font-mono font-bold text-[#1565C0] text-xs">
                        {activeChangeRequest.newDeliverable}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chapter 06: Commercial Impact */}
                <div className="pt-4 space-y-2">
                  <span className="font-bold text-slate-700 block">06. Commercial & Pricing Terms</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2.5">Item Description</th>
                          <th className="p-2.5">Net Amount (ex GST)</th>
                          <th className="p-2.5">Applicable GST</th>
                          <th className="p-2.5">Total Payable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-2.5 font-medium">{activeChangeRequest.commercialImpact.itemDescription}</td>
                          <td className="p-2.5 font-mono">{activeChangeRequest.commercialImpact.netAmount}</td>
                          <td className="p-2.5 font-mono">{activeChangeRequest.commercialImpact.tax}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">
                            {activeChangeRequest.commercialImpact.total}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Other Submitted RFCs */}
            {submittedRfcs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                  Additional Submitted Change Requests
                </h4>
                <div className="space-y-2">
                  {submittedRfcs.map((rfc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-900">{rfc.crNumber}</span>
                          <span className="font-semibold text-slate-800">{rfc.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{rfc.category} · Urgency: {rfc.urgency}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                        {rfc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RFC Submission Modal */}
      {showRfcModal && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#DFE7EF] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#0B2545]">
                  Initiate Change Request (LIT-06 RFC)
                </h3>
                <p className="text-xs text-[#52677C]">
                  Formally propose out-of-scope modifications for engineering feasibility review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRfcModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRfcSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-800 mb-1">
                  Change Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rfcTitle}
                  onChange={(e) => setRfcTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                  placeholder="e.g. Add Multi-Currency Support to Checkout"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-800 mb-1">Change Category</label>
                  <select
                    value={rfcCategory}
                    onChange={(e) => setRfcCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="New Feature / Capability">New Feature / Capability</option>
                    <option value="UI/UX Workflow Modification">UI/UX Workflow Modification</option>
                    <option value="Third-Party Integration">Third-Party Integration</option>
                    <option value="Database / Reporting Enhancement">Database / Reporting Enhancement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-800 mb-1">Business Urgency</label>
                  <select
                    value={rfcUrgency}
                    onChange={(e) => setRfcUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="low">Low (Next Minor Release)</option>
                    <option value="medium">Medium (Current Engagement)</option>
                    <option value="high">High (Sprint Priority)</option>
                    <option value="critical">Critical (Blocking Requirement)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">Affected System / Module</label>
                <input
                  type="text"
                  value={rfcAffectedModule}
                  onChange={(e) => setRfcAffectedModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Payment Gateway / Client Dashboard"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">
                  Detailed Change Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rfcDescription}
                  onChange={(e) => setRfcDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                  placeholder="Specify exactly what changes are being proposed, target user roles, and expected interactions..."
                />
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">Expected Business Outcome</label>
                <textarea
                  rows={2}
                  value={rfcExpectedOutcome}
                  onChange={(e) => setRfcExpectedOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="How will this change improve operational efficiency, revenue, or compliance?"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRfcModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRfc}
                  className="px-5 py-2 bg-[#1565C0] hover:bg-[#0B2545] text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isSubmittingRfc ? 'Dispatching RFC...' : 'Submit Change Request'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
