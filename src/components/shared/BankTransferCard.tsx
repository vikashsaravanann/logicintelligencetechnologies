'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const LIT_BANK_DETAILS = {
  bankName: 'Axis Bank',
  accountNumber: '926010028731995',
  accountHolder: 'S VIKASH',
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
      className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-[#97144D]/[0.03] via-white to-slate-50/80 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#97144D]/35 group ${className}`}
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

      {/* ── Perfectly Symmetrical Header with Official Axis Bank Logo & Stacked Verified Badge ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          {/* Official Real Axis Bank Vector Logo (Authentic geometry, NO green dot) */}
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#97144D]/25 p-1.5 flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/axis-bank-icon.svg"
              alt="Official Axis Bank Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#0B2545] font-poppins tracking-tight">
              Direct Bank Transfer (IMPS / NEFT / RTGS)
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
              Instant fund transfer directly via Net Banking or Bank Branch using verified credentials
            </p>
          </div>
        </div>

        {/* Clean, Equal Aligned "Axis Bank" & "Verified Account" Small Hint Below It */}
        <div className="shrink-0 flex flex-col items-start sm:items-end justify-center gap-1">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#97144D]/10 text-[#97144D] border border-[#97144D]/25 shadow-2xs whitespace-nowrap">
            Axis Bank
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90 whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Verified Account</span>
          </span>
        </div>
      </div>

      {/* ── 2x2 Equal Grid for Bank Details (All 4 cards have equal height and identical alignment) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
        {/* Box 1: Account Number */}
        <div className="min-h-[82px] p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/60 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Account Number
            </span>
            <span className="font-mono font-black text-sm text-[#0B2545] tracking-wider select-all whitespace-nowrap block mt-0.5">
              {LIT_BANK_DETAILS.accountNumber}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
              Current / Business Account
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.accountNumber, 'acc')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ml-2 ${
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

        {/* Box 2: IFSC Code */}
        <div className="min-h-[82px] p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/60 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              IFSC Code (RTGS / NEFT / IMPS)
            </span>
            <span className="font-mono font-black text-sm text-[#97144D] tracking-wider select-all whitespace-nowrap block mt-0.5">
              {LIT_BANK_DETAILS.ifscCode}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
              Real-Time Clearing Validated
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.ifscCode, 'ifsc')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ml-2 ${
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

        {/* Box 3: Primary Account Holder (Strictly Single Line S VIKASH) */}
        <div className="min-h-[82px] p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/60 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Primary Account Holder
            </span>
            <span className="font-mono font-black text-sm text-[#0B2545] select-all whitespace-nowrap block mt-0.5 tracking-wide">
              {LIT_BANK_DETAILS.accountHolder}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
              Authorized Corporate Signatory
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.accountHolder, 'holder')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ml-2 ${
              copiedKey === 'holder'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-slate-200 hover:border-[#97144D] hover:text-[#97144D] text-slate-400 bg-slate-50/60'
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

        {/* Box 4: Bank Name & Branch */}
        <div className="min-h-[82px] p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/60 hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Bank Name &amp; Branch
            </span>
            <span className="font-mono font-black text-sm text-[#0B2545] block truncate mt-0.5">
              {LIT_BANK_DETAILS.bankName} · Karur
            </span>
            <span className="text-[10px] text-slate-500 block font-mono truncate mt-0.5">
              {LIT_BANK_DETAILS.branch}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(`${LIT_BANK_DETAILS.bankName}, ${LIT_BANK_DETAILS.branch}`, 'bank')}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ml-2 ${
              copiedKey === 'bank'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-slate-200 hover:border-[#97144D] hover:text-[#97144D] text-slate-400 bg-slate-50/60'
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

      {/* ── Copy All Details Button & Settlement Protocol ── */}
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
