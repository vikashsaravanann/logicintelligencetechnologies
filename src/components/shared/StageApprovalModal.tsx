'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Loader2,
  FileText,
  CreditCard,
} from 'lucide-react';

export interface StageApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void> | void;
  title: string;
  stageName: string;
  stageOrdinal?: number;
  companyName: string;
  isPaymentStage?: boolean;
  defaultNotes?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
}

export function StageApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  stageName,
  stageOrdinal,
  companyName,
  isPaymentStage = false,
  defaultNotes = '',
  inputLabel,
  inputPlaceholder,
}: StageApprovalModalProps) {
  const [notes, setNotes] = useState(defaultNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setNotes(defaultNotes);
      setError(null);
      setIsSubmitting(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultNotes]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaymentStage && !notes.trim()) {
      setError('Please provide the transaction reference (UTR / IMPS / NEFT ref) from your bank statement.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Decorative Header */}
        <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3" />
              Super Admin Authorization
            </span>
            {stageOrdinal && (
              <span className="text-[10px] font-mono text-slate-300">
                Milestone #{String(stageOrdinal).padStart(2, '0')}
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold tracking-tight font-poppins text-white">
            {title || `Approve & Unlock Stage`}
          </h3>
          <p className="text-xs text-slate-200/80 mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>Target Client: <strong className="text-white">{companyName}</strong></span>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Milestone Highlight Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              {isPaymentStage ? <CreditCard className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Stage
              </span>
              <p className="text-sm font-bold text-[#0B2545] truncate">
                {stageName}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isPaymentStage
                  ? 'Verifying bank statement reconciliation will unlock the subsequent milestone and generate compliant tax documents.'
                  : 'Approving this stage records your signature into the immutable audit ledger and unlocks the next milestone for the client.'}
              </p>
            </div>
          </div>

          {/* Input field (Notes or Bank Credit UTR) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0B2545]">
              {inputLabel ||
                (isPaymentStage
                  ? 'Receiving Bank Credit Transaction Reference (UTR / IMPS / NEFT) *'
                  : 'Super Admin Verification Notes & Audit Remarks *')}
            </label>
            {isPaymentStage ? (
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={inputPlaceholder || 'e.g. YESB26098234892'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all shadow-2xs"
                required
                autoFocus
              />
            ) : (
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={inputPlaceholder || 'Enter verification remarks or sign-off notes...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all shadow-2xs"
                required
                autoFocus
              />
            )}
            <p className="text-[10px] text-slate-500">
              {isPaymentStage
                ? 'Matches against YES Bank account credits to reconcile client deposit.'
                : 'This note is logged in the permanent audit trail and visible in stage history.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isPaymentStage
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-[#0B2545] hover:bg-[#1565C0] shadow-blue-900/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {isPaymentStage ? 'Confirm Bank Credit & Reconcile' : 'Confirm & Unlock Next Stage'}
                  </span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
