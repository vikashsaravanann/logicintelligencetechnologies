'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  PlanIdentifier,
  MAINTENANCE_PLANS,
  MAINTENANCE_FEATURES_MATRIX,
  formatPaiseToInr,
} from '@/config/maintenance-plans';
import { LIT_PAYEE_CONFIG, getMobileIntentLinks } from '@/lib/payments/upi';

interface MaintenancePlansSectionProps {
  engagementRef: string;
  engagementId: string;
  companyName: string;
  contactEmail: string;
}

export default function MaintenancePlansSection({
  engagementRef,
  engagementId,
  companyName,
  contactEmail,
}: MaintenancePlansSectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanIdentifier>('FREE_TRIAL');
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Checkout order states
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // UTR submission states
  const [declaredUtr, setDeclaredUtr] = useState('');
  const [declaredPayeeName, setDeclaredPayeeName] = useState(companyName || '');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Expandable sections
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  const checkoutRef = useRef<HTMLDivElement>(null);

  // Load existing subscription & status
  useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      try {
        const res = await fetch(`/api/subscriptions/status?engagementId=${encodeURIComponent(engagementId)}`);
        const data = await res.json();
        if (isMounted && data.success && data.subscription) {
          setActiveSubscription(data.subscription);
        }
      } catch (err) {
        console.error('Failed to load subscription status:', err);
      } finally {
        if (isMounted) setIsLoadingStatus(false);
      }
    }
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [engagementId]);

  // Handle plan selection & order generation
  const handleSelectPlan = async (planId: PlanIdentifier) => {
    setSelectedPlanId(planId);
    setIsCreatingOrder(true);
    setSubmissionFeedback(null);

    try {
      const res = await fetch('/api/subscriptions/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementId,
          planId,
          consentConfirmed: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCurrentOrder(data.order);
        // Generate QR Code data URL
        if (data.upiUri) {
          const qrUrl = await QRCode.toDataURL(data.upiUri, {
            width: 320,
            margin: 2,
            color: { dark: '#0B2545', light: '#FFFFFF' },
          });
          setQrDataUrl(qrUrl);
        }
        // Auto-scroll to embedded checkout section
        setTimeout(() => {
          checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setSubmissionFeedback({ type: 'error', message: data.error || 'Failed to prepare order' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error creating order';
      setSubmissionFeedback({ type: 'error', message: msg });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Handle UTR submission
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    if (!declaredUtr.trim()) {
      setSubmissionFeedback({ type: 'error', message: 'Please enter a valid 12-digit UTR or bank transaction reference.' });
      return;
    }

    setIsSubmittingUtr(true);
    setSubmissionFeedback(null);

    try {
      const res = await fetch('/api/subscriptions/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderRef: currentOrder.order_ref,
          secureToken: currentOrder.secure_token,
          declaredUtr: declaredUtr.trim(),
          declaredPayeeName: declaredPayeeName.trim(),
          paymentProofUrl: paymentProofUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCurrentOrder(data.order);
        setSubmissionFeedback({
          type: 'success',
          message: 'Payment report received! Your transaction reference is now queued for Super Admin bank reconciliation.',
        });
      } else {
        setSubmissionFeedback({ type: 'error', message: data.error || 'Failed to submit UTR' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error submitting UTR';
      setSubmissionFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const selectedPlan = MAINTENANCE_PLANS[selectedPlanId];
  const intentLinks = currentOrder?.upi_uri ? getMobileIntentLinks(currentOrder.upi_uri) : [];

  return (
    <div className="space-y-10">
      {/* 1. Active Subscription / Free Trial Status Banner */}
      {activeSubscription && activeSubscription.status === 'active' && (
        <div className="bg-gradient-to-r from-emerald-900/90 via-[#0B2545] to-[#134074] text-white rounded-2xl p-6 shadow-md border border-emerald-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                  Active Subscription
                </span>
                <span className="text-xs text-emerald-300 font-mono">
                  {activeSubscription.plan_id}
                </span>
              </div>
              <h3 className="text-xl font-bold mt-2">
                {activeSubscription.planDetails?.name || activeSubscription.plan_id}
              </h3>
              <p className="text-xs text-slate-200 mt-1 max-w-xl">
                Active for <strong>{companyName}</strong>. Standard SLA target:{' '}
                <span className="text-emerald-300 font-semibold">
                  {activeSubscription.planDetails?.slaResponseTime || '< 24 Hours'}
                </span>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 text-center shrink-0">
              <div>
                <div className="text-[10px] text-slate-300 uppercase">Days Left</div>
                <div className="text-base font-bold text-white mt-0.5 font-mono">
                  {activeSubscription.daysRemaining} Days
                </div>
              </div>
              {activeSubscription.plan_id === 'FREE_TRIAL' ? (
                <div>
                  <div className="text-[10px] text-slate-300 uppercase">Verification</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">
                    ₹20.00
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[10px] text-slate-300 uppercase">Enhancement</div>
                  <div className="text-base font-bold text-blue-300 mt-0.5 font-mono">
                    {activeSubscription.enhancement_hours_allocated} hrs
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] text-slate-300 uppercase">Refund State</div>
                <div className="text-[11px] font-bold text-amber-300 mt-1 capitalize truncate max-w-[90px]">
                  {activeSubscription.refund_status?.replace(/_/g, ' ') || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Five-Tier Plan Selector Header */}
      <div>
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF] uppercase tracking-wider">
            Production Maintenance & SLA Care
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
            Choose Your Maintenance Care Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Select the appropriate operational tier for <strong>{companyName}</strong>. Includes our 30-Day Free Trial with refundable ₹20 UPI verification, plus four scalable paid production care tiers.
          </p>
        </div>

        {/* Five Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {(Object.keys(MAINTENANCE_PLANS) as PlanIdentifier[]).map((planId) => {
            const plan = MAINTENANCE_PLANS[planId];
            const isSelected = selectedPlanId === planId;
            const isFreeTrial = plan.planType === 'free_trial';

            return (
              <div
                key={planId}
                onClick={() => handleSelectPlan(planId)}
                className={`relative flex flex-col justify-between rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1565C0] bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {plan.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{plan.shortDescription}</p>

                  {/* Pricing Display */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {isFreeTrial ? (
                      <div>
                        <div className="text-2xl font-extrabold text-[#0B2545]">₹0</div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          ₹20 refundable verification
                        </div>
                        <div className="text-[10px] text-slate-400">30 Days · No auto-debit</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl font-extrabold text-[#0B2545]">
                          {formatPaiseToInr(plan.basePricePaise)}
                          <span className="text-[11px] font-normal text-slate-500"> /mo</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          + 18% GST ({formatPaiseToInr(plan.gstAmountPaise)})
                        </div>
                        <div className="text-[10px] text-slate-700 font-semibold">
                          Total: {formatPaiseToInr(plan.totalPricePaise)} /mo
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Highlights */}
                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>SLA: {plan.slaResponseTime}</span>
                    </div>
                    {plan.enhancementHoursMonthly > 0 && (
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{plan.enhancementHoursMonthly} hr/mo Enhancements</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(planId);
                  }}
                  className={`mt-5 w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {plan.ctaButtonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Embedded Checkout & UPI QR Section (Auto-scrolled) */}
      <div ref={checkoutRef} className="pt-6">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Stage 13 Embedded Payment Gateway
              </span>
              <h3 className="text-xl font-bold text-[#0B2545] mt-1">
                {selectedPlan.name} — Order Summary & Dynamic UPI QR
              </h3>
            </div>
            {currentOrder && (
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Order Reference</span>
                <div className="text-xs font-bold font-mono text-slate-800">{currentOrder.order_ref}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Financial Order Summary & Bank Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Breakdown</h4>
                
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Plan Description</span>
                    <span className="font-semibold text-slate-900">{selectedPlan.name} ({selectedPlan.billingFrequency})</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Base Subscription Fee</span>
                    <span className="font-mono text-slate-900">{formatPaiseToInr(selectedPlan.basePricePaise)}</span>
                  </div>
                  {selectedPlan.gstAmountPaise > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600">GST (18% Intra/Inter-state)</span>
                      <span className="font-mono text-slate-900">{formatPaiseToInr(selectedPlan.gstAmountPaise)}</span>
                    </div>
                  )}
                  {selectedPlan.planType === 'free_trial' && (
                    <div className="flex justify-between py-2 text-emerald-700 font-medium">
                      <span>One-Time Refundable Verification Deposit</span>
                      <span className="font-mono font-bold">₹20.00</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 text-sm font-bold border-t-2 border-slate-200">
                    <span className="text-[#0B2545]">Total Amount Payable</span>
                    <span className="font-mono text-[#0B2545] text-base">
                      {formatPaiseToInr(selectedPlan.totalPricePaise)}
                    </span>
                  </div>
                </div>

                {selectedPlan.planType === 'free_trial' ? (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                    <strong>Refund Policy Notice:</strong> The ₹20 verification fee confirms authentic client account registration and will be refunded upon verification. The 30-Day Free Trial does NOT convert into any paid plan automatically.
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                    <strong>Monthly Invoicing:</strong> Advance monthly subscription. Includes {selectedPlan.enhancementHoursMonthly} minor enhancement hour(s) for the current billing cycle.
                  </div>
                )}
              </div>

              {/* Verified Beneficiary Transparency Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Payee Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Beneficiary Name</span>
                    <span className="font-semibold text-slate-800">{LIT_PAYEE_CONFIG.accountHolder}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Corporate Entity</span>
                    <span className="font-semibold text-slate-800">{LIT_PAYEE_CONFIG.brandName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Beneficiary UPI ID</span>
                    <span className="font-mono font-semibold text-blue-700">{LIT_PAYEE_CONFIG.upiId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Registered Location</span>
                    <span className="text-slate-800">{LIT_PAYEE_CONFIG.city}, {LIT_PAYEE_CONFIG.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dynamic QR & UTR Submission Form */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Scan Dynamic UPI QR
                </h4>

                {isCreatingOrder ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Generating secure QR code...</span>
                  </div>
                ) : qrDataUrl ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="Dynamic UPI QR" className="w-52 h-52 mx-auto" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(LIT_PAYEE_CONFIG.upiId, 'upi')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {copiedField === 'upi' ? '✓ Copied UPI ID' : 'Copy UPI ID'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard((selectedPlan.totalPricePaise / 100).toFixed(2), 'amt')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {copiedField === 'amt' ? '✓ Copied Amount' : 'Copy Amount'}
                      </button>
                    </div>

                    {/* Mobile App Deep Links */}
                    {intentLinks.length > 0 && (
                      <div className="pt-2 w-full">
                        <span className="text-[10px] text-slate-400 block mb-1.5">Direct UPI App Links</span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {intentLinks.map((link) => (
                            <a
                              key={link.appId}
                              href={link.url}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border ${link.colorScheme.bg} ${link.colorScheme.text} ${link.colorScheme.border}`}
                            >
                              {link.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* UTR Submission Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Submit Payment Proof</h4>
                  {currentOrder?.status === 'verification_pending' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      Verification Pending
                    </span>
                  )}
                  {currentOrder?.status === 'verified' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      Settled & Verified
                    </span>
                  )}
                </div>

                {submissionFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      submissionFeedback.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {submissionFeedback.message}
                  </div>
                )}

                <form onSubmit={handleSubmitUtr} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      12-Digit UPI UTR / Bank Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 428719284712"
                      value={declaredUtr}
                      onChange={(e) => setDeclaredUtr(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payer Account Name / Holder *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Name on bank account"
                      value={declaredPayeeName}
                      onChange={(e) => setDeclaredPayeeName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Screenshot Proof URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingUtr || !currentOrder}
                    className="w-full py-2.5 px-4 bg-[#0B2545] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmittingUtr ? 'Recording UTR...' : 'Submit UTR For Verification'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Complete Feature Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 cursor-pointer"
        >
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">Complete 5-Tier Service Entitlements Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive comparison of response times, inclusions, and SLAs</p>
          </div>
          <button type="button" className="text-xs text-blue-600 font-semibold">
            {showComparison ? 'Hide Table ▲' : 'Show Table ▼'}
          </button>
        </div>

        {showComparison && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-bold">Feature / Entitlement</th>
                  <th className="p-3.5 text-center font-bold">Free Trial</th>
                  <th className="p-3.5 text-center font-bold">Standard</th>
                  <th className="p-3.5 text-center font-bold">Basic</th>
                  <th className="p-3.5 text-center font-bold text-blue-700 bg-blue-50/50">Pro</th>
                  <th className="p-3.5 text-center font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MAINTENANCE_FEATURES_MATRIX.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-medium text-slate-900">{row.name}</td>
                    <td className="p-3.5 text-center text-slate-600">
                      {typeof row.freeTrial === 'boolean' ? (row.freeTrial ? '✓' : '—') : row.freeTrial}
                    </td>
                    <td className="p-3.5 text-center text-slate-600">
                      {typeof row.standard === 'boolean' ? (row.standard ? '✓' : '—') : row.standard}
                    </td>
                    <td className="p-3.5 text-center text-slate-600">
                      {typeof row.basic === 'boolean' ? (row.basic ? '✓' : '—') : row.basic}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-blue-900 bg-blue-50/30">
                      {typeof row.pro === 'boolean' ? (row.pro ? '✓' : '—') : row.pro}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-slate-900">
                      {typeof row.enterprise === 'boolean' ? (row.enterprise ? '✓' : '—') : row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Planned Future Scope & Roadmap Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div
          onClick={() => setShowRoadmap(!showRoadmap)}
          className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200 cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Future Roadmap
              </span>
              <h3 className="text-base font-bold text-[#0B2545]">Planned Future Enhancements (By Tier)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Notice: Planned items are in active R&D and not yet contractual entitlements.
            </p>
          </div>
          <button type="button" className="text-xs text-blue-600 font-semibold">
            {showRoadmap ? 'Collapse Roadmap ▲' : 'Expand Roadmap ▼'}
          </button>
        </div>

        {showRoadmap && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(Object.keys(MAINTENANCE_PLANS) as PlanIdentifier[]).map((planId) => {
              const plan = MAINTENANCE_PLANS[planId];
              return (
                <div key={planId} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">{plan.name} Roadmap</h4>
                  <div className="space-y-2">
                    {plan.plannedFeatures.map((feat, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-100 text-[11px]">
                        <span className="font-bold text-slate-900 block">{feat.title}</span>
                        <span className="text-slate-500 mt-0.5 block leading-relaxed">{feat.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
