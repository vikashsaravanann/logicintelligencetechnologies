'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface DevelopmentStageClientProps {
  engagementRef: string;
  companyName: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function DevelopmentStageClient({
  engagementRef,
  companyName,
  initialStatus = 'in_progress',
  initialData = {},
  document,
}: DevelopmentStageClientProps) {
  const [showRfcModal, setShowRfcModal] = useState(false);
  const [rfcTitle, setRfcTitle] = useState('');
  const [rfcDescription, setRfcDescription] = useState('');
  const [rfcImpact, setRfcImpact] = useState<'low' | 'medium' | 'high'>('low');
  const [isSubmittingRfc, setIsSubmittingRfc] = useState(false);
  const [rfcSubmitted, setRfcSubmitted] = useState(false);
  const [rfcAuditHash, setRfcAuditHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialSprintData = [
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
  ];

  const [sprintList, setSprintList] = useState(
    Array.isArray(initialData?.sprints) && initialData.sprints.length > 0
      ? initialData.sprints
      : initialSprintData
  );
  const [isPersistingSprint, setIsPersistingSprint] = useState<number | null>(null);
  const [sprintActionNotice, setSprintActionNotice] = useState<string | null>(null);
  const [stageStatus, setStageStatus] = useState<string>(initialStatus);

  const completedCount = sprintList.filter((s: any) => s.status === 'Completed').length;
  const sprintPercentage = Math.round((completedCount / sprintList.length) * 100);

  const handleToggleSprintStatus = async (sprintNumber: number) => {
    setIsPersistingSprint(sprintNumber);
    setSprintActionNotice(null);
    setErrorMessage(null);

    const updatedList = sprintList.map((s: any) => {
      if (s.sprintNumber === sprintNumber) {
        const isCurrentlyCompleted = s.status === 'Completed';
        return {
          ...s,
          status: isCurrentlyCompleted ? 'In Progress' : 'Completed',
          completionDate: isCurrentlyCompleted ? undefined : new Date().toISOString().split('T')[0],
        };
      }
      return s;
    });

    const allCompleted = updatedList.every((s: any) => s.status === 'Completed');

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/development`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: allCompleted ? 'complete_development' : 'advance_sprint',
          payload: {
            sprints: updatedList,
            sprintNumber,
            allCompleted,
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to persist sprint milestone telemetry.');
      }

      setSprintList(updatedList);
      if (allCompleted) {
        setStageStatus('completed');
        setSprintActionNotice('All engineering sprints completed! Stage 9 verified and Delivery & Acceptance unlocked.');
      } else {
        setSprintActionNotice(`Sprint #${sprintNumber} milestone updated and cryptographic audit hash recorded.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update sprint telemetry';
      setErrorMessage(msg);
    } finally {
      setIsPersistingSprint(null);
    }
  };

  const handleRfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfcTitle.trim() || !rfcDescription.trim()) return;

    setIsSubmittingRfc(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/development`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_rfc',
          payload: {
            title: rfcTitle.trim(),
            impact: rfcImpact,
            description: rfcDescription.trim(),
            companyName,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit Change Request.');
      }

      setRfcAuditHash(data.auditHash);
      setRfcSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error logging Change Request.';
      setErrorMessage(msg);
    } finally {
      setIsSubmittingRfc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card for Change Requests */}
      <StageDocumentCard
        documentRef={document?.master_id ? `${document.master_id}-Change-Request.pdf` : 'LIT-06-Change-Request.pdf'}
        title={document?.document_title || 'LIT-06 Change Request & Scope Amendment Master'}
        description="Official template governing out-of-scope enhancements, technical deviations, timelines, and commercial impact assessments."
        documentMasterPath={document?.file_url || '/assets/docs/masters/LIT-06-Change-Request.pdf'}
        version={document?.version_label || 'v1.8 (Formal Amendment Standard)'}
        status="active"
      />

      {/* Sprints Overview Header */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Sprint Status: {completedCount} of {sprintList.length} Completed ({sprintPercentage}%)
          </span>
          <h3 className="text-base font-bold text-[#0B2545] mt-2">
            Engineering Milestones & Build Telemetry
          </h3>
          <p className="text-xs text-[#52677C]">
            Live progress and test telemetry for {companyName}.
          </p>
        </div>

        <button
          onClick={() => setShowRfcModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#DFE7EF] hover:border-[#1565C0] text-xs font-semibold text-[#0B2545] hover:text-[#1565C0] bg-white rounded-lg transition-colors shadow-xs"
        >
          <svg className="w-4 h-4 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Request Change / RFC (LIT-06)
        </button>
      </div>

      {/* Sprint Milestone Feedback Notice */}
      {sprintActionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{sprintActionNotice}</span>
        </div>
      )}

      {/* Sprint Cards */}
      <div className="space-y-4">
        {sprintList.map((sprint: any) => {
          const isCompleted = sprint.status === 'Completed';
          const isPersisting = isPersistingSprint === sprint.sprintNumber;

          return (
            <div
              key={sprint.sprintNumber}
              className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs hover:border-[#B9DCFF] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFE7EF] pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {sprint.sprintNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B2545]">{sprint.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      {isCompleted && sprint.completionDate ? `Completed: ${sprint.completionDate} · ` : 'Active Milestone · '}
                      Git Commit: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">{sprint.commitSha}</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPersisting}
                    onClick={() => handleToggleSprintStatus(sprint.sprintNumber)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-blue-50 text-[#1565C0] border-blue-200 hover:bg-blue-100'
                    } disabled:opacity-50`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    {isPersisting ? 'Updating...' : sprint.status}
                  </button>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {sprint.passRate}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                {sprint.tasks.map((task: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Stage Action Bar */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href={`/engagement/${engagementRef}`}
          className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
        >
          ← Back to Visit All Stages
        </Link>

        <Link
          href={`/engagement/${engagementRef}/delivery-acceptance`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
        >
          <span>Proceed to Stage 10: Delivery & Acceptance Report</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* RFC Modal */}
      {showRfcModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DFE7EF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE7EF] pb-3">
              <h3 className="text-base font-bold text-[#0B2545]">
                Submit Change Request (LIT-06)
              </h3>
              <button
                onClick={() => setShowRfcModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {rfcSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-center font-medium space-y-3">
                <div>Change request logged! A technical lead will evaluate the scope impact within 24 hours.</div>
                {rfcAuditHash && (
                  <div className="font-mono text-[10px] text-emerald-900 break-all bg-emerald-100/70 p-2 rounded">
                    Audit SHA-256: {rfcAuditHash}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRfcModal(false);
                      setRfcSubmitted(false);
                      setRfcTitle('');
                      setRfcDescription('');
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRfcSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Change Request Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Add additional SAML SSO Identity Provider"
                    value={rfcTitle}
                    onChange={(e) => setRfcTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Estimated Priority / Impact
                  </label>
                  <select
                    value={rfcImpact}
                    onChange={(e) => setRfcImpact(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                  >
                    <option value="low">Low Impact (Minor UX / copy modification)</option>
                    <option value="medium">Medium Impact (New field / API endpoint addition)</option>
                    <option value="high">High Impact (Architectural / Third-party integration)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Detailed Specification & Rationale *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Explain the desired behavior, user story, and justification..."
                    value={rfcDescription}
                    onChange={(e) => setRfcDescription(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRfcModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRfc}
                    className="px-5 py-2 bg-[#1565C0] text-white rounded-lg font-semibold hover:bg-[#0B2545] disabled:opacity-50"
                  >
                    {isSubmittingRfc ? 'Recording RFC...' : 'Submit RFC'}
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
