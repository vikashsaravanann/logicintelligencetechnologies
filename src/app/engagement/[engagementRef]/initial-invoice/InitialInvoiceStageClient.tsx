'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UpiAppButtons } from '@/components/shared/UpiAppButtons';
import { BankTransferCard } from '@/components/shared/BankTransferCard';

interface InitialInvoiceStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  qrDataUrl?: string;
  upiDeepLink?: string;
  transactionRef?: string;
  secureToken?: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
}

export default function InitialInvoiceStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  qrDataUrl,
  upiDeepLink,
  transactionRef = `LIT-PAY-${engagementRef}-INIT`,
  secureToken,
  initialStatus = 'available',
  initialData = {},
}: InitialInvoiceStageClientProps) {
  const router = useRouter();
  const [utrNumber, setUtrNumber] = useState(initialData?.utrNumber || '');
  const [paymentDate, setPaymentDate] = useState(initialData?.paymentDate || new Date().toISOString().split('T')[0]);
  const [remitterName, setRemitterName] = useState(initialData?.remitterName || contactName);
  const [remitterBank, setRemitterBank] = useState(initialData?.remitterBank || 'State Bank of India');
  const [gstin, setGstin] = useState(initialData?.gstin || '');
  const [placeOfSupply, setPlaceOfSupply] = useState(initialData?.placeOfSupply || 'Tamil Nadu (33)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(
    ['under_review', 'customer_claimed_paid', 'paid', 'verified', 'completed'].includes(initialStatus)
  );
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const paymentData = {
    requestRef: transactionRef,
    milestone: 'Initial Deposit (50% Project Commitment)',
    subtotal: '₹9,00,000.00',
    cgst: '₹81,000.00 (9%)',
    sgst: '₹81,000.00 (9%)',
    totalPayable: '₹10,62,000.00',
    totalNumeric: '1062000.00',
    beneficiaryVpa: '9342877474@ptyes',
    beneficiaryName: 'S VIKASH',
    msmeRegistration: 'UDYAM-TN-03-0345274',
    brandName: 'Logic Intelligence Technologies',
    bankName: 'YES BANK / PTYES',
    upiDeepLink: upiDeepLink || `upi://pay?pa=9342877474@ptyes&pn=S%20VIKASH&am=1062000.00&cu=INR&tr=${transactionRef}&tn=Initial%20Deposit%2050`,
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || !remitterName) {
      setErrorMessage('Please provide both the 12-digit UTR reference number and remitter account name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/initial-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report_utr',
          payload: {
            utrNumber: utrNumber.trim(),
            paymentDate,
            remitterName: remitterName.trim(),
            remitterBank: remitterBank.trim(),
            gstin: gstin.trim(),
            placeOfSupply: placeOfSupply.trim(),
            amountReported: paymentData.totalPayable,
            beneficiaryVpa: paymentData.beneficiaryVpa,
            beneficiaryName: paymentData.beneficiaryName,
            msmeRegistration: paymentData.msmeRegistration,
            transactionRef: paymentData.requestRef,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment reference');
      }

      setIsReported(true);
      setAuditHash(data.auditHash);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error reporting payment';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPI deep links for quick mobile app opening
  const mobileIntentApps = [
    { name: 'GPay', url: `gpay://upi/pay?pa=${paymentData.beneficiaryVpa}&pn=S%20VIKASH&am=${paymentData.totalNumeric}&cu=INR&tr=${paymentData.requestRef}` },
    { name: 'PhonePe', url: `phonepe://pay?pa=${paymentData.beneficiaryVpa}&pn=S%20VIKASH&am=${paymentData.totalNumeric}&cu=INR&tr=${paymentData.requestRef}` },
    { name: 'Paytm', url: `paytmmp://pay?pa=${paymentData.beneficiaryVpa}&pn=S%20VIKASH&am=${paymentData.totalNumeric}&cu=INR&tr=${paymentData.requestRef}` },
    { name: 'BHIM', url: `upi://pay?pa=${paymentData.beneficiaryVpa}&pn=S%20VIKASH&am=${paymentData.totalNumeric}&cu=INR&tr=${paymentData.requestRef}` },
  ];

  return (
    <div className="space-y-6">
      {/* Global CSS Animation for High-Tech Futuristic Laser Scanline */}
      <style>{`
        @keyframes litQrLaserSweep {
          0% {
            top: 6px;
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            top: calc(100% - 8px);
            opacity: 0;
          }
        }
        .lit-qr-laser-line {
          animation: litQrLaserSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Financial Security & Direct Bank Transfer Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545] shadow-2xs">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <span className="font-bold text-sm block">
            Direct UPI &amp; Bank Transfer Clearing · Zero Gateway Deductions · Super Admin Real-Time Reconciliation
          </span>
          <p className="mt-1 text-slate-600 leading-relaxed text-xs">
            All enterprise settlements are executed via direct bank-grade UPI, IMPS, NEFT, or RTGS transfer directly to our verified accounts (Axis Bank Current A/C: <strong className="font-mono text-slate-900">926010028731995</strong> · IFSC: <strong className="font-mono text-slate-900">UTIB0006356</strong> / YES Bank UPI: <strong className="font-mono text-slate-900">9342877474@ptyes</strong>). No third-party payment gateway or aggregator holds custody of client project funds. Upon bank ledger reconciliation, your GST Rule 46 compliant Advance Tax Invoice and digitally signed Payment Receipt are issued immediately.
          </p>
        </div>
      </div>

      {/* Symmetrical 50/50 Balanced Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* ── LEFT COLUMN (50%): Dynamic Animated UPI QR & Verified Payee Transparency ── */}
        <div className="bg-white rounded-3xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            {/* Stage & Invoice Identifier */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded-md border border-[#B9DCFF]">
                {paymentData.requestRef}
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Stage 06 · Milestone 1
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2545] font-poppins">
                {paymentData.milestone}
              </h3>
              <p className="text-xs text-[#52677C] mt-0.5">
                Billed to: <strong className="text-slate-800">{companyName}</strong> ({contactEmail})
              </p>
            </div>

            {/* Financial Amount Breakdown */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Milestone Subtotal (50%):</span>
                <span className="font-mono font-semibold text-slate-800">{paymentData.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Central GST (CGST 9%):</span>
                <span className="font-mono font-medium text-slate-700">{paymentData.cgst}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State GST (SGST 9%):</span>
                <span className="font-mono font-medium text-slate-700">{paymentData.sgst}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center font-bold text-[#0B2545]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Payable Amount:</span>
                <span className="font-mono text-lg font-extrabold text-[#1565C0]">{paymentData.totalPayable}</span>
              </div>
            </div>

            {/* Dynamic Amount-Locked Animated UPI QR Card */}
            <div className="bg-gradient-to-b from-[#F0F7FF] to-white border-2 border-dashed border-[#B9DCFF] rounded-3xl p-6 text-center space-y-4 shadow-2xs relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#1565C0] uppercase tracking-wider">
                  Amount-Specific UPI QR
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Locked: ₹10,62,000.00
                </span>
              </div>

              {/* Viewfinder Target Container with Scanline Animation */}
              <div className="relative mx-auto w-52 h-52 sm:w-56 sm:h-56 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-md flex items-center justify-center overflow-hidden">
                {/* 4 Corner Targeting Viewfinder Brackets */}
                <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#1565C0] rounded-tl-sm pointer-events-none" />
                <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#1565C0] rounded-tr-sm pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#1565C0] rounded-bl-sm pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#1565C0] rounded-br-sm pointer-events-none" />

                {/* Sweeping Laser Scanline */}
                <div className="lit-qr-laser-line absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#1FA9A2] to-transparent shadow-[0_0_12px_#1FA9A2,0_0_4px_#1565C0] pointer-events-none z-10" />

                {/* High-Resolution Dynamic QR Image */}
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="LIT Dynamic Amount-Locked UPI QR Code"
                    className="w-full h-full object-contain relative z-0"
                  />
                ) : (
                  <div className="text-xs text-slate-400 font-mono flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 animate-spin text-[#1565C0]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating verified QR…</span>
                  </div>
                )}
              </div>

              {/* Exact Amount Copy Bar */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleCopy(paymentData.totalNumeric, 'amount')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-semibold text-[#0B2545] shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <span className="text-emerald-600 font-bold">✓ Amount Copied (₹10,62,000.00)</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Exact Amount: {paymentData.totalPayable}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile UPI App Fast Launchers with Authentic Brand Buttons */}
              <div className="pt-2 border-t border-blue-100">
                <UpiAppButtons
                  beneficiaryVpa={paymentData.beneficiaryVpa}
                  payeeName={paymentData.beneficiaryName}
                  amount={paymentData.totalNumeric}
                  transactionRef={paymentData.requestRef}
                  transactionNote="LIT Initial Deposit 50%"
                />
              </div>
            </div>
          </div>

          {/* Dynamic QR Clearance & Settlement Protocol - Occupies vertical gap with essential payment instructions */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-[#0B2545] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Dynamic QR Clearance &amp; Verification Protocol
              </span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Zero Gateway Deductions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] leading-relaxed">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                  Amount-Locked Payload
                </div>
                <p className="text-slate-600">
                  Exact billing amount (<strong className="text-slate-800 font-mono">{paymentData.totalPayable}</strong>) and VPA are pre-encoded in the QR to prevent manual entry errors.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Universal UPI Scanner
                </div>
                <p className="text-slate-600">
                  Scan via iOS Camera, Android Camera, or any UPI app (GPay, PhonePe, Paytm, BHIM, Cred, or bank apps).
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA9A2]" />
                  Direct Bank Settlement
                </div>
                <p className="text-slate-600">
                  Settles directly into our primary reserve account via NPCI with 0% third-party gateway deductions.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  12-Digit UTR Handshake
                </div>
                <p className="text-slate-600">
                  Copy the 12-digit Bank Reference (UTR) from your payment confirmation and submit on the right for instant audit clearance.
                </p>
              </div>
            </div>
          </div>

          {/* Verified Payee Credentials Block */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-[#0B2545] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verified Payee Details
              </span>
              <span className="font-mono text-[10px] text-slate-500 uppercase">Statutory Micro Enterprise</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Beneficiary Account Holder</span>
                <strong className="text-slate-900 font-semibold">{paymentData.beneficiaryName}</strong> (Founder)
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Receiving Bank</span>
                <strong className="text-slate-900 font-semibold">{paymentData.bankName}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Corporate Brand</span>
                <strong className="text-slate-900 font-semibold">{paymentData.brandName}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">MSME Registration</span>
                <strong className="font-mono text-slate-900">{paymentData.msmeRegistration}</strong>
              </div>
            </div>

            {/* Copy Verified UPI VPA Bar */}
            <div className="pt-2 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">UPI ID / VPA</span>
                <span className="font-mono font-bold text-sm text-[#0B2545]">{paymentData.beneficiaryVpa}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(paymentData.beneficiaryVpa, 'upi')}
                className="px-3 py-1.5 bg-[#E7F3FF] hover:bg-[#D0E7FF] text-[#1565C0] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedField === 'upi' ? '✓ Copied!' : 'Copy UPI ID'}
              </button>
            </div>

            {/* Direct Axis Bank Transfer & IFSC Card */}
            <div className="pt-2">
              <BankTransferCard amount={paymentData.totalPayable} reference={paymentData.requestRef} />
            </div>

            {secureToken && (
              <div className="pt-2">
                <Link
                  href={`/payment/${secureToken}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#0B2545] hover:bg-[#1565C0] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
                >
                  <span>Open Dedicated Client Payment Gateway</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (50%): UTR Reference Submission & Bank Verification Form ── */}
        <div className="bg-white rounded-3xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs flex flex-col h-full space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0]" />
                <h3 className="text-lg font-bold text-[#0B2545] font-poppins">
                  Report Bank Transfer & Submit UTR
                </h3>
              </div>
              <p className="text-xs text-[#52677C] leading-relaxed">
                After executing the UPI or IMPS/NEFT transfer, enter your 12-digit transaction reference (UTR) to log your payment into the Super Admin audit queue.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {isReported ? (
              /* Verified / Under Audit State View */
              <div className="space-y-5">
                <div className="bg-gradient-to-b from-amber-50 to-orange-50/50 border border-amber-200 rounded-3xl p-6 text-xs text-amber-950 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      ⏳
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-amber-950">
                        Payment Reported · Under Super Admin Audit
                      </h4>
                      <span className="text-[11px] text-amber-800">
                        Queued for YES Bank ledger reconciliation
                      </span>
                    </div>
                  </div>

                  <p className="leading-relaxed text-amber-900">
                    Your UTR reference <strong className="font-mono text-slate-950 px-1.5 py-0.5 bg-white rounded border border-amber-300">{utrNumber}</strong> has been logged into the financial clearing ledger.
                    In strict accordance with LIT governance, funds must reflect in our receiving account before status transitions to verified.
                  </p>

                  <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 font-mono text-xs text-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reported Remitter:</span>
                      <strong className="text-slate-900">{remitterName} ({remitterBank})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transfer Date:</span>
                      <span>{paymentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Claimed Amount:</span>
                      <span className="font-bold text-[#1565C0]">{paymentData.totalPayable}</span>
                    </div>
                    {auditHash && (
                      <div className="pt-2 border-t border-slate-100 break-all text-[11px] text-slate-600">
                        Audit Hash: <strong>{auditHash}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#86EFAC] rounded-2xl text-xs space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#166534] font-bold text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Automated Next Step Activation</span>
                  </div>
                  <p className="text-[#166534] leading-relaxed">
                    Upon Super Admin reconciliation, Stage 07 (Client Onboarding) and repository access provisioning will automatically activate.
                  </p>
                  <div className="pt-1">
                    <Link
                      href={`/engagement/${engagementRef}/onboarding`}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl font-semibold shadow-xs transition-colors"
                    >
                      <span>Check Stage 07 Status →</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Payment Submission Form */
              <form onSubmit={handleReportPayment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      UPI / Bank UTR Reference <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 428812345678"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:bg-white outline-none transition-all"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">12-digit UPI UTR or bank transaction reference</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Transfer Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Remitter / Payer Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={remitterName}
                      onChange={(e) => setRemitterName(e.target.value)}
                      placeholder="e.g. Acme Health Corp"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Remitting Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={remitterBank}
                      onChange={(e) => setRemitterBank(e.target.value)}
                      placeholder="e.g. HDFC Bank, ICICI, SBI"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Client GSTIN (For Input Tax Credit)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="33AAAAA0000A1Z5"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-mono text-slate-900 uppercase focus:ring-2 focus:ring-[#1565C0] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Place of Supply (GST Destination)
                    </label>
                    <input
                      type="text"
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#1565C0] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 leading-relaxed">
                  <strong>Statutory Notice:</strong> Submitting your reference records the transaction into the cryptographic audit log. It queues the payment for manual reconciliation against our YES Bank statement. The official Tax Invoice is issued upon verified credit.
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !utrNumber.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#0B2545] hover:bg-[#1565C0] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Recording UTR in Audit Ledger…</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Payment Reference for Super Admin Verification →</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ── Client Informational & Verification Guidance Cards (Fills Bottom Gap Completely) ── */}
                <div className="pt-2 space-y-3.5 border-t border-slate-100 flex-1 flex flex-col justify-between">
                  {/* Card 1: Bank Reconciliation SLA & Protocol */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1FA9A2]" />
                        Verification Timeline &amp; SLA
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        15–45 Mins SLA
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      UTR submissions are instantly routed to our Super Admin audit ledger. Our finance desk matches incoming credits directly against our YES Bank / Axis Bank clearing feeds during banking hours (9:00 AM – 7:30 PM IST).
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-white p-2 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block text-[10px]">Tax Invoice Issuance</span>
                        <span className="font-semibold text-slate-800">GST Rule 46 Compliant</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/70">
                        <span className="text-slate-400 block text-[10px]">Next Milestone Unlock</span>
                        <span className="font-semibold text-[#1565C0]">Stage 07 (Onboarding)</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Enterprise Statutory Compliance & Input Tax Credit Assurance */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
                        Statutory Tax &amp; Audit Assurance
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                        100% ITC Eligible
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      All settlements are legally documented under Indian corporate guidelines. Official GST Tax Invoice issued with SAC Code <strong>998314</strong> (Information Technology Design &amp; Development Services).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                          Input Tax Credit (ITC)
                        </span>
                        <p className="text-[11px] text-slate-700 leading-snug">
                          Eligible for complete GST input tax credit with automated GSTR-1 return filing by the 11th of each month.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                          Cryptographic Ledger
                        </span>
                        <p className="text-[11px] text-slate-700 leading-snug">
                          Immutable SHA-256 audit digest generated for every UTR, preventing ledger discrepancies or duplicate entries.
                        </p>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>MSME: UDYAM-TN-03-0345274</span>
                      <span>Karur Jurisdiction, Tamil Nadu</span>
                    </div>
                  </div>

                  {/* Card 3: Frequently Asked Client Queries & Support Desk */}
                  <div className="p-4 rounded-2xl bg-[#F0F7FF]/70 border border-[#B9DCFF]/70 space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-[#1565C0] uppercase tracking-wider block">
                      Transfer Assistance &amp; Helpdesk
                    </span>
                    <ul className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#1565C0] font-bold">·</span>
                        <span><strong>Direct Axis Bank Transfer:</strong> Transfer via IMPS/NEFT using Current A/C <code className="bg-white px-1 py-0.5 rounded text-[#0B2545] font-mono font-bold">926010028731995</code> (IFSC: <code className="bg-white px-1 py-0.5 rounded text-[#0B2545] font-mono font-bold">UTIB0006356</code>).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#1565C0] font-bold">·</span>
                        <span><strong>Instant Receipt &amp; PDF:</strong> After Super Admin reconciliation, your digitally-stamped Payment Receipt (LIT-06) will be automatically downloadable from your Client Documents portal.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#1565C0] font-bold">·</span>
                        <span><strong>Direct Finance Support:</strong> Reach out directly to <strong className="text-slate-800">support@logicintelligencetechnologies.in</strong> for immediate assistance or invoice re-issuance.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Card 4: Corporate Treasury & RTGS / NEFT Settlement Protocol */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-[#F8FAFC] border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
                        Corporate Treasury &amp; RTGS Protocol
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        Zero Upper Limit
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      For high-value commercial milestones exceeding standard UPI ceilings (₹1,00,000 / ₹5,00,000), corporate Net Banking via RTGS/NEFT provides instantaneous, real-time clearing under Reserve Bank of India gross settlement guidelines.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          TDS Compliance (Sec 194C / 194J)
                        </span>
                        <p className="text-[11px] text-slate-700 leading-snug">
                          Corporate clients deducting TDS at statutory rates can submit Form 16A quarterly certificates directly to accounts desk.
                        </p>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          Priority Resolution Guarantee
                        </span>
                        <p className="text-[11px] text-slate-700 leading-snug">
                          In case of banking network holding, founder reconciliation desk guarantees resolution within 30 minutes.
                        </p>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
                      <span>Treasury Desk: support@logicintelligencetechnologies.in</span>
                      <span>Operating: 09:00 AM – 07:30 PM IST</span>
                    </div>
                  </div>

                  {/* Card 5: Milestone Escrow & Commercial Protection (Completely Fills Bottom Right Space) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B2545]/[0.02] via-white to-slate-50 border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1FA9A2]" />
                        Bilateral Milestone Escrow Protection
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
                        MSA Protected
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Transferred funds are secured under active Master Services Agreement terms. Milestone release triggers Stage 07 client onboarding, Jira sprint workspace activation, and dedicated GitLab/GitHub code repository access.
                    </p>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          Statutory Enterprise Entity
                        </span>
                        <span className="font-semibold text-slate-800">
                          Logic Intelligence Technologies
                        </span>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-500">
                        <div>UDYAM-TN-03-0345274</div>
                        <div>Karur, Tamil Nadu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
