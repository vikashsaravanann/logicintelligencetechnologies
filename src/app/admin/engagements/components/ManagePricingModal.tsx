"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  DollarSign,
  Calculator,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { ClientEngagement } from "@/lib/engagements/types";
import {
  calculateEngagementFinancials,
  ScopeQuotationItem,
  formatInr,
} from "@/lib/engagements/financials";

interface ManagePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: ClientEngagement;
  onUpdated: (updatedEngagement: ClientEngagement) => void;
}

export function ManagePricingModal({
  isOpen,
  onClose,
  engagement,
  onUpdated,
}: ManagePricingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [subtotalInput, setSubtotalInput] = useState<string>("50");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize from engagement metadata
  useEffect(() => {
    setMounted(true);
    const meta = (engagement.metadata || {}) as Record<string, any>;
    const initialVal =
      meta.contract_subtotal ||
      meta.subtotal ||
      meta.contract_value ||
      meta.budget_range ||
      "50";
    setSubtotalInput(String(initialVal).replace(/[^0-9.]/g, "") || "50");
    setNotes(meta.pricing_notes || "");
  }, [engagement, isOpen]);

  if (!isOpen || !mounted) return null;

  // Real-time dynamic calculation
  const parsedSubtotal = parseFloat(subtotalInput) || 0;
  const liveFinancials = calculateEngagementFinancials(parsedSubtotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSubtotal <= 0) {
      setError("Please provide a valid positive subtotal amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/engagements/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementRef: engagement.engagement_ref,
          subtotal: parsedSubtotal,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update pricing");
      }

      setSuccess("Pricing updated successfully!");
      if (data.financials) {
        const updatedEngagement: ClientEngagement = {
          ...engagement,
          metadata: {
            ...(engagement.metadata || {}),
            contract_subtotal: data.financials.subtotal,
            contract_value: data.financials.totalFormatted,
            budget_range: data.financials.totalFormatted,
            gst_amount: data.financials.gstFormatted,
            deposit_amount: data.financials.depositFormatted,
            settlement_amount: data.financials.settlementFormatted,
            commercial_items: data.financials.scopeItems,
            pricing_notes: notes.trim(),
            pricing_updated_at: new Date().toISOString(),
          },
        };
        onUpdated(updatedEngagement);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update pricing";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Edit Commercial Quotation & Rates
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {engagement.company_name} · {engagement.engagement_ref}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Base Subtotal Amount (Excluding GST) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={subtotalInput}
                onChange={(e) => setSubtotalInput(e.target.value)}
                placeholder="e.g. 50"
                className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-base text-black focus:outline-none focus:ring-2 focus:ring-[#1565C0] shadow-2xs"
                style={{ color: "#000000", WebkitTextFillColor: "#000000", backgroundColor: "#FFFFFF" }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Super Admin enters the project base price. GST and 50%/50% milestone installments are derived automatically.
            </p>
          </div>

          {/* Real-time Dynamic Breakdown Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Live Statutory GST & Milestone Breakdown (18%)
            </span>

            <div className="flex justify-between items-center text-slate-700">
              <span>Subtotal (Base Price):</span>
              <span className="font-mono font-bold text-slate-900">
                {liveFinancials.subtotalFormatted}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>CGST (9% Central GST):</span>
              <span className="font-mono">{liveFinancials.cgstFormatted}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>SGST (9% State GST):</span>
              <span className="font-mono">{liveFinancials.sgstFormatted}</span>
            </div>

            <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200">
              <span className="font-medium">Total Statutory GST (18%):</span>
              <span className="font-mono font-bold text-slate-900">
                {liveFinancials.gstFormatted}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-800 pt-1.5 border-t border-slate-200 font-bold">
              <span>Total Contract Commitment:</span>
              <span className="font-mono text-sm text-emerald-700">
                {liveFinancials.totalFormatted}
              </span>
            </div>

            <div className="p-2.5 bg-emerald-100/60 rounded-lg text-[11px] space-y-1 text-emerald-950 font-medium">
              <div className="flex justify-between">
                <span>Milestone 1: 50% Initial Deposit:</span>
                <span className="font-mono font-bold">{liveFinancials.depositFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>Milestone 2: 50% Final Settlement:</span>
                <span className="font-mono font-bold">{liveFinancials.settlementFormatted}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Quotation Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved custom testing rate or special promotional terms"
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#1565C0] shadow-2xs resize-none"
              style={{ color: "#000000", WebkitTextFillColor: "#000000", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save &amp; Update Proposal</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
