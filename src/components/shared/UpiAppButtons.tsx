'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const emptySubscribe = () => () => {};
import {
  ShieldCheck,
  Copy,
  Check,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';

export interface UpiAppInfo {
  id: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
  name: string;
  schemeUrl: string;
  brandColor: string;
  logoImgUrl: string;
  iconImgUrl: string;
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
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedApp]);

  const encPa = encodeURIComponent(beneficiaryVpa);
  const encPn = encodeURIComponent(payeeName);
  const encAm = encodeURIComponent(amount);
  const encTr = encodeURIComponent(transactionRef);
  const encTn = encodeURIComponent(transactionNote);

  // Standard Universal UPI Query Parameters
  const standardQuery = `pa=${encPa}&pn=${encPn}&am=${encAm}&cu=INR&tr=${encTr}&tn=${encTn}`;

  // Complete Official Brand Images & Deep-Link Handshakes
  const apps: UpiAppInfo[] = [
    {
      id: 'gpay',
      name: 'Google Pay',
      schemeUrl: `gpay://upi/pay?${standardQuery}`,
      brandColor: '#4285F4',
      logoImgUrl: '/images/brand/gpay-logo.png',
      iconImgUrl: '/images/brand/gpay-icon.svg',
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      schemeUrl: `phonepe://upi/pay?${standardQuery}`,
      brandColor: '#5f259f',
      logoImgUrl: '/images/brand/phonepe-logo.png',
      iconImgUrl: '/images/brand/phonepe-icon.svg',
    },
    {
      id: 'paytm',
      name: 'Paytm',
      schemeUrl: `paytmmp://pay?${standardQuery}`,
      brandColor: '#002e6e',
      logoImgUrl: '/images/brand/paytm-logo.png',
      iconImgUrl: '/images/brand/paytm-icon.svg',
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      schemeUrl: `upi://pay?${standardQuery}`,
      brandColor: '#00796B',
      logoImgUrl: '/images/brand/bhim-logo.png',
      iconImgUrl: '/images/brand/bhim-icon.svg',
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
            className="group relative flex items-center justify-center h-12 px-3 rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-slate-400 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
            title={`Pay ₹${amount} with ${app.name}`}
            aria-label={`Pay with ${app.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={app.logoImgUrl}
              alt={app.name}
              className="h-5 max-h-5 w-auto max-w-[88%] object-contain transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* ── High-End Animated App Confirmation Modal ── */}
      {selectedApp && mounted && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 text-left my-auto relative"
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

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified UPI Handshake
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  Ref: {transactionRef.slice(0, 16)}
                </span>
              </div>

              {/* Perfectly Sized & Centered Brand Logo Card (100% visible, not cropped or zoomed) */}
              <div className="w-full bg-white rounded-2xl py-3 px-6 my-2.5 flex items-center justify-center shadow-xs border border-white/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedApp.logoImgUrl}
                  alt={selectedApp.name}
                  className="h-8 sm:h-9 w-auto max-w-[200px] max-h-9 object-contain mx-auto block"
                />
              </div>

              <p className="text-xs text-slate-200/90 mt-1">
                Initiating payment transfer for <strong className="text-white font-mono font-bold">₹{amount}</strong>
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

              {/* Modal Action Buttons with Authentic App Icon in Circular Badge */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href={selectedApp.schemeUrl}
                  onClick={() => {
                    setTimeout(() => setSelectedApp(null), 1500);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#1565C0] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${selectedApp.iconImgUrl}?v=20261016`}
                      alt={selectedApp.name}
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span>Open {selectedApp.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
