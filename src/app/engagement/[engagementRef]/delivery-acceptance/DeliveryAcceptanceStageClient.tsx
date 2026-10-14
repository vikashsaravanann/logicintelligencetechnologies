'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface DeliveryAcceptanceStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export default function DeliveryAcceptanceStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
}: DeliveryAcceptanceStageClientProps) {
  const [signerName, setSignerName] = useState(contactName);
  const [signerRole, setSignerRole] = useState('Authorized Client Signatory');
  const [signerEmail, setSignerEmail] = useState(contactEmail);
  const [hasConfirmedDelivery, setHasConfirmedDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureHash, setSignatureHash] = useState('');

  const acceptanceCriteria = [
    {
      title: 'Functional Requirements Fulfillment',
      status: 'Verified',
      description: 'All 50 enterprise checklist requirements implemented per approved SOW scope.',
    },
    {
      title: 'Automated Test Suite Execution',
      status: 'Verified',
      description: 'Zero failing tests, 100% core test pass rate across unit, integration, and UI tests.',
    },
    {
      title: 'Security Vulnerability & Static Analysis',
      status: 'Verified',
      description: 'Zero high or critical severity CVEs identified in third-party dependencies and code scanners.',
    },
    {
      title: 'Performance & Edge Latency Benchmark',
      status: 'Verified',
      description: 'Lighthouse score > 90 across desktop and mobile, edge TTFB < 50ms.',
    },
  ];

  const handleSignAcceptance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfirmedDelivery || !signerName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSigned(true);
      setSignatureHash(`SIG-LIT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef="LIT-05-Delivery-Acceptance-Report.pdf"
        title="LIT-05 Delivery & Acceptance Report"
        description="Formal engineering handover and acceptance report confirming deliverable completion, verification proofs, and commencement of warranty period."
        documentMasterPath="/assets/docs/masters/LIT-05-Delivery-Acceptance-Report.pdf"
        version="v2.0 (Official Delivery Sign-off)"
        status="active"
      />

      {/* Acceptance Criteria Table */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545]">
            Deliverable Verification Evidence
          </h3>
          <p className="text-xs text-[#52677C] mt-0.5">
            Independent verification audit performed for {companyName}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {acceptanceCriteria.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0B2545]">{item.title}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  ✓ {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isSigned ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Delivery Formally Accepted & Executed
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Signed by <strong>{signerName}</strong> ({signerRole}) for {companyName}. 
              Digital verification hash: <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">{signatureHash}</code>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/engagement/${engagementRef}/final-payment`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              Proceed to Stage 11: Final Payment & Settlement
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignAcceptance} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DFE7EF] pb-4">
            <h3 className="text-base font-bold text-[#0B2545]">
              Formal Delivery Acceptance Execution
            </h3>
            <p className="text-xs text-[#52677C] mt-1">
              By executing this digital sign-off, you confirm that all deliverables under the SOW have been inspected, tested, and accepted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Signatory Name *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Signatory Designation / Role *
              </label>
              <input
                type="text"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Signatory Email *
              </label>
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedDelivery}
                onChange={(e) => setHasConfirmedDelivery(e.target.checked)}
                className="mt-0.5 rounded text-[#1565C0] focus:ring-[#1565C0]"
              />
              <span className="leading-relaxed">
                <strong>Legal Assent & Sign-off:</strong> On behalf of {companyName}, I confirm that I have evaluated the deliverables and found them compliant with the agreed specifications. I authorize issuance of the final settlement invoice and transfer of production custody.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFE7EF]">
            <Link
              href={`/engagement/${engagementRef}`}
              className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
            >
              ← Back to Visit All Stages
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !hasConfirmedDelivery}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Executing Formal Sign-off...</span>
              ) : (
                <>
                  <span>Sign & Execute Delivery Acceptance</span>
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
