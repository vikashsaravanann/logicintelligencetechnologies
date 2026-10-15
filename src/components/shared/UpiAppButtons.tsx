'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Copy,
  Check,
  X,
  ExternalLink,
  Lock,
  ArrowRight,
  Info,
  Smartphone,
  AlertCircle,
} from 'lucide-react';

export interface UpiAppInfo {
  id: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
  name: string;
  schemeUrl: string;
  brandColor: string;
  brandBg: string;
  accentBorder: string;
  textColor: string;
  icon: React.ReactNode;
}

interface UpiAppButtonsProps {
  beneficiaryVpa: string;
  payeeName?: string;
  amount: string;
  transactionRef: string;
  transactionNote?: string;
  className?: string;
}

export function UpiAppButtons({
  beneficiaryVpa,
  payeeName = 'S VIKASH',
  amount,
  transactionRef,
  transactionNote = 'LIT Enterprise Settlement',
  className = '',
}: UpiAppButtonsProps) {
  const [selectedApp, setSelectedApp] = useState<UpiAppInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const encPa = encodeURIComponent(beneficiaryVpa);
  const encPn = encodeURIComponent(payeeName);
  const encAm = encodeURIComponent(amount);
  const encTr = encodeURIComponent(transactionRef);
  const encTn = encodeURIComponent(transactionNote);

  // Standard Universal UPI Query Parameters
  const standardQuery = `pa=${encPa}&pn=${encPn}&am=${encAm}&cu=INR&tr=${encTr}&tn=${encTn}`;

  // Dedicated App URLs
  const apps: UpiAppInfo[] = [
    {
      id: 'gpay',
      name: 'Google Pay',
      schemeUrl: `gpay://upi/pay?${standardQuery}`,
      brandColor: '#4285F4',
      brandBg: 'bg-white',
      accentBorder: 'border-slate-200 hover:border-[#4285F4]',
      textColor: 'text-slate-800',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.64v3h3.88c2.27-2.09 3.665-5.17 3.665-9.08z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.1C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.57H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.43l4.02-3.11z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.57l4.02 3.11c.95-2.83 3.6-4.93 6.72-4.93z"
          />
        </svg>
      ),
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      schemeUrl: `phonepe://pay?${standardQuery}`,
      brandColor: '#5f259f',
      brandBg: 'bg-[#5f259f]',
      accentBorder: 'border-[#521e8d]',
      textColor: 'text-white',
      icon: (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#5f259f">
            <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 8.36 4 5.33 6.59 4.64 10.04 1.94 10.55 0 12.87 0 15.5 0 18.53 2.47 21 5.5 21h13c3.03 0 5.5-2.47 5.5-5.5 0-2.63-1.94-4.95-4.64-5.46zM11 17l-4-4h2.5V9h3v4H15l-4 4z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'paytm',
      name: 'Paytm',
      schemeUrl: `paytmmp://pay?${standardQuery}`,
      brandColor: '#002e6e',
      brandBg: 'bg-white',
      accentBorder: 'border-slate-200 hover:border-[#002e6e]',
      textColor: 'text-slate-800',
      icon: (
        <div className="flex items-center text-[13px] font-black tracking-tight leading-none">
          <span className="text-[#002e6e]">Pay</span>
          <span className="text-[#00b9f5]">tm</span>
        </div>
      ),
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      schemeUrl: `upi://pay?${standardQuery}`,
      brandColor: '#00796B',
      brandBg: 'bg-gradient-to-r from-[#00796B] to-[#004D40]',
      accentBorder: 'border-[#004D40]',
      textColor: 'text-white',
      icon: (
        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
          <span className="text-[9px] font-black text-[#00796B]">₹</span>
        </div>
      ),
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenApp = (app: UpiAppInfo) => {
    // Open modal first to give clear confirmation instructions
    setSelectedApp(app);
  };

  const executeLaunch = () => {
    if (!selectedApp) return;
    window.location.href = selectedApp.schemeUrl;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Tap to Pay with Mobile UPI Apps:
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Instant Deep-Link</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => handleOpenApp(app)}
            className={`group relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl ${app.brandBg} ${app.accentBorder} ${app.textColor} border shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer`}
            title={`Pay ₹${amount} with ${app.name}`}
          >
            {app.icon}
            <span className="text-xs font-bold tracking-tight font-sans">
              {app.name === 'Google Pay' ? 'GPay' : app.name === 'BHIM UPI' ? 'BHIM' : app.name}
            </span>
          </button>
        ))}
      </div>

      {/* ── High-End Animated App Confirmation Modal ── */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header with Brand Gradient */}
            <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 text-white">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified UPI Handshake
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  Ref: {transactionRef.slice(0, 16)}
                </span>
              </div>

              <h3 className="text-lg font-extrabold tracking-tight font-poppins text-white flex items-center gap-2">
                <span>Launch {selectedApp.name}</span>
              </h3>
              <p className="text-xs text-slate-200/80 mt-1">
                You are initiating a direct verified transfer for <strong>₹{amount}</strong>
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Payment Summary Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Verified Payee:</span>
                  <span className="font-bold text-[#0B2545]">{payeeName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">UPI ID / VPA:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#1565C0]">{beneficiaryVpa}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(beneficiaryVpa, 'vpa')}
                      className="text-slate-400 hover:text-[#1565C0] p-1 rounded"
                      title="Copy UPI ID"
                    >
                      {copiedKey === 'vpa' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                  <span className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    Exact Payable Amount:
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#0B2545]">
                    ₹{amount}
                  </span>
                </div>
              </div>

              {/* Informative Guidance */}
              <div className="p-3.5 rounded-2xl bg-[#F0F7FF] border border-[#B9DCFF] text-xs text-slate-700 space-y-1.5">
                <span className="font-bold text-[#1565C0] block flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#1565C0]" />
                  What happens next?
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Clicking <strong>Open {selectedApp.name}</strong> will launch your installed banking app on mobile with the payee and amount pre-filled.
                </p>
                <p className="text-[10px] text-slate-500">
                  After successful completion, copy the 12-digit transaction UTR number and paste it in the audit queue form on this page to receive your instant Tax Invoice &amp; Receipt.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeLaunch}
                  className="px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#1565C0] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Open {selectedApp.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
