'use client';

import React from 'react';

export interface UpiAppConfig {
  id: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
  name: string;
  url: string;
  primaryColor: string;
  brandBg: string;
  textColor: string;
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
  const encPa = encodeURIComponent(beneficiaryVpa);
  const encPn = encodeURIComponent(payeeName);
  const encAm = encodeURIComponent(amount);
  const encTr = encodeURIComponent(transactionRef);
  const encTn = encodeURIComponent(transactionNote);

  // Standard UPI Query Parameters
  const standardQuery = `pa=${encPa}&pn=${encPn}&am=${encAm}&cu=INR&tr=${encTr}&tn=${encTn}`;

  // PhonePe official intent deep link accepts upi://pay with package specification or phonepe://pay
  // The universal Android & iOS standard URL scheme for PhonePe:
  const phonePeUrl = `phonepe://pay?${standardQuery}`;
  const gPayUrl = `gpay://upi/pay?${standardQuery}`;
  const paytmUrl = `paytmmp://pay?${standardQuery}`;
  const bhimUrl = `upi://pay?${standardQuery}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Tap to Pay with Mobile UPI Apps:
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Instant Deep-Link</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Google Pay */}
        <a
          href={gPayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-95"
          title={`Pay ₹${amount} with Google Pay`}
        >
          {/* Official Google 'G' Mark Logo */}
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
          <span className="text-xs font-bold text-slate-800 tracking-tight font-sans">
            GPay
          </span>
        </a>

        {/* PhonePe */}
        <a
          href={phonePeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#5f259f] hover:bg-[#521e8d] border border-[#521e8d] text-white shadow-2xs hover:shadow-xs transition-all active:scale-95"
          title={`Pay ₹${amount} with PhonePe (${beneficiaryVpa})`}
        >
          {/* Official PhonePe Devanagari Pe Symbol Icon */}
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#5f259f">
              <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 8.36 4 5.33 6.59 4.64 10.04 1.94 10.55 0 12.87 0 15.5 0 18.53 2.47 21 5.5 21h13c3.03 0 5.5-2.47 5.5-5.5 0-2.63-1.94-4.95-4.64-5.46zM11 17l-4-4h2.5V9h3v4H15l-4 4z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-white tracking-tight font-sans">
            PhonePe
          </span>
        </a>

        {/* Paytm */}
        <a
          href={paytmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-95"
          title={`Pay ₹${amount} with Paytm`}
        >
          {/* Official Paytm Two-Tone Emblem */}
          <div className="flex items-center text-[13px] font-black tracking-tight leading-none">
            <span className="text-[#002e6e]">Pay</span>
            <span className="text-[#00b9f5]">tm</span>
          </div>
        </a>

        {/* BHIM UPI */}
        <a
          href={bhimUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#00796B] to-[#004D40] hover:from-[#00695C] hover:to-[#003d33] border border-[#004D40] text-white shadow-2xs hover:shadow-xs transition-all active:scale-95"
          title={`Pay ₹${amount} with BHIM UPI`}
        >
          {/* BHIM Tri-Color Emblem */}
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-[#00796B]">₹</span>
          </div>
          <span className="text-xs font-bold text-white tracking-tight font-sans">
            BHIM
          </span>
        </a>
      </div>
    </div>
  );
}
