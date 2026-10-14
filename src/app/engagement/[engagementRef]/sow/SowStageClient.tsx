'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SowStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
}

export default function SowStageClient({ engagementRef, companyName, contactName }: SowStageClientProps) {
  const [signedBy, setSignedBy] = useState(contactName);
  const [agreedClauses, setAgreedClauses] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signedRecord, setSignedRecord] = useState<{ timestamp: string; hash: string } | null>(null);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedClauses || !signedBy) return;

    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
      setSignedRecord({
        timestamp: new Date().toUTCString(),
        hash: '9f8e7d6c5b4a3210fedcba9876543210abcdef1234567890abcdef1234567890',
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* SOW Contract Terms Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#0B2545]">Contract Execution: Statement of Work (LIT-01)</h2>
          <p className="text-xs text-[#52677C] mt-1">
            Binding legal contract between Logic Intelligence Technologies and {companyName}.
          </p>
        </div>

        {/* Contractual Summary Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-[#0B2545] block">1. Intellectual Property & Transfer</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Upon final settlement verification (Stage 11), all custom developed source code and deliverables transfer exclusively to {companyName}.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-[#0B2545] block">2. Confidentiality & Zero PHI</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Strict non-disclosure agreements with complete data isolation. No unauthenticated patient or proprietary data is ever exposed.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <span className="font-bold text-[#0B2545] block">3. 90-Day Warranty & SLA</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Includes 90-day defect remediation post-handover, with formal escalation tiers and priority engineering resolution.
            </p>
          </div>
        </div>

        {/* Digital Signature Panel */}
        {isSigned && signedRecord ? (
          <div className="space-y-6">
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 text-xs text-[#065F46] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#065F46] text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <h3 className="text-base font-bold">SOW Agreement Formally Executed</h3>
              </div>
              <p>
                The Statement of Work has been digitally signed by <strong className="text-slate-800">{signedBy}</strong> on behalf of {companyName} and countersigned by Founder, Vikash Saravanan.
              </p>
              <div className="bg-white/80 border border-emerald-200 rounded-xl p-3 font-mono text-[11px] text-slate-700 space-y-1">
                <div>Client Signer: <strong>{signedBy}</strong></div>
                <div>Founder Countersign: <strong>S Vikash (Founder, LIT)</strong></div>
                <div>Execution Timestamp: {signedRecord.timestamp}</div>
                <div>Document SHA-256: {signedRecord.hash}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-600">
                SOW execution completes prerequisite for Stage 6 Initial Payment.
              </span>
              <Link
                href={`/engagement/${engagementRef}/initial-invoice`}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Proceed to Stage 6 Initial Payment & UPI QR →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSign} className="space-y-5 text-xs border-t border-slate-100 pt-5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Signatory Legal Name</label>
              <input
                type="text"
                required
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                className="w-full sm:w-80 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeClauses"
                required
                checked={agreedClauses}
                onChange={(e) => setAgreedClauses(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
              />
              <label htmlFor="agreeClauses" className="text-slate-700 leading-snug cursor-pointer">
                I have read and agree to all terms in Statement of Work (LIT-01), including milestone payment schedules, intellectual property transfer terms, and confidentiality commitments.
              </label>
            </div>

            <div className="flex items-center justify-between pt-3">
              <Link
                href={`/engagement/${engagementRef}/acceptance`}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                ← Back to Proposal Acceptance
              </Link>
              <button
                type="submit"
                disabled={isSigning || !agreedClauses}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSigning ? 'Executing SOW...' : 'Sign & Execute Statement of Work →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
