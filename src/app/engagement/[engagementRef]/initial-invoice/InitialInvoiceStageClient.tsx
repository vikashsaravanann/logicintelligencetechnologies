'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface InitialInvoiceStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export default function InitialInvoiceStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
}: InitialInvoiceStageClientProps) {
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-10-14');
  const [remitterName, setRemitterName] = useState(contactName);
  const [remitterBank, setRemitterBank] = useState('State Bank of India');
  const [gstin, setGstin] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Tamil Nadu (33)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const paymentData = {
    requestRef: 'LIT-PAY-2026-INIT-84',
    milestone: 'Initial Deposit (50% Project Commitment)',
    subtotal: '₹9,00,000.00',
    cgst: '₹81,000.00 (9%)',
    sgst: '₹81,000.00 (9%)',
    totalPayable: '₹10,62,000.00',
    totalNumeric: '1062000.00',
    beneficiaryVpa: '9342877474@ptyes',
    beneficiaryName: 'S VIKASH',
    brandName: 'Logic Intelligence Technologies',
    upiDeepLink: 'upi://pay?pa=9342877474@ptyes&pn=S%20VIKASH&am=1062000.00&cu=INR&tn=LIT-PAY-2026-INIT-84',
  };

  const handleReportPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || !remitterName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReported(true);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Financial Security Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545]">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <span className="font-bold block">Zero Automated Payment Gateways · Manual Super-Admin Bank Verification</span>
          <p className="mt-1 text-slate-600 leading-relaxed">
            All enterprise settlements are cleared manually via direct UPI/NEFT transfer to the Founder receiving account. 
            No third-party payment gateway or card aggregator has custody of your funds. 
            Super Admin verifies receiving bank credit before issuing the Advance Payment Receipt / Tax Invoice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Payment Summary & Dynamic UPI QR */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-5">
          <div>
            <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded">
              {paymentData.requestRef}
            </span>
            <h3 className="text-base font-bold text-[#0B2545] mt-2">
              {paymentData.milestone}
            </h3>
            <p className="text-xs text-[#52677C]">
              Billed to: {companyName}
            </p>
          </div>

          {/* Amount Breakdown Table */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Subtotal (50%):</span>
              <span className="font-mono font-medium">{paymentData.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST (9%):</span>
              <span className="font-mono font-medium">{paymentData.cgst}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST (9%):</span>
              <span className="font-mono font-medium">{paymentData.sgst}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#0B2545] text-sm">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-base text-[#1565C0]">{paymentData.totalPayable}</span>
            </div>
          </div>

          {/* Dynamic Amount-Specific UPI QR Code */}
          <div className="bg-white border-2 border-dashed border-[#B9DCFF] rounded-2xl p-5 text-center space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Scan Exact Amount UPI QR Code
            </span>
            <div className="relative w-48 h-48 mx-auto bg-white rounded-xl overflow-hidden border border-slate-200 p-2 shadow-xs flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentData.upiDeepLink)}`}
                alt="LIT Dynamic Amount UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold font-mono text-[#0B2545] text-sm">
                {paymentData.beneficiaryVpa}
              </div>
              <div className="text-slate-500 text-[11px]">
                Payee: <strong>{paymentData.beneficiaryName}</strong> ({paymentData.brandName})
              </div>
            </div>

            {/* Copy UPI ID button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(paymentData.beneficiaryVpa);
                alert('Beneficiary UPI ID copied: ' + paymentData.beneficiaryVpa);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Verified UPI ID</span>
            </button>
          </div>
        </div>

        {/* Right Column: Billing Information & UTR Submission */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">Report Bank Transfer & Submit UTR Reference</h3>
            <p className="text-xs text-[#52677C] mt-1">
              After transferring funds from your banking app, submit your transaction reference (UTR) for Super Admin manual clearance.
            </p>
          </div>

          {isReported ? (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    ⏳
                  </span>
                  <h4 className="text-base font-bold text-amber-950">Payment Reported · Under Bank Credit Verification</h4>
                </div>
                <p>
                  UTR reference <strong className="font-mono text-slate-900">{utrNumber}</strong> has been logged into the Super Admin audit queue. 
                  In accordance with LIT financial governance, credit must appear in our receiving bank ledger before status changes to Verified.
                </p>
                <div className="bg-white/80 border border-amber-200 rounded-xl p-3 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>Reported Remitter: {remitterName} ({remitterBank})</div>
                  <div>Reported Date: {paymentDate}</div>
                  <div>Amount Claimed: {paymentData.totalPayable}</div>
                  <div>Queue ID: LIT-REC-2026-INIT-84</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-600">
                  You will receive an official Payment Receipt PDF and invoice via email once verified.
                </span>
                <Link
                  href={`/engagement/${engagementRef}/onboarding`}
                  className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-5 py-2 rounded-xl font-semibold shadow-xs transition-colors"
                >
                  View Stage 7 Onboarding →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReportPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    UPI / Bank UTR Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 428812345678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                  <span className="text-[10px] text-slate-500">12-digit UPI UTR or bank reference number</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transfer Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payer / Remitter Account Name</label>
                  <input
                    type="text"
                    required
                    value={remitterName}
                    onChange={(e) => setRemitterName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remitting Bank Name</label>
                  <input
                    type="text"
                    required
                    value={remitterBank}
                    onChange={(e) => setRemitterBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client GSTIN (If Claiming ITC)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax Place of Supply</label>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                Notice: Submitting a UTR reference records your submission in the audit queue. It does NOT automatically mark the invoice paid. Only Super Admin confirmation of funds received in the designated bank account will approve this milestone.
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !utrNumber}
                  className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Recording UTR Submission...' : 'Submit Payment Reference for Audit →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
