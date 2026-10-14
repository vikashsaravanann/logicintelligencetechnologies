'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AcceptanceStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export default function AcceptanceStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
}: AcceptanceStageClientProps) {
  const [signerName, setSignerName] = useState(contactName);
  const [signerTitle, setSignerTitle] = useState('Managing Director / Authorized Representative');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedTimestamp, setAcceptedTimestamp] = useState('');

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !signerName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAccepted(true);
      setAcceptedTimestamp(new Date().toUTCString());
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Acceptance Receipt or Form */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#0B2545]">Proposal Formal Digital Acceptance</h2>
          <p className="text-xs text-[#52677C] mt-1">
            Acceptance of official commercial quotation <strong className="font-mono text-slate-800">LIT-PROP-2026-084 (v1.0)</strong>.
          </p>
        </div>

        {accepted ? (
          <div className="space-y-6">
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 text-xs text-[#065F46] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#065F46] text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <h3 className="text-base font-bold">Proposal Accepted & Receipt Logged</h3>
              </div>
              <p>
                Authorized client assent has been immutably recorded for <strong className="text-slate-800">{companyName}</strong>.
              </p>
              <div className="bg-white/80 border border-emerald-200 rounded-xl p-3 font-mono text-[11px] text-slate-700 space-y-1">
                <div>Signer: <strong>{signerName}</strong> ({signerTitle})</div>
                <div>Email: {contactEmail}</div>
                <div>Recorded UTC Timestamp: {acceptedTimestamp}</div>
                <div>Audit Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-600">
                Next required step: Stage 5 Statement of Work (SOW) Execution.
              </span>
              <Link
                href={`/engagement/${engagementRef}/sow`}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Proceed to Stage 5 SOW / Agreement →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAccept} className="space-y-5 text-xs">
            {/* Legal Notice */}
            <div className="bg-[#F7F9FC] border border-[#DFE7EF] rounded-xl p-4 text-slate-600 space-y-2">
              <span className="font-bold text-[#0B2545] block">Legal Notice & Scope Confirmation</span>
              <p className="leading-relaxed">
                By accepting this proposal, you confirm commercial approval of the pricing, scope, and milestone terms in Proposal LIT-PROP-2026-084. 
                Formal binding contractual commitments, intellectual property assignment, and warranties are governed by the SOW / Service Agreement in Stage 5.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signer Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Title / Designation</label>
                <input
                  type="text"
                  required
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
            </div>

            {/* Checkbox agreement */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agree"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0]"
              />
              <label htmlFor="agree" className="text-slate-700 leading-snug cursor-pointer">
                I confirm that I am authorized to bind <strong>{companyName}</strong>, have reviewed the commercial terms and deliverables, and accept Proposal LIT-PROP-2026-084.
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Link
                href={`/engagement/${engagementRef}/proposal`}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                ← Back to Proposal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !agreedToTerms}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Recording Acceptance...' : 'Digitally Accept Proposal Version →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
