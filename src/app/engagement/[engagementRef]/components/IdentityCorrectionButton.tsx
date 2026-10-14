'use client';

import React, { useState } from 'react';

interface IdentityCorrectionButtonProps {
  engagementId: string;
  engagementRef: string;
  currentCompanyName: string;
}

export default function IdentityCorrectionButton({
  engagementId,
  engagementRef,
  currentCompanyName,
}: IdentityCorrectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetField, setTargetField] = useState('company_name');
  const [proposedValue, setProposedValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedValue || !changeReason || !requestedBy) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/engagements/identity-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          engagementRef,
          targetField,
          currentValue: currentCompanyName,
          proposedValue,
          changeReason,
          requestedBy,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message:
            'Correction proposal submitted successfully. In compliance with enterprise security, authoritative changes require Super Admin manual review and audit verification.',
        });
        setProposedValue('');
        setChangeReason('');
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to submit correction request. Please try again.',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Network error submitting request. Please contact hello@logicintelligencetechnologies.in.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-[#DFE7EF] text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
      >
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Request Correction</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0B2545]">Request Corporate Identity Correction</h3>
                <p className="text-xs text-[#52677C] mt-1">
                  Authoritative client details can only be modified by Super Admin verification.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {result?.success ? (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-xl text-xs text-[#065F46] space-y-3">
                <p className="font-semibold">✓ Request Logged into Super Admin Queue</p>
                <p>{result.message}</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setResult(null);
                  }}
                  className="w-full bg-[#065F46] text-white py-2 rounded-lg font-semibold hover:bg-[#044e39]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {result?.success === false && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    {result.message}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Field to Correct</label>
                  <select
                    value={targetField}
                    onChange={(e) => setTargetField(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  >
                    <option value="company_name">Legal Company Name</option>
                    <option value="registered_address">Registered Address</option>
                    <option value="gstin">GSTIN Identification</option>
                    <option value="pan">PAN Identification</option>
                    <option value="contact_name">Primary Contact Person</option>
                    <option value="contact_email">Official Contact Email</option>
                    <option value="contact_phone">Official Contact Phone</option>
                    <option value="billing_address">Billing / Invoice Address</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Corrected Value</label>
                  <input
                    type="text"
                    required
                    value={proposedValue}
                    onChange={(e) => setProposedValue(e.target.value)}
                    placeholder="e.g. Apex Meridian Technologies Private Limited"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Correction / Supporting Reference</label>
                  <textarea
                    required
                    rows={3}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="Provide official rationale (e.g. MCA incorporation certificate alignment or GST registration update)"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Full Name & Designation</label>
                  <input
                    type="text"
                    required
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Krishnan (Managing Director)"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1565C0] hover:bg-[#0B2545] text-white px-5 py-2 rounded-lg font-semibold shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Submitting to Queue...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
