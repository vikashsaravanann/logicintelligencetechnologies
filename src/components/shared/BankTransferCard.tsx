'use client';

import React, { useState } from 'react';
import { Building2, Copy, Check, ShieldCheck, ArrowRight, Sparkles, CreditCard, ExternalLink } from 'lucide-react';

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
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#97144D]/5 via-white to-slate-50 p-4 sm:p-5 shadow-xs transition-all hover:border-[#97144D]/40 group ${className}`}
    >
      {/* Animated Subtle Ambient Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#97144D] via-[#D32F2F] to-[#1565C0] animate-pulse" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Axis Bank Signature Burgundy Badge */}
          <div className="w-8 h-8 rounded-xl bg-[#97144D] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-serif">
            <span>A</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-[#0B2545] font-poppins">
                Direct Bank Transfer (IMPS / NEFT / RTGS)
              </h4>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#97144D]/10 text-[#97144D] border border-[#97144D]/20">
                Axis Bank
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Transfer funds directly via Net Banking or Bank Branch using these verified details
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Verified Account
        </span>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3.5 text-xs">
        {/* Account Number */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/50 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Account Number
            </span>
            <span className="font-mono font-extrabold text-sm text-[#0B2545] tracking-wider select-all">
              {LIT_BANK_DETAILS.accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.accountNumber, 'acc')}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-[#97144D] hover:text-[#97144D] text-slate-500 transition-colors cursor-pointer bg-slate-50/50"
            title="Copy Account Number"
            aria-label="Copy Account Number"
          >
            {copiedKey === 'acc' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* IFSC Code */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-[#97144D]/50 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              IFSC Code (RTGS / NEFT / IMPS)
            </span>
            <span className="font-mono font-extrabold text-sm text-[#97144D] tracking-wider select-all">
              {LIT_BANK_DETAILS.ifscCode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.ifscCode, 'ifsc')}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-[#97144D] hover:text-[#97144D] text-slate-500 transition-colors cursor-pointer bg-slate-50/50"
            title="Copy IFSC Code"
            aria-label="Copy IFSC Code"
          >
            {copiedKey === 'ifsc' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Primary Account Holder */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Primary Account Holder
            </span>
            <span className="font-bold text-xs text-slate-900 select-all">
              {LIT_BANK_DETAILS.accountHolder}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.accountHolder, 'holder')}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-500 transition-colors cursor-pointer bg-slate-50/50"
            title="Copy Account Holder"
            aria-label="Copy Account Holder"
          >
            {copiedKey === 'holder' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Bank & Branch Name */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Bank Name &amp; Branch
            </span>
            <span className="font-bold text-xs text-slate-900 block">
              {LIT_BANK_DETAILS.bankName}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {LIT_BANK_DETAILS.branch}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIT_BANK_DETAILS.bankName, 'bank')}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-500 transition-colors cursor-pointer bg-slate-50/50"
            title="Copy Bank Name"
            aria-label="Copy Bank Name"
          >
            {copiedKey === 'bank' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Copy All Details Button */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-500">
          After completing transfer, enter the <strong>UTR reference number</strong> in the submission form.
        </span>
        <button
          type="button"
          onClick={() =>
            handleCopy(
              `Bank: ${LIT_BANK_DETAILS.bankName}\nAccount Number: ${LIT_BANK_DETAILS.accountNumber}\nAccount Holder: ${LIT_BANK_DETAILS.accountHolder}\nIFSC Code: ${LIT_BANK_DETAILS.ifscCode}`,
              'all'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#97144D]/30 bg-white hover:bg-[#97144D]/5 text-[#97144D] font-bold text-xs transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          {copiedKey === 'all' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">All Details Copied!</span>
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
