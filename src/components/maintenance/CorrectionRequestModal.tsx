'use client';

import React, { useState } from 'react';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagementId: string;
  stageNumber?: number;
  documentRef?: string;
  companyName: string;
}

export default function CorrectionRequestModal({
  isOpen,
  onClose,
  engagementId,
  stageNumber = 13,
  documentRef,
  companyName,
}: CorrectionRequestModalProps) {
  const [affectedField, setAffectedField] = useState('Company Legal Name');
  const [previousValue, setPreviousValue] = useState('');
  const [requestedValue, setRequestedValue] = useState('');
  const [explanation, setExplanation] = useState('');
  const [supportingEvidenceUrl, setSupportingEvidenceUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affectedField.trim() || !requestedValue.trim() || !explanation.trim()) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/subscriptions/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          stageNumber,
          documentRef: documentRef || 'LIT-07-Maintenance-Agreement',
          affectedField: affectedField.trim(),
          previousValue: previousValue.trim() || undefined,
          requestedValue: requestedValue.trim(),
          explanation: explanation.trim(),
          supportingEvidenceUrl: supportingEvidenceUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.correction) {
        setSubmittedRef(data.correction.request_ref);
      } else {
        setErrorMessage(data.error || 'Failed to submit correction request.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B2545] text-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Phase 8 Change Control
            </span>
            <h3 className="text-base font-bold mt-0.5">Submit Identity & Data Correction</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {submittedRef ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Correction Request Logged</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your request has been routed to the Super Admin review queue with reference:
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-xs font-bold text-slate-800">
                  {submittedRef}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Per governance policy, issued financial and contractual records are never mutated silently. Approved corrections propagate to future generated artifacts.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-lg hover:bg-[#1565C0] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Field / Attribute *</label>
                <select
                  value={affectedField}
                  onChange={(e) => setAffectedField(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Company Legal Name">Company Legal Name</option>
                  <option value="Authorized Signatory / Contact">Authorized Signatory / Contact</option>
                  <option value="Billing Email & Address">Billing Email & Address</option>
                  <option value="GSTIN Identification">GSTIN Identification</option>
                  <option value="Project Technical Requirements">Project Technical Requirements</option>
                  <option value="Milestone Scope Item">Milestone Scope Item</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Previous / Current Recorded Value</label>
                <input
                  type="text"
                  placeholder="e.g. Current misspelled company name"
                  value={previousValue}
                  onChange={(e) => setPreviousValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested Corrected Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Correct legal entity name"
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Supporting Justification *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this change is required..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supporting Document URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={supportingEvidenceUrl}
                  onChange={(e) => setSupportingEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0B2545] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
