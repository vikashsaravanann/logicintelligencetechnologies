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

      {/* Proportional Enterprise RFC Modal */}
      {showRfcModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowRfcModal(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Decorative Header */}
            <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 sm:px-7 sm:py-6 text-white shrink-0">
              <button
                type="button"
                onClick={() => setShowRfcModal(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  LIT-06 · Change Governance
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Ref: {engagementRef}
                </span>
              </div>

              <h3 className="text-xl font-bold font-poppins text-white tracking-tight">
                Submit Request for Change (RFC)
              </h3>
              <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
                Log technical change requests, architectural modifications, or feature adjustments into the immutable audit queue.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1 text-xs">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {rfcSubmitted ? (
                <div className="p-6 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs text-xl font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-emerald-950 font-poppins">
                      Change Request Successfully Logged
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                      Your change request has been recorded. Our technical leads will evaluate the architecture and scope impact within 24 hours.
                    </p>
                  </div>
                  {rfcAuditHash && (
                    <div className="font-mono text-[10px] text-emerald-900 break-all bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200">
                      Audit Digest (SHA-256): {rfcAuditHash}
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
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Done / Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRfcSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5">
                      Change Request Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Add additional SAML SSO Identity Provider integration"
                      value={rfcTitle}
                      onChange={(e) => setRfcTitle(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                      <span>Estimated Priority / Scope Impact *</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Technical Classification</span>
                    </label>
                    <select
                      value={rfcImpact}
                      onChange={(e) => setRfcImpact(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all cursor-pointer"
                    >
                      <option value="low">Low Impact — Minor UX/UI refinement or textual adjustments</option>
                      <option value="medium">Medium Impact — Schema extension or new API integration</option>
                      <option value="high">High Impact — Core architecture expansion or new third-party subsystem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                      <span>Detailed Specification &amp; Business Rationale *</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Technical Rationale</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Explain the desired behavior, user story, technical justification, and any relevant endpoints..."
                      value={rfcDescription}
                      onChange={(e) => setRfcDescription(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all resize-none shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Informative SLA Callout */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <span className="font-mono text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">24h SLA</span>
                    <span>All formal RFCs are evaluated by assigned engineering leads to calculate timeline and quotation impact.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowRfcModal(false)}
                      disabled={isSubmittingRfc}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRfc || !rfcTitle.trim() || !rfcDescription.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1565C0] hover:from-[#123663] hover:to-[#1976D2] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {isSubmittingRfc ? 'Logging RFC...' : 'Submit Change Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
