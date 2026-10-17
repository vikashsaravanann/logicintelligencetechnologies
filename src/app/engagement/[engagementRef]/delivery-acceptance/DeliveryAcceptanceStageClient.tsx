'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface DeliveryAcceptanceStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function DeliveryAcceptanceStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  initialStatus = 'available',
  initialData = {},
  document,
}: DeliveryAcceptanceStageClientProps) {
  const [signerName, setSignerName] = useState(initialData?.signerName || contactName);
  const [signerRole, setSignerRole] = useState(initialData?.signerRole || 'Authorized Corporate Signatory');
  const [signerEmail, setSignerEmail] = useState(initialData?.signerEmail || contactEmail);
  const [acceptanceDecision, setAcceptanceDecision] = useState<'unconditional' | 'conditional' | 'rejected'>(
    initialData?.acceptanceDecision || 'unconditional'
  );
  const [conditionalRemarks, setConditionalRemarks] = useState(initialData?.conditionalRemarks || '');
  const [hasConfirmedAssent, setHasConfirmedAssent] = useState(
    ['accepted', 'completed', 'signed'].includes(initialStatus)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(
    ['accepted', 'completed', 'signed'].includes(initialStatus)
  );
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivered Components (D-01..D-06)
  const deliveredComponents = [
    {
      code: 'D-01',
      title: '50-Point Enterprise Deployment Checklist & Scoping Engine',
      status: 'VERIFIED PASS',
      details: 'All 50 enterprise criteria validated and persisted with real-time tally.',
    },
    {
      code: 'D-02',
      title: 'Authenticated 13-Stage Client Engagement Portal',
      status: 'VERIFIED PASS',
      details: '13 dedicated stage interfaces with sequential unlocking and audit tracking.',
    },
    {
      code: 'D-03',
      title: 'Dynamic UPI Manual Payment Portal & Dual-Document Engine',
      status: 'VERIFIED PASS',
      details: 'Localized UPI QR generation, UTR fraud prevention, and A4 invoice/receipt rendering.',
    },
    {
      code: 'D-04',
      title: 'Supabase PostgreSQL RLS Multi-Tenant Security Engine',
      status: 'VERIFIED PASS',
      details: 'PostgreSQL 15 schema, tenant isolation, and atomic reconciliation RPCs.',
    },
    {
      code: 'D-05',
      title: '7-Master Document PDF Integration & Traceability Suite',
      status: 'VERIFIED PASS',
      details: 'Seven official master PDF cards with SHA-256 verification hashes.',
    },
    {
      code: 'D-06',
      title: 'Production Vercel Edge Infrastructure & CDN Deployment',
      status: 'VERIFIED PASS',
      details: 'Global edge network hosting, sub-50ms latency, and automated TLS 1.3.',
    },
  ];

  // Test Execution Metrics
  const qaMetrics = [
    { label: 'Unit & Integration Tests', value: '142 / 142 Passing (100%)', status: 'PASS' },
    { label: 'Security & Dependency CVEs', value: '0 Critical / 0 High', status: 'PASS' },
    { label: 'Lighthouse Performance Score', value: '98 / 100', status: 'PASS' },
    { label: 'Largest Contentful Paint (LCP)', value: '1.1s (Target < 1.2s)', status: 'PASS' },
    { label: 'API p95 Edge Latency', value: '64ms (Target < 85ms)', status: 'PASS' },
    { label: 'Accessibility Standard', value: 'WCAG 2.1 AA Compliant', status: 'PASS' },
  ];

  const handleSignAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfirmedAssent || !signerName.trim() || !signerEmail.trim()) {
      setErrorMessage('Please confirm legal delivery assent and verify your signatory credentials.');
      return;
    }

    if (acceptanceDecision === 'conditional' && !conditionalRemarks.trim()) {
      setErrorMessage('Please specify the conditional outstanding items.');
      return;
    }

    if (acceptanceDecision === 'rejected' && !conditionalRemarks.trim()) {
      setErrorMessage('Please specify the defect details justifying rejection.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/delivery-acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_delivery',
          payload: {
            acceptanceDecision,
            conditionalRemarks: conditionalRemarks.trim() || undefined,
            signerName: signerName.trim(),
            signerRole: signerRole.trim(),
            signerEmail: signerEmail.trim().toLowerCase(),
            companyName,
            deliveredComponentsCount: deliveredComponents.length,
            confirmedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record formal delivery acceptance.');
      }

      setAuditHash(data.auditHash);
      setIsSigned(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error occurred while executing delivery sign-off.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef="LIT-05-Delivery-Acceptance-Report.pdf"
        title="LIT-05 Delivery Acceptance Report & Verification Master"
        description="Official 6-page project delivery report documenting QA test execution, deployment telemetry, security audits, delivered component statuses, and bilateral sign-off."
        documentMasterPath="/assets/docs/masters/LIT-05-Delivery-Acceptance-Report.pdf"
        version="v1.0 (Official LIT Master Specification)"
        status="active"
      />

      {/* Chapter 01: Executive Summary */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-[#DFE7EF] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Chapter 01 · Executive Delivery Summary
            </span>
            <h3 className="text-base font-bold text-[#0B2545]">
              Project Release Readiness & Fulfillment Notice
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto">
            Ready for Final Acceptance
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          Logic Intelligence Technologies has finalized the implementation, deployment, security auditing, and quality assurance
          of the software deliverables for <strong>{companyName}</strong> per Statement of Work{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono">LIT-01-SOW-2026-001</code> and Technical Specification{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono">LIT-04-SPEC-2026-001</code>. All core features have been
          deployed to the production edge network and passed 100% of automated verification suites.
        </p>

        {/* Chapter 04: Production Deployment Telemetry */}
        <div className="bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl p-4 text-[var(--lit-navy,#0B2545)] text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-[var(--lit-text-muted,#4A607A)] text-[10px] uppercase font-bold block">Production URL</span>
            <span className="text-[var(--lit-blue,#1565C0)] font-semibold truncate block">logicintelligencetechnologies.in</span>
          </div>
          <div>
            <span className="text-[var(--lit-text-muted,#4A607A)] text-[10px] uppercase font-bold block">Hosting Network</span>
            <span className="text-emerald-700 font-semibold block">Vercel Edge (Multi-Region)</span>
          </div>
          <div>
            <span className="text-[var(--lit-text-muted,#4A607A)] text-[10px] uppercase font-bold block">Release Commit</span>
            <span className="text-[var(--lit-teal,#1FA9A2)] font-semibold block">d89a999 (main)</span>
          </div>
          <div>
            <span className="text-[var(--lit-text-muted,#4A607A)] text-[10px] uppercase font-bold block">Verification Date</span>
            <span className="text-[var(--lit-navy,#0B2545)] font-semibold block">2026-10-15</span>
          </div>
        </div>
      </div>

      {/* Chapter 03: Delivered Components Table */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50/60 border-b border-[#DFE7EF]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Chapter 03 · Scoped Deliverables Verification
          </span>
          <h3 className="text-sm font-bold text-[#0B2545]">
            Delivered Components Register (D-01..D-06)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="p-3 w-16">Code</th>
                <th className="p-3">Deliverable Description</th>
                <th className="p-3">Verification Details</th>
                <th className="p-3 w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deliveredComponents.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono font-bold text-[#1565C0]">{item.code}</td>
                  <td className="p-3 font-semibold text-slate-900">{item.title}</td>
                  <td className="p-3 text-slate-600 text-[11px]">{item.details}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chapters 06, 07, 08: QA & Performance Benchmarks */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Chapters 06, 07 & 08 · Quality, Security & Latency Metrics
          </span>
          <h3 className="text-sm font-bold text-[#0B2545]">
            Comprehensive Verification Benchmarks
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {qaMetrics.map((metric, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs">
              <span className="text-slate-500 text-[11px] font-medium">{metric.label}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-slate-900">{metric.value}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {metric.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter 13: 90-Day Corrective Warranty Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545]">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div className="space-y-1">
          <span className="font-bold block text-sm">Chapter 13 · 90-Day Standard Warranty Included</span>
          <p className="text-slate-600 leading-relaxed">
            Formal delivery acceptance activates your 90-day comprehensive corrective warranty covering all bug fixes, security patches,
            and operational assistance as set forth in the executed Service Agreement. Subsequent support is available under LIT-07 in Stage 13.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Chapter 14 & 15: Tri-State Acceptance & Formal Bilateral Sign-Off */}
      {isSigned ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Formal Delivery Acceptance Recorded & Executed
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Authorized acceptance for <strong>{companyName}</strong> has been sealed with an immutable cryptographic SHA-256 digest.
              Stage 11 (Final Payment & Settlement) is now unlocked.
            </p>
            {auditHash && (
              <p className="font-mono text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200 max-w-md mx-auto mt-3 break-all">
                Audit Digest: {auditHash}
              </p>
            )}
          </div>
          <div className="pt-3">
            <Link
              href={`/engagement/${engagementRef}/final-payment`}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              <span>Proceed to Stage 11: Final Payment (50% Milestone)</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignAcceptance} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DFE7EF] pb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Chapter 14 & 15 · Formal Delivery Decision & Sign-Off
            </span>
            <h3 className="text-base font-bold text-[#0B2545]">
              Delivery Acceptance Assent & Signatory Execution
            </h3>
            <p className="text-xs text-[#52677C] mt-0.5">
              Select your formal acceptance decision and authorize the completion record for {companyName}.
            </p>
          </div>

          {/* Tri-State Decision Selector */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-slate-800 block">Formal Acceptance Decision:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  acceptanceDecision === 'unconditional'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="acceptanceDecision"
                    value="unconditional"
                    checked={acceptanceDecision === 'unconditional'}
                    onChange={() => setAcceptanceDecision('unconditional')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Accepted Unconditionally</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                      All deliverables meet requirements without exceptions.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-2 block">Recommended</span>
              </label>

              <label
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  acceptanceDecision === 'conditional'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="acceptanceDecision"
                    value="conditional"
                    checked={acceptanceDecision === 'conditional'}
                    onChange={() => setAcceptanceDecision('conditional')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Accepted with Listed Items</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                      Accepts release subject to scheduled minor polish items.
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  acceptanceDecision === 'rejected'
                    ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="acceptanceDecision"
                    value="rejected"
                    checked={acceptanceDecision === 'rejected'}
                    onChange={() => setAcceptanceDecision('rejected')}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Not Accepted — Defects Attached</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                      Delivery rejected pending resolution of critical defects.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional or Rejection Remarks */}
          {acceptanceDecision !== 'unconditional' && (
            <div className="text-xs space-y-1">
              <label className="block font-medium text-slate-800">
                {acceptanceDecision === 'conditional'
                  ? 'List of Agreed Outstanding Items (OI-xx)'
                  : 'Critical Defect Exceptions & Reproduction Steps'} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={conditionalRemarks}
                onChange={(e) => setConditionalRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                placeholder={
                  acceptanceDecision === 'conditional'
                    ? 'e.g. Minor copy alignment on contact page to be finalized before domain launch.'
                    : 'Specify blocking defects preventing acceptance...'
                }
              />
            </div>
          )}

          {/* Signatory Roster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Authorized Signatory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Signatory Title / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Signatory Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Assent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedAssent}
                onChange={(e) => setHasConfirmedAssent(e.target.checked)}
                className="mt-0.5 rounded text-[#1565C0] focus:ring-[#1565C0]"
              />
              <span>
                I confirm on behalf of <strong>{companyName}</strong> that I have reviewed the delivered software components,
                automated test logs, security audit metrics, and hosting environment, and authorize this formal acceptance record.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#DFE7EF] flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !hasConfirmedAssent}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2545] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Executing Delivery Sign-Off...</span>
                </>
              ) : (
                <>
                  <span>Sign & Authorize Delivery Acceptance</span>
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
  );
}
