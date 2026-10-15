'use client';

import React, { useState } from 'react';
import {
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Lock,
} from 'lucide-react';

export const LIT_BANK_DETAILS = {
  bankName: 'Axis Bank',
  accountNumber: '926010028731995',
  accountHolder: 'S Vikash',
  ifscCode: 'UTIB0006356',
  accountType: 'Current / Business Account',
  branch: 'Gandhigramam, Karur, Tamil Nadu',
};

interface BankTransferCardProps {
  className?: string;
  amount?: string;
  reference?: string;
}

export function BankTransferCard({ className = '', amount, reference }: BankTransferCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-[#97144D]/[0.04] via-white to-slate-50/80 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#97144D]/35 group ${className}`}
    >
      <style jsx>{`
        @keyframes litGlowSweep {
          0% {
            transform: translateX(-150%);
          }
          50%, 100% {
            transform: translateX(250%);
          }
        }
        .lit-shimmer-beam {
          animation: litGlowSweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* ── High-End Animated Dynamic Top Beam ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100 overflow-hidden">
        <div className="lit-shimmer-beam absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[#97144D] to-transparent shadow-[0_0_12px_#97144D]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Axis Bank Signature Burgundy Animated Avatar */}
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-[#97144D] to-[#730D39] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 font-serif ring-2 ring-[#97144D]/20 transition-transform group-hover:scale-105">
            <span>A</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#0B2545] font-poppins">
                Direct Bank Transfer (IMPS / NEFT / RTGS)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#97144D]/10 text-[#97144D] border border-[#97144D]/25 shadow-2xs">
                Axis Bank
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Instant fund transfer directly via Net Banking or Bank Branch using verified credentials
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Verified Account</span>
        </span>
      </div>

      {/* Account Details 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
        {/* Account Number */}
        <div className="group/item relative p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/60 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Account Number
            </span>
            <span className="font-mono font-black text-sm text-[#0B2545] tracking-wider select-all">
              {LIT_BANK_DETAILS.accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.accountNumber, 'acc')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              copiedKey === 'acc'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-slate-200 hover:border-[#97144D] hover:text-[#97144D] text-slate-400 bg-slate-50/60'
            }`}
            title="Copy Account Number"
            aria-label="Copy Account Number"
          >
            {copiedKey === 'acc' ? (
              <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* IFSC Code */}
        <div className="group/item relative p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/60 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              IFSC Code (RTGS / NEFT / IMPS)
            </span>
            <span className="font-mono font-black text-sm text-[#97144D] tracking-wider select-all">
              {LIT_BANK_DETAILS.ifscCode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.ifscCode, 'ifsc')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              copiedKey === 'ifsc'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-slate-200 hover:border-[#97144D] hover:text-[#97144D] text-slate-400 bg-slate-50/60'
            }`}
            title="Copy IFSC Code"
            aria-label="Copy IFSC Code"
          >
            {copiedKey === 'ifsc' ? (
              <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Primary Account Holder */}
        <div className="group/item relative p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Primary Account Holder
            </span>
            <span className="font-bold text-xs text-slate-900 select-all flex items-center gap-1.5">
              <span>{LIT_BANK_DETAILS.accountHolder}</span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">(Founder &amp; Principal)</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.accountHolder, 'holder')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              copiedKey === 'holder'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-slate-200 hover:border-slate-400 text-slate-400 bg-slate-50/60'
            }`}
            title="Copy Account Holder"
            aria-label="Copy Account Holder"
          >
            {copiedKey === 'holder' ? (
              <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Bank Name & Branch */}
        <div className="group/item relative p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Bank Name &amp; Branch
            </span>
            <span className="font-bold text-xs text-slate-900 block">
              {LIT_BANK_DETAILS.bankName}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              {LIT_BANK_DETAILS.branch}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(`${LIT_BANK_DETAILS.bankName}, ${LIT_BANK_DETAILS.branch}`, 'bank')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              copiedKey === 'bank'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-slate-200 hover:border-slate-400 text-slate-400 bg-slate-50/60'
            }`}
            title="Copy Bank Name & Branch"
            aria-label="Copy Bank Name & Branch"
          >
            {copiedKey === 'bank' ? (
              <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Copy All Details Button & Informative Settlement Assurance */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]">
        <span className="text-slate-500 leading-tight">
          After completing transfer, enter your <strong>12-digit transaction UTR</strong> in the verification queue.
        </span>
        <button
          type="button"
          onClick={() =>
            handleCopy(
              `Bank Name: ${LIT_BANK_DETAILS.bankName}\nAccount Number: ${LIT_BANK_DETAILS.accountNumber}\nPrimary Account Holder: ${LIT_BANK_DETAILS.accountHolder}\nIFSC Code: ${LIT_BANK_DETAILS.ifscCode}\nBranch: ${LIT_BANK_DETAILS.branch}`,
              'all'
            )
          }
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold text-xs transition-all duration-200 shadow-2xs cursor-pointer shrink-0 active:scale-95 ${
            copiedKey === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'border-[#97144D]/35 bg-white hover:bg-[#97144D]/10 text-[#97144D]'
          }`}
        >
          {copiedKey === 'all' ? (
            <>
              <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-75 duration-150" />
              <span>All Bank Details Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Bank Details</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
