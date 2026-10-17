'use client';

import React, { useState } from 'react';
import { formatPaiseToInr } from '@/config/maintenance-plans';
import { CheckCircle2, AlertCircle, RefreshCw, Clock, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

interface SubscriptionsAdminClientProps {
  initialOrders: any[];
  initialSubscriptions: any[];
  initialRefundQueue: any[];
}

export default function SubscriptionsAdminClient({
  initialOrders,
  initialSubscriptions,
  initialRefundQueue,
}: SubscriptionsAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'refunds' | 'subs'>('orders');
  const [orders, setOrders] = useState(initialOrders);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [refundQueue, setRefundQueue] = useState(initialRefundQueue);

  // Verification modal state
  const [verifyingOrder, setVerifyingOrder] = useState<any>(null);
  const [bankRef, setBankRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Refund processing modal state
  const [processingRefund, setProcessingRefund] = useState<any>(null);
  const [refundRefInput, setRefundRefInput] = useState('');
  const [refundNotesInput, setRefundNotesInput] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Handle Order Verification & Plan Activation
  const handleVerifyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder || !bankRef.trim()) return;

    setIsVerifying(true);
    setActionFeedback(null);

    try {
      const res = await fetch('/api/admin/subscriptions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: verifyingOrder.id,
          bankReconciliationRef: bankRef.trim(),
          notes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', message: 'Order verified and subscription activated successfully!' });
        setOrders((prev) =>
          prev.map((o) => (o.id === verifyingOrder.id ? { ...o, status: 'verified', bank_reconciliation_ref: bankRef } : o))
        );
        if (data.subscription) {
          setSubscriptions((prev) => [data.subscription, ...prev]);
          if (data.subscription.plan_id === 'FREE_TRIAL') {
            setRefundQueue((prev) => [data.subscription, ...prev]);
          }
        }
        setVerifyingOrder(null);
        setBankRef('');
        setAdminNotes('');
      } else {
        setActionFeedback({ type: 'error', message: data.error || 'Verification failed.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setActionFeedback({ type: 'error', message: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Free Trial Refund Processing
  const handleProcessRefund = async (status: 'processing' | 'completed' | 'manual_review_required') => {
    if (!processingRefund) return;

    setIsProcessingRefund(true);
    setActionFeedback(null);

    try {
      const res = await fetch('/api/admin/subscriptions/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: processingRefund.id,
          refundStatus: status,
          refundReference: refundRefInput.trim() || undefined,
          refundNotes: refundNotesInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', message: `Refund state updated to: ${status}` });
        setRefundQueue((prev) =>
          prev.map((s) => (s.id === processingRefund.id ? { ...s, refund_status: status, refund_reference: refundRefInput } : s))
        );
        setProcessingRefund(null);
        setRefundRefInput('');
        setRefundNotesInput('');
      } else {
        setActionFeedback({ type: 'error', message: data.error || 'Refund update failed.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setActionFeedback({ type: 'error', message: msg });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button type="button" onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Payment Orders & Verification Queue ({orders.filter((o) => o.status === 'verification_pending').length} pending)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('refunds')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'refunds'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Free Trial ₹20 Refund Queue ({refundQueue.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subs')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'subs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Active Subscriptions ({subscriptions.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders & Verification Queue */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-bold">Order Ref</th>
                  <th className="p-3.5 font-bold">Plan Tier</th>
                  <th className="p-3.5 font-bold">Amount</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Declared UTR</th>
                  <th className="p-3.5 font-bold">Payee / Account</th>
                  <th className="p-3.5 font-bold">Reported Time</th>
                  <th className="p-3.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No maintenance orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{o.order_ref}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {o.plan_id}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {formatPaiseToInr(o.total_amount_paise)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'verification_pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-800">
                        {o.declared_utr || '—'}
                      </td>
                      <td className="p-3.5 text-slate-600">{o.declared_payee_name || '—'}</td>
                      <td className="p-3.5 text-slate-400">
                        {o.declared_payment_time ? new Date(o.declared_payment_time).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        {o.status === 'verification_pending' ? (
                          <button
                            type="button"
                            onClick={() => setVerifyingOrder(o)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs"
                          >
                            Reconcile & Activate
                          </button>
                        ) : o.status === 'verified' ? (
                          <span className="text-emerald-600 font-semibold text-[11px]">✓ Settled</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending Client</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Free Trial ₹20 Refund Queue */}
      {activeTab === 'refunds' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Mandatory ₹20 Refund Protocol: Verification deposits for the 30-Day Free Trial must be refunded via bank transfer or original UPI.
            </span>
            <span className="font-bold text-slate-800">
              {refundQueue.filter((r) => r.refund_status === 'pending').length} Action Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-bold">Subscription ID</th>
                  <th className="p-3.5 font-bold">Plan</th>
                  <th className="p-3.5 font-bold">Verification Fee</th>
                  <th className="p-3.5 font-bold">Trial Activated At</th>
                  <th className="p-3.5 font-bold">Refund Status</th>
                  <th className="p-3.5 font-bold">Refund Reference</th>
                  <th className="p-3.5 text-right font-bold">Manage Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refundQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No trial verification refunds pending.
                    </td>
                  </tr>
                ) : (
                  refundQueue.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono text-slate-700 truncate max-w-[140px]">{s.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.plan_id}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">₹20.00</td>
                      <td className="p-3.5 text-slate-500">
                        {s.trial_started_at ? new Date(s.trial_started_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.refund_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.refund_status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.refund_status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">{s.refund_reference || '—'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setProcessingRefund(s)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                        >
                          Update Refund
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Active Subscriptions Directory */}
      {activeTab === 'subs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3.5 font-bold">Subscription ID</th>
                  <th className="p-3.5 font-bold">Plan Tier</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Current Period End</th>
                  <th className="p-3.5 font-bold">Enhancement Hours</th>
                  <th className="p-3.5 font-bold">Refund Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No active client subscriptions recorded.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-mono text-slate-700 truncate max-w-[140px]">{s.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.plan_id}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3.5 text-slate-800 font-mono">
                        {s.enhancement_hours_allocated} hrs ({s.enhancement_hours_used} used)
                      </td>
                      <td className="p-3.5 text-slate-600 capitalize">{s.refund_status?.replace(/_/g, ' ') || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Modal Dialog */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B2545]">Reconcile & Activate Maintenance Order</h3>
            <p className="text-xs text-slate-600">
              Confirm bank receipt for order <strong>{verifyingOrder.order_ref}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>Plan: <span className="font-bold">{verifyingOrder.plan_id}</span></div>
              <div>Amount: <span className="font-bold font-mono">{formatPaiseToInr(verifyingOrder.total_amount_paise)}</span></div>
              <div>Reported UTR: <span className="font-bold font-mono">{verifyingOrder.declared_utr}</span></div>
              <div>Payer: <span className="font-bold">{verifyingOrder.declared_payee_name}</span></div>
            </div>

            <form onSubmit={handleVerifyOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Reconciliation Reference / Ledger ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC-CR-20261017-9182"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Reconciled against bank statement"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm Bank Credit & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Processing Modal */}
      {processingRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B2545]">Process ₹20 Verification Refund</h3>
            <p className="text-xs text-slate-600">
              Subscription ID: <span className="font-mono">{processingRefund.id}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Refund Reference / UTR (if completed)
                </label>
                <input
                  type="text"
                  placeholder="e.g. REF-UPI-482910"
                  value={refundRefInput}
                  onChange={(e) => setRefundRefInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refund Audit Notes</label>
                <input
                  type="text"
                  placeholder="Dispatched to original account"
                  value={refundNotesInput}
                  onChange={(e) => setRefundNotesInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  disabled={isProcessingRefund}
                  onClick={() => handleProcessRefund('completed')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                >
                  Mark Refund as Completed (₹20 Sent)
                </button>
                <button
                  type="button"
                  disabled={isProcessingRefund}
                  onClick={() => handleProcessRefund('processing')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  Mark Refund In Progress / Dispatched
                </button>
                <button
                  type="button"
                  onClick={() => setProcessingRefund(null)}
                  className="w-full py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
