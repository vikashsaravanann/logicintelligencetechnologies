'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  FileText,
  Lock,
} from 'lucide-react';

interface IdentityCorrectionButtonProps {
  engagementId: string;
  engagementRef: string;
  currentCompanyName: string;
}

const FIELD_OPTIONS = [
  { value: 'company_name', label: 'Legal Company Name', hint: 'Updates Master Services Agreement & Tax Invoices' },
  { value: 'registered_address', label: 'Registered Corporate Address', hint: 'Statutory address as per MCA / Incorporation records' },
  { value: 'gstin', label: 'GSTIN Tax Identification', hint: '15-digit GSTIN for 100% Input Tax Credit (ITC) reconciliation' },
  { value: 'pan', label: 'PAN Identification', hint: '10-character corporate Permanent Account Number' },
  { value: 'contact_name', label: 'Primary Authorized Representative', hint: 'Executive signatory authorized to sign project milestones' },
  { value: 'contact_email', label: 'Official Communications Email', hint: 'Primary email receiving milestone & tax invoice alerts' },
  { value: 'contact_phone', label: 'Official Contact Phone', hint: 'Emergency direct dispatch & finance phone reference' },
  { value: 'billing_address', label: 'Billing / Invoicing Address', hint: 'Designated dispatch address for corporate billing' },
];

const FIELD_PLACEHOLDERS: Record<string, string> = {
  company_name: 'e.g. Apex Meridian Technologies Private Limited',
  registered_address: 'e.g. Block C, 4th Floor, Meridian Tech Park, Bengaluru, Karnataka 560100',
  gstin: 'e.g. 29AAAAA0000A1Z5 (15-digit statutory GSTIN)',
  pan: 'e.g. AAAAA0000A (10-character corporate PAN)',
  contact_name: 'e.g. Dr. Rajesh Krishnan',
  contact_email: 'e.g. rajesh.krishnan@apexmeridian.com',
  contact_phone: 'e.g. +91 98765 43210',
  billing_address: 'e.g. Accounts Dept, Apex Meridian Technologies, Mumbai 400001',
};

export default function IdentityCorrectionButton({
  engagementId,
  engagementRef,
  currentCompanyName,
}: IdentityCorrectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [targetField, setTargetField] = useState('company_name');
  const [proposedValue, setProposedValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const selectedFieldConfig = FIELD_OPTIONS.find((f) => f.value === targetField) || FIELD_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedValue.trim() || !changeReason.trim() || !requestedBy.trim()) return;

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
          proposedValue: proposedValue.trim(),
          changeReason: changeReason.trim(),
          requestedBy: requestedBy.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message:
            'Correction proposal successfully queued for Super Admin review. In accordance with enterprise governance guidelines, statutory identity amendments are verified and updated within 15–45 minutes.',
        });
        setProposedValue('');
        setChangeReason('');
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to submit correction request. Please review your input and try again.',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Network error submitting request. Please reach out directly to support@logicintelligencetechnologies.in.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-[#DFE7EF] hover:border-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
        title="Submit corporate identity correction proposal"
      >
        <svg className="w-3.5 h-3.5 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Request Correction</span>
      </button>

      {/* ── High-End Proportional Corporate Identity Correction Modal ── */}
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh] text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Decorative Banner */}
            <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 sm:px-7 sm:py-6 text-white shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Statutory Corporate Governance
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Ref: {engagementRef}
                </span>
              </div>

              <h3 className="text-xl font-bold font-poppins text-white tracking-tight">
                Request Corporate Identity Correction
              </h3>
              <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
                Submit official entity amendment proposals for legal agreement alignment and cryptographic audit reconciliation.
              </p>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
              {/* Active Entity Record Summary Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-[#F0F7FF] border border-slate-200/80 flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Entity on Active Record
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Clock className="w-3 h-3" />
                      SLA: 15–45 Mins
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0B2545] truncate mt-0.5">
                    {currentCompanyName || 'Client Corporate Entity'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    To prevent unauthorized contract tampering, all amendments require verified Super Admin audit review before propagating to legal Master Services Agreements and GST Tax Invoices.
                  </p>
                </div>
              </div>

              {/* Success Result State */}
              {result?.success ? (
                <div className="p-6 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-emerald-950 font-poppins">
                      Correction Proposal Logged into Audit Queue
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                      {result.message}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Done / Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {result?.success === false && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{result.message}</span>
                    </div>
                  )}

                  {/* Target Field Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                      <span>Target Statutory Field to Amend *</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Audit Parameter</span>
                    </label>
                    <div className="relative">
                      <select
                        value={targetField}
                        onChange={(e) => {
                          setTargetField(e.target.value);
                          setProposedValue('');
                        }}
                        className="w-full appearance-none bg-slate-50/80 hover:bg-slate-50 border border-slate-300/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all cursor-pointer pr-10"
                      >
                        {FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#1565C0]" />
                      {selectedFieldConfig.hint}
                    </p>
                  </div>

                  {/* Proposed Corrected Value */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5">
                      Proposed Corrected Value *
                    </label>
                    <input
                      type="text"
                      required
                      value={proposedValue}
                      onChange={(e) => setProposedValue(e.target.value)}
                      placeholder={FIELD_PLACEHOLDERS[targetField] || 'Enter verified statutory value'}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                    />
                  </div>

                  {/* Reason for Correction & Reference */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                      <span>Reason for Correction &amp; Official Reference *</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Supporting Basis</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="Provide official rationale (e.g. MCA Certificate of Incorporation alignment, GST REG-06 amendment, or Board Resolution ref)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all resize-none shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Submitter Name & Designation */}
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                      <span>Authorized Submitter Full Name &amp; Designation *</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Executive Signatory</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={requestedBy}
                      onChange={(e) => setRequestedBy(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Krishnan (Managing Director / CFO)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                    />
                  </div>

                  {/* Informative Security Callout */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Submitting this request writes a cryptographic entry into the audit log. Once approved by Super Admin, all subsequent milestone tax invoices, contracts, and receipts will immediately reflect the corrected identity.
                    </p>
                  </div>

                  {/* Modal Action Footer */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !proposedValue.trim() || !changeReason.trim() || !requestedBy.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1565C0] hover:from-[#123663] hover:to-[#1976D2] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Logging Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Correction Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
