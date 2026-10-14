'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface FinalPaymentStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  qrDataUrl?: string;
  upiDeepLink?: string;
  transactionRef?: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function FinalPaymentStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  qrDataUrl,
  upiDeepLink,
  transactionRef = `LIT-PAY-${engagementRef}-FINAL`,
  initialStatus = 'available',
  initialData = {},
  document,
}: FinalPaymentStageClientProps) {
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

  const paymentData = {
    requestRef: transactionRef,
    milestone: 'Final Settlement (50% Completion & Handover)',
    subtotal: '₹9,00,000.00',
    cgst: '₹81,000.00 (9%)',
    sgst: '₹81,000.00 (9%)',
    totalPayable: '₹10,62,000.00',
    totalNumeric: '1062000.00',
    beneficiaryVpa: '9342877474@ptyes',
    beneficiaryName: 'S VIKASH',
    msmeRegistration: 'UDYAM-TN-03-0345274',
    brandName: 'Logic Intelligence Technologies',
    upiDeepLink: upiDeepLink || `upi://pay?pa=9342877474@ptyes&pn=S%20VIKASH&am=1062000.00&cu=INR&tr=${transactionRef}&tn=Final%20Settlement%2050`,
  };

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || !remitterName.trim()) {
      setErrorMessage('Please provide both the 12-digit UTR number and remitter account name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/final-payment`, {
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
        throw new Error(data.error || 'Failed to record UTR reporting.');
      }

      setAuditHash(data.auditHash);
      setIsReported(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while submitting payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef={document?.master_id ? `${document.master_id}-Invoice.pdf` : 'LIT-03-Final-Tax-Invoice.pdf'}
        title={document?.document_title || 'LIT-03 Final Settlement Tax Invoice'}
        description="Official proforma and final tax invoice with statutory MSME registration, GSTIN split, and receiving bank details."
        documentMasterPath={document?.file_url || '/assets/docs/masters/LIT-03-Invoice.pdf'}
        version={document?.version_label || 'v2.2 (Final Settlement)'}
        status="active"
      />

      {/* Financial Security Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545]">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <span className="font-bold block">Final Settlement Clearing · Zero Gateway Deductions</span>
          <p className="mt-1 text-slate-600 leading-relaxed">
            Final settlement is cleared via direct UPI/NEFT to the verified Founder receiving account. 
            Upon receiving bank credit reconciliation by the Super Admin, the final Tax Invoice with GST breakdown is released and Stage 12 (Custody Handover) is unlocked.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

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
              <span>Final Subtotal (50%):</span>
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
              <span className="font-mono text-[#1565C0]">{paymentData.totalPayable}</span>
            </div>
          </div>

          {/* Dynamic Amount UPI QR Box */}
          <div className="text-center p-5 bg-[#F7F9FC] border border-[#DFE7EF] rounded-2xl space-y-3">
            <div className="text-xs font-bold text-[#0B2545]">
              Scan Exact Amount Dynamic UPI QR
            </div>
            <div className="inline-block p-3 bg-white border border-[#DFE7EF] rounded-xl shadow-xs">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt="Final Settlement Dynamic UPI QR"
                  width={180}
                  height={180}
                  className="mx-auto"
                />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center bg-slate-100 text-slate-400 font-mono text-[11px] rounded-lg">
                  Generating Dynamic QR...
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-[#0B2545]">
                {paymentData.beneficiaryVpa}
              </div>
              <div className="text-[11px] text-[#52677C]">
                Beneficiary: <strong>{paymentData.beneficiaryName}</strong> ({paymentData.brandName})
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                MSME Udyam: {paymentData.msmeRegistration}
              </div>
            </div>

            <a
              href={paymentData.upiDeepLink}
              className="inline-block w-full py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              Pay via UPI App (GPay / PhonePe / Paytm)
            </a>
          </div>
        </div>

        {/* Right Column: Settlement Reporting Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs">
          {isReported ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-[#0B2545]">
                  Final Settlement Details Submitted
                </h3>
                <p className="text-xs text-[#52677C] leading-relaxed">
                  Your settlement UTR <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#0B2545] font-bold">{utrNumber}</code> has been queued for Super Admin manual bank reconciliation.
                </p>
                {auditHash && (
                  <div className="font-mono text-[10px] text-slate-500 mt-1">
                    Cryptographic Audit Digest: <code className="bg-slate-100 px-1 rounded text-[#0B2545]">{auditHash}</code>
                  </div>
                )}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-left mt-3 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Status: Pending Super Admin Bank Reconciliation
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Per the zero-PSP manual receiving bank invariant, funds must be credited and verified on the bank statement before Stage 12 (Custody Handover & IP Transfer) is unlocked.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/engagement/${engagementRef}/handover`}
                  className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
                >
                  View Stage 12: Handover & IP Transfer
                </Link>
                <Link
                  href={`/engagement/${engagementRef}`}
                  className="px-4 py-2 border border-[#DFE7EF] text-xs font-semibold text-[#52677C] hover:text-[#0B2545] rounded-lg transition-colors"
                >
                  Return to All Stages
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReportPayment} className="space-y-5 text-xs">
              <div className="border-b border-[#DFE7EF] pb-3">
                <h3 className="text-base font-bold text-[#0B2545]">
                  Report Final Payment & Remitter Details
                </h3>
                <p className="text-xs text-[#52677C] mt-0.5">
                  Enter the 12-digit UPI / NEFT UTR transaction number from your banking receipt.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Bank Transaction / UTR Reference *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 428812984712"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Settlement Date *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Remitting Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={remitterName}
                    onChange={(e) => setRemitterName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Remitting Bank Name
                  </label>
                  <input
                    type="text"
                    value={remitterBank}
                    onChange={(e) => setRemitterBank(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Client GSTIN (for Final Tax Invoice)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 33AAAAA0000A1Z5 (Optional)"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs uppercase focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Place of Supply (State Code)
                  </label>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                <strong>Receipt Policy:</strong> Per Indian tax compliance and MSME Udyam rules (UDYAM-TN-03-0345274), the final Tax Invoice with GST breakdown is issued once actual receipt of funds is verified by the Super Admin in the receiving bank account.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#DFE7EF]">
                <Link
                  href={`/engagement/${engagementRef}`}
                  className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
                >
                  ← Back to Visit All Stages
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting || !utrNumber.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting UTR...</span>
                  ) : (
                    <>
                      <span>Submit Final Settlement UTR</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
