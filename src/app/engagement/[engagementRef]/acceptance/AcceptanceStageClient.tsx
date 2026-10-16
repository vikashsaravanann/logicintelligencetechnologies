'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { calculateEngagementFinancials } from '@/lib/engagements/financials';

interface AcceptanceStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  metadata?: Record<string, unknown>;
}

export default function AcceptanceStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  initialStatus = 'available',
  initialData = {},
  metadata,
}: AcceptanceStageClientProps) {
  const router = useRouter();
  const [signerName, setSignerName] = useState(initialData?.signerName || contactName);
  const [signerTitle, setSignerTitle] = useState(initialData?.signerTitle || 'Managing Director / Authorized Representative');
  const [signerOrg, setSignerOrg] = useState(initialData?.signerOrg || companyName);
  const [hasAuthority, setHasAuthority] = useState(false);
  const [agreedToScope, setAgreedToScope] = useState(false);
  const [agreedToMilestones, setAgreedToMilestones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInitiallyAccepted = ['completed', 'accepted', 'approved', 'signed'].includes(initialStatus || '');
  const [isAccepted, setIsAccepted] = useState(isInitiallyAccepted);
  const [acceptedTimestamp, setAcceptedTimestamp] = useState(initialData?.acceptedTimestamp || '');
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Revision Request Modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionChapter, setRevisionChapter] = useState('Commercial Quotation');
  const [revisionDetails, setRevisionDetails] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionSuccessMessage, setRevisionSuccessMessage] = useState<string | null>(null);

  // Decline Modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isSubmittingDecline, setIsSubmittingDecline] = useState(false);
  const [declineSuccessMessage, setDeclineSuccessMessage] = useState<string | null>(null);

  const candidateSubtotal =
    initialData?.subtotal ||
    metadata?.contract_subtotal ||
    metadata?.subtotal ||
    metadata?.contract_value ||
    metadata?.budget_range ||
    50;

  const financials = calculateEngagementFinancials(candidateSubtotal);

  const proposalSummary = {
    proposalRef: initialData?.proposalRef || 'LIT-PROP-2026-084',
    version: 'v1.0 (LIT-Approved Baseline)',
    issueDate: '14 October 2026',
    validUntil: '14 November 2026',
    subtotal: financials.subtotalFormatted,
    gst: financials.gstFormatted,
    totalPayable: financials.totalFormatted,
    milestones: [
      {
        label: 'Milestone 1: Initial Deposit (Stage 6)',
        amount: `${financials.depositFormatted} (50%)`,
        trigger: 'Execution of Statement of Work (Stage 5)',
      },
      {
        label: 'Milestone 2: Final Settlement (Stage 11)',
        amount: `${financials.settlementFormatted} (50%)`,
        trigger: 'Delivery Acceptance Sign-off & QA Verification (Stage 10)',
      },
    ],
    deliverables: [
      'D-01: 50-Point Enterprise Architectural Audit & Compliance Alignment',
      'D-02: Production Next.js 15 Web Application + Custom REST Middleware',
      'D-03: Supabase Database Schema with Strict RLS & Immutable Audit Trails',
      'D-04: Zero-Gateway Audited Manual UPI Payment Clearance Architecture',
      'D-05: AI Assistant Pipeline with Groq LPU + Domain-Isolated RAG Embeddings',
      'D-06: Comprehensive Handover Manifest, Transfer Runbooks & 90-Day SLA Support',
    ],
  };

  const handleAcceptProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAuthority || !agreedToScope || !agreedToMilestones || !signerName.trim()) {
      setErrorMessage('Please confirm all legal authority checkboxes and provide your full legal name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const now = new Date().toISOString();
      const res = await fetch(`/api/engagements/${engagementRef}/stages/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_proposal',
          payload: {
            signerName: signerName.trim(),
            signerTitle: signerTitle.trim(),
            signerOrg: signerOrg.trim(),
            contactEmail: contactEmail.trim().toLowerCase(),
            proposalReference: proposalSummary.proposalRef,
            proposalVersion: proposalSummary.version,
            acceptedTotalPayable: proposalSummary.totalPayable,
            acceptedTimestamp: now,
            clientAuthorityConfirmed: true,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit proposal acceptance.');
      }

      setIsAccepted(true);
      setAcceptedTimestamp(now);
      setAuditHash(data.auditHash);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting proposal acceptance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionDetails.trim()) return;

    setIsSubmittingRevision(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_revision',
          payload: {
            chapter: revisionChapter,
            details: revisionDetails.trim(),
            requestedBy: signerName,
            contactEmail,
            requestedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit revision request');
      }

      setRevisionSuccessMessage('Revision request received. Principal Architect Vikash Saravanan will issue an updated proposal baseline.');
      setTimeout(() => setShowRevisionModal(false), 2500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting revision request');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDecline(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline_proposal',
          payload: {
            reason: declineReason.trim(),
            declinedBy: signerName,
            contactEmail,
            declinedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record decline');
      }

      setDeclineSuccessMessage('Proposal decline recorded. Our client relationship team will be in touch.');
      setTimeout(() => setShowDeclineModal(false), 2500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error recording decline');
    } finally {
      setIsSubmittingDecline(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded">
                STAGE 04
              </span>
              <span className="text-xs text-slate-500">Proposal Formal Acceptance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B2545] mt-1.5">
              Review and Confirm Your Project Proposal
            </h1>
            <p className="text-xs text-[#52677C]">
              Commercial assent for <strong className="text-slate-800">{companyName}</strong> (Proposal: {proposalSummary.proposalRef} {proposalSummary.version})
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Contract Value</span>
            <span className="text-2xl font-black font-mono text-[#0B2545]">{proposalSummary.totalPayable}</span>
            <span className="text-[11px] text-slate-600 block">Subtotal: {proposalSummary.subtotal} + 18% GST</span>
          </div>
        </div>

        {/* Legal Distinction Notice */}
        <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-xl p-4 text-xs text-[#0B2545] space-y-1">
          <span className="font-bold block">Important Procedural Context</span>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Accepting this proposal confirms commercial approval of the pricing, scope, and milestone terms outlined below. 
            <strong> This is not a payment event, invoice, or SOW signature.</strong> Binding legal terms, intellectual property assignment, and warranties are governed by the Statement of Work (Stage 5), and payment occurs exclusively at Stage 6.
          </p>
        </div>

        {/* Proposal Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Deliverables Recap */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0B2545]">Agreed Scope Deliverables Recap</h3>
            <div className="space-y-2">
              {proposalSummary.deliverables.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-start gap-2 text-slate-700 text-[11px]">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Milestone Schedule Recap */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0B2545]">Milestone Payment Schedule Recap</h3>
            <div className="space-y-2.5">
              {proposalSummary.milestones.map((ms, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B2545]">{ms.label}</span>
                    <span className="font-mono font-bold text-[#1565C0]">{ms.amount}</span>
                  </div>
                  <p className="text-slate-600 text-[10px]">Trigger: {ms.trigger}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-0.5">
              <span className="font-bold block">Strict Non-Duplication Policy</span>
              <p className="text-amber-800 text-[10px]">
                Stage 4 output is never labeled a "Payment Receipt". It represents commercial agreement on the baseline proposal before contract issuance.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form or Accepted State */}
        {isAccepted ? (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 sm:p-8 text-xs text-[#065F46] space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#065F46] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  ✓
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#065F46]">
                    Proposal Accepted — Your Service Agreement is Next
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Commercial baseline proposal {proposalSummary.proposalRef} ({proposalSummary.version}) has been formally approved.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 border border-emerald-200 rounded-xl p-4 font-mono text-[11px] text-slate-800 space-y-1.5">
                <div>Signatory: <strong>{signerName}</strong></div>
                <div>Designation: <strong>{signerTitle}</strong></div>
                <div>Organization: <strong>{signerOrg}</strong></div>
                <div>Contact Email: <strong>{contactEmail}</strong></div>
                <div>Timestamp: <strong>{acceptedTimestamp || new Date().toISOString()}</strong></div>
                {auditHash && (
                  <div className="break-all pt-1 text-slate-600">
                    Cryptographic Audit Digest: <strong>{auditHash}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
              <div className="text-xs text-slate-600">
                Next required step: Review & Sign Stage 5 Statement of Work (SOW).
              </div>
              <Link
                href={`/engagement/${engagementRef}/sow`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Proceed to Stage 5: Statement of Work (SOW)</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAcceptProposal} className="space-y-6 pt-4 border-t border-slate-100 text-xs">
            {/* Signatory Information */}
            <div className="space-y-3">
              <h3 className="font-bold text-[#0B2545]">Authorized Signatory Verification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Signer Legal Name</label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Title / Role</label>
                  <input
                    type="text"
                    required
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / Entity</label>
                  <input
                    type="text"
                    required
                    value={signerOrg}
                    onChange={(e) => setSignerOrg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>
              </div>
            </div>

            {/* Legal Authority Declarations */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="font-bold text-[#0B2545] block">Legal Authority Declarations</span>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={hasAuthority}
                  onChange={(e) => setHasAuthority(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                />
                <span className="leading-relaxed">
                  I represent and warrant that I possess full corporate and legal authority to act on behalf of <strong>{signerOrg}</strong> and commit to the scope and pricing set forth in this Proposal.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={agreedToScope}
                  onChange={(e) => setAgreedToScope(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                />
                <span className="leading-relaxed">
                  I have reviewed Deliverables D-01 through D-06 and confirm that they satisfy our business requirements as documented during Discovery.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={agreedToMilestones}
                  onChange={(e) => setAgreedToMilestones(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
                />
                <span className="leading-relaxed">
                  I acknowledge the two-milestone payment structure (50% post-SOW execution at Stage 6, and 50% post-Delivery Acceptance at Stage 11).
                </span>
              </label>
            </div>

            {/* Action Buttons Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors text-center"
                >
                  Request Proposal Revision
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors text-center"
                >
                  Decline
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !hasAuthority || !agreedToScope || !agreedToMilestones || !signerName.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#1565C0] disabled:bg-slate-300 text-white px-8 py-2.5 rounded-xl font-semibold shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <span>Recording Digital Assent...</span>
                ) : (
                  <>
                    <span>Accept this Proposal Version</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2545]">Request Formal Proposal Revision</h3>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {revisionSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                {revisionSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleRequestRevision} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Section / Chapter</label>
                  <select
                    value={revisionChapter}
                    onChange={(e) => setRevisionChapter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  >
                    <option value="Commercial Quotation">Chapter 10: Commercial Quotation</option>
                    <option value="Agreed Scope & Deliverables">Chapter 06: Agreed Deliverables</option>
                    <option value="Architecture & Tech Stack">Chapter 04: Architecture & Tech Stack</option>
                    <option value="Milestones & Timeline">Chapter 09: Timeline & Schedule</option>
                    <option value="Other Scope Questions">Other Scope Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specific Modifications Required</label>
                  <textarea
                    rows={4}
                    required
                    value={revisionDetails}
                    onChange={(e) => setRevisionDetails(e.target.value)}
                    placeholder="Describe the adjustments to deliverables, pricing, or milestone parameters..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRevision || !revisionDetails.trim()}
                    className="bg-[#0B2545] hover:bg-[#1565C0] disabled:bg-slate-300 text-white px-5 py-2 rounded-lg font-semibold text-xs transition-colors"
                  >
                    {isSubmittingRevision ? 'Submitting...' : 'Submit Revision Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700">Decline Proposal</h3>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {declineSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                {declineSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleDecline} className="space-y-4 text-xs">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Please let us know why this proposal does not fit your requirements. Your feedback will help our leadership team address any gaps.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Declining (Optional)</label>
                  <textarea
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Budget mismatch, timeline changes, internal restructuring..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeclineModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDecline}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg font-semibold text-xs transition-colors"
                  >
                    {isSubmittingDecline ? 'Submitting...' : 'Confirm Decline'}
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
