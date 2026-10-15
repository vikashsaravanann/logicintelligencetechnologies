"use client";

import React, { useState } from "react";
import { QuotationCoupon, CreateCouponInput } from "@/types/quotations";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import {
  createCouponAction,
  toggleCouponStatusAction,
} from "@/lib/quotations/actions";
import {
  Tag,
  Plus,
  Search,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Percent,
  ShieldCheck,
  Layers,
  Clock,
  X,
  Loader2,
} from "lucide-react";

interface CouponsManagerClientProps {
  initialCoupons: QuotationCoupon[];
}

export function CouponsManagerClient({
  initialCoupons,
}: CouponsManagerClientProps) {
  const [coupons, setCoupons] = useState<QuotationCoupon[]>(initialCoupons);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New coupon form state
  const [formCode, setFormCode] = useState<string>("");
  const [formCampaignName, setFormCampaignName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed_amount">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<string>("10");
  const [formMaxDiscountRupees, setFormMaxDiscountRupees] = useState<string>("");
  const [formMinSubtotalRupees, setFormMinSubtotalRupees] = useState<string>("50000");
  const [formMaxRedemptions, setFormMaxRedemptions] = useState<string>("50");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Filtered coupons
  const filteredCoupons = coupons.filter((c) => {
    if (statusFilter === "active" && !c.is_active) return false;
    if (statusFilter === "inactive" && c.is_active) return false;
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(term) ||
      (c.campaign_name && c.campaign_name.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term))
    );
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleToggleStatus = async (coupon: QuotationCoupon) => {
    try {
      setTogglingId(coupon.id);
      setErrorMessage(null);
      const nextStatus = !coupon.is_active;
      const res = await toggleCouponStatusAction(coupon.id, nextStatus);
      if (res.success && res.data) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextStatus } : c))
        );
        setSuccessMessage(res.message || `Coupon "${coupon.code}" updated.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(res.error || "Failed to update coupon status");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage("Coupon code is required.");
      return;
    }
    if (!formCampaignName.trim()) {
      setErrorMessage("Campaign name is required.");
      return;
    }

    const numVal = parseFloat(formDiscountValue);
    if (isNaN(numVal) || numVal <= 0) {
      setErrorMessage("Please enter a valid positive discount amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const minSubtotalPaise = formMinSubtotalRupees.trim()
        ? Math.round(parseFloat(formMinSubtotalRupees) * 100)
        : null;
      const maxDiscountPaise = formMaxDiscountRupees.trim()
        ? Math.round(parseFloat(formMaxDiscountRupees) * 100)
        : null;
      const maxRedemptions = formMaxRedemptions.trim()
        ? parseInt(formMaxRedemptions, 10)
        : 100;

      const payload: CreateCouponInput = {
        code: cleanCode,
        campaign_name: formCampaignName.trim(),
        description: formDescription.trim() || null,
        discount_type: formDiscountType,
        discount_percentage: formDiscountType === "percentage" ? numVal : null,
        discount_paise: formDiscountType === "fixed_amount" ? Math.round(numVal * 100) : null,
        min_subtotal_paise: minSubtotalPaise,
        max_discount_paise: maxDiscountPaise,
        max_redemptions: maxRedemptions,
        expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
        is_active: formIsActive,
      };

      const res = await createCouponAction(payload);
      if (res.success && res.data) {
        setCoupons((prev) => [res.data!, ...prev]);
        setSuccessMessage(`Coupon "${res.data.code}" created successfully!`);
        setIsCreateModalOpen(false);

        // Reset form
        setFormCode("");
        setFormCampaignName("");
        setFormDescription("");
        setFormDiscountValue("10");
        setFormMaxDiscountRupees("");
        setFormMinSubtotalRupees("50000");
        setFormExpiresAt("");
      } else {
        setErrorMessage(res.error || "Failed to create coupon.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[var(--lit-text-muted,#52677C)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Coupons</span>
            <Tag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--lit-navy,#0B2545)]">
            {coupons.length}
          </div>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)]">
            Active: {coupons.filter((c) => c.is_active).length} · Inactive:{" "}
            {coupons.filter((c) => !c.is_active).length}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[var(--lit-text-muted,#52677C)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Redemptions</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {coupons.reduce((acc, c) => acc + (c.current_redemptions || 0), 0)}
          </div>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)]">
            Across all verified client sign-offs
          </p>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-xs">
          <div className="flex items-center justify-between text-blue-900">
            <span className="text-xs font-semibold uppercase tracking-wider">Campaign Invariant</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-sm font-bold text-blue-900">
            Strict Zero Hidden Reductions
          </div>
          <p className="mt-1 text-xs text-blue-700">
            Discounts only apply to draft quotations with explicit client visibility
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, campaign name, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                statusFilter === filter
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                  : "text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100"
              }`}
            >
              {filter}
            </button>
          ))}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 rounded-lg shadow-xs transition-colors ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Launch Campaign Restriction:</span> The national{" "}
          <code className="px-1 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-bold">
            SUPPORT-WAKEUP-INDIA-LIT
          </code>{" "}
          campaign must remain strictly disabled by default until officially launched and authorized by Super Admin.
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Campaign & Purpose</th>
                <th className="py-3 px-4">Discount Amount</th>
                <th className="py-3 px-4">Thresholds</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--lit-text-muted,#52677C)]">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No discount coupons found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create a promotional code or adjust your search filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isPercent = coupon.discount_type === "percentage";
                  const discountDisplay = isPercent
                    ? `${coupon.discount_percentage || 0}% Off`
                    : formatPaiseToINR(coupon.discount_paise || 0);

                  const maxCapDisplay =
                    coupon.max_discount_paise && coupon.max_discount_paise > 0
                      ? ` (Cap: ${formatPaiseToINR(coupon.max_discount_paise)})`
                      : "";

                  const minSubtotalDisplay =
                    coupon.min_subtotal_paise && coupon.min_subtotal_paise > 0
                      ? `Min Order: ${formatPaiseToINR(coupon.min_subtotal_paise)}`
                      : "No Min Order";

                  const isToggling = togglingId === coupon.id;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy Code"
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {coupon.campaign_name || "General Campaign"}
                        </div>
                        {coupon.description && (
                          <div className="text-xs text-[var(--lit-text-muted,#52677C)] line-clamp-1 mt-0.5">
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          {isPercent ? <Percent className="w-3 h-3 text-blue-600" /> : null}
                          <span>
                            {discountDisplay}
                            <span className="font-normal text-slate-500 text-[11px]">
                              {maxCapDisplay}
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[var(--lit-text-muted,#52677C)]">
                        <div>{minSubtotalDisplay}</div>
                        {coupon.expires_at && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Exp: {new Date(coupon.expires_at).toLocaleDateString("en-IN")}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                        <span className="font-bold text-slate-900">{coupon.current_redemptions || 0}</span>
                        <span className="text-slate-400"> / {coupon.max_redemptions || "∞"}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {coupon.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                            <XCircle className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          disabled={isToggling}
                          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                            coupon.is_active
                              ? "text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200"
                              : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200"
                          } disabled:opacity-50`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                          ) : null}
                          {coupon.is_active ? "Disable" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                  Create Promotional Coupon
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10, ENTERPRISE25"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Campaign / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Enterprise Engineering Grant"
                  value={formCampaignName}
                  onChange={(e) => setFormCampaignName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Eligibility Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain eligibility, client exclusions, or authorization rationale..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) =>
                      setFormDiscountType(e.target.value as "percentage" | "fixed_amount")
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {formDiscountType === "percentage" ? "Percentage Off (%) *" : "Discount Value (₹) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formDiscountType === "percentage" ? "100" : "10000000"}
                    step="any"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Min Order Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={formMinSubtotalRupees}
                    onChange={(e) => setFormMinSubtotalRupees(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional ceiling in ₹"
                    value={formMaxDiscountRupees}
                    onChange={(e) => setFormMaxDiscountRupees(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formMaxRedemptions}
                    onChange={(e) => setFormMaxRedemptions(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="coupon_active_checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="coupon_active_checkbox" className="text-sm text-slate-700 font-medium cursor-pointer">
                  Activate immediately upon creation
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1" />
                  )}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
