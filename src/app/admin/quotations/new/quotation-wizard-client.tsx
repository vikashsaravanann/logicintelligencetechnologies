"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CANONICAL_SERVICES_CATALOG,
  QUOTATION_CATEGORIES,
} from "@/lib/quotations/catalog-seed-data";
import { QuotationCoupon } from "@/types/quotations";
import { formatPaiseToINR, DEFAULT_LIT_ISSUER, STANDARD_QUOTATION_TERMS } from "@/lib/quotations/pricing";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Save,
  Send,
  Plus,
  Trash2,
} from "lucide-react";

interface QuotationWizardClientProps {
  availableCoupons: QuotationCoupon[];
}

interface LineConfig {
  isSelected: boolean;
  quantity: number;
  unitPriceRupees: string; // string for input editing
  isIncludedNoCharge: boolean;
  chargeWaiverReason: string;
}

export function QuotationWizardClient({ availableCoupons }: QuotationWizardClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client & Project Information
  const [companyName, setCompanyName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<string>("");
  const [cityStatePin, setCityStatePin] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState<string>("Enterprise Next.js Web Platform");
  const [projectBrief, setProjectBrief] = useState<string>(
    "Modern, high-performance web platform built with Next.js 16, React 19, TypeScript, and cloud deployment."
  );
  const [timelineEstimate, setTimelineEstimate] = useState<string>("3 to 5 weeks");
  const [validityDays, setValidityDays] = useState<number>(14);
  const [internalNotes, setInternalNotes] = useState<string>("");

  // Discount configuration
  const [manualDiscountRupees, setManualDiscountRupees] = useState<string>("0");
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>("");

  // Catalog category accordion states (Category B open by default)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    B: true,
  });
  const [serviceSearch, setServiceSearch] = useState<string>("");

  // 77 Service line states (FE-01 pre-selected at ₹50,000)
  const [linesState, setLinesState] = useState<Record<string, LineConfig>>(() => {
    const init: Record<string, LineConfig> = {};
    for (const item of CANONICAL_SERVICES_CATALOG) {
      if (item.service_code === "FE-01") {
        init[item.service_code] = {
          isSelected: true,
          quantity: 1,
          unitPriceRupees: "50000",
          isIncludedNoCharge: false,
          chargeWaiverReason: "",
        };
      } else {
        init[item.service_code] = {
          isSelected: false,
          quantity: 1,
          unitPriceRupees: "",
          isIncludedNoCharge: false,
          chargeWaiverReason: "",
        };
      }
    }
    return init;
  });

  const toggleCategory = (catCode: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catCode]: !prev[catCode],
    }));
  };

  const updateLine = (serviceCode: string, patch: Partial<LineConfig>) => {
    setLinesState((prev) => ({
      ...prev,
      [serviceCode]: {
        ...prev[serviceCode],
        ...patch,
      },
    }));
  };

  // Calculations
  const calculations = useMemo(() => {
    let subtotalPaise = 0;
    const selectedLinesList: Array<{
      serviceCode: string;
      title: string;
      quantity: number;
      unitPricePaise: number | null;
      isIncludedNoCharge: boolean;
      chargeWaiverReason: string;
      extendedAmountPaise: number;
    }> = [];

    const validationErrors: string[] = [];

    for (const catItem of CANONICAL_SERVICES_CATALOG) {
      const cfg = linesState[catItem.service_code];
      if (!cfg || !cfg.isSelected) continue;

      let unitPricePaise: number | null = null;
      let lineTotalPaise = 0;

      if (cfg.isIncludedNoCharge) {
        unitPricePaise = 0;
        lineTotalPaise = 0;
        if (!cfg.chargeWaiverReason.trim()) {
          validationErrors.push(
            `Service ${catItem.service_code} (${catItem.title}) is set to zero-charge waiver but has no rationale.`
          );
        }
      } else {
        const num = parseFloat(cfg.unitPriceRupees);
        if (isNaN(num) || num <= 0) {
          validationErrors.push(
            `Service ${catItem.service_code} (${catItem.title}) is selected but missing an approved unit price or zero-charge waiver.`
          );
        } else {
          unitPricePaise = Math.round(num * 100);
          lineTotalPaise = unitPricePaise * (cfg.quantity || 1);
        }
      }

      subtotalPaise += lineTotalPaise;
      selectedLinesList.push({
        serviceCode: catItem.service_code,
        title: catItem.title,
        quantity: cfg.quantity || 1,
        unitPricePaise,
        isIncludedNoCharge: cfg.isIncludedNoCharge,
        chargeWaiverReason: cfg.chargeWaiverReason,
        extendedAmountPaise: lineTotalPaise,
      });
    }

    if (!projectTitle.trim()) validationErrors.push("Project Title is required.");
    if (!companyName.trim()) validationErrors.push("Company Name is required.");
    if (!contactEmail.trim()) validationErrors.push("Client Contact Email is required.");
    if (selectedLinesList.length === 0) validationErrors.push("At least one service must be selected.");

    // Discounts
    const manualPaise = Math.max(0, Math.round((parseFloat(manualDiscountRupees) || 0) * 100));
    let couponDiscountPaise = 0;
    let couponLabel = "";

    const activeCoupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === selectedCouponCode.trim().toUpperCase()
    );

    if (activeCoupon && activeCoupon.is_active) {
      const meetsMin = !activeCoupon.min_subtotal_paise || subtotalPaise >= activeCoupon.min_subtotal_paise;
      if (meetsMin) {
        if (activeCoupon.discount_type === "percentage" && activeCoupon.discount_percentage) {
          const raw = Math.round(subtotalPaise * (activeCoupon.discount_percentage / 100));
          couponDiscountPaise = activeCoupon.max_discount_paise
            ? Math.min(raw, activeCoupon.max_discount_paise)
            : raw;
          couponLabel = `${activeCoupon.code} (${activeCoupon.discount_percentage}%)`;
        } else if (activeCoupon.discount_type === "fixed_paise" && activeCoupon.discount_paise) {
          couponDiscountPaise = activeCoupon.max_discount_paise
            ? Math.min(activeCoupon.discount_paise, activeCoupon.max_discount_paise)
            : activeCoupon.discount_paise;
          couponLabel = `${activeCoupon.code} (${formatPaiseToINR(couponDiscountPaise)})`;
        }
      }
    }

    const totalDiscountPaise = Math.min(subtotalPaise, manualPaise + couponDiscountPaise);
    const totalPayablePaise = Math.max(0, subtotalPaise - totalDiscountPaise);

    // Dual 50% Milestones: Milestone 1 floors, Milestone 2 receives remaining odd paise
    const milestone1Paise = Math.floor(totalPayablePaise / 2);
    const milestone2Paise = totalPayablePaise - milestone1Paise;
    const hasOddPaiseConservation = totalPayablePaise % 2 !== 0;

    return {
      subtotalPaise,
      manualDiscountPaise: manualPaise,
      couponDiscountPaise,
      couponLabel,
      totalDiscountPaise,
      totalPayablePaise,
      milestone1Paise,
      milestone2Paise,
      hasOddPaiseConservation,
      selectedLinesCount: selectedLinesList.length,
      selectedLinesList,
      validationErrors,
      isValidForPublish: validationErrors.length === 0,
    };
  }, [
    linesState,
    projectTitle,
    companyName,
    contactEmail,
    manualDiscountRupees,
    selectedCouponCode,
    availableCoupons,
  ]);

  const handleSubmit = async (publishImmediately: boolean) => {
    if (publishImmediately && !calculations.isValidForPublish) {
      setErrorMsg("Please resolve all validation errors before publishing.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payloadLines = Object.entries(linesState).map(([code, cfg]) => {
        const cat = CANONICAL_SERVICES_CATALOG.find((c) => c.service_code === code);
        return {
          serviceCode: code,
          title: cat?.title,
          scopeSummary: cat?.scope_description,
          deliverables: cat?.deliverables,
          unit: cat?.unit || "project",
          quantity: cfg.quantity,
          unitPriceRupees: cfg.isIncludedNoCharge ? 0 : parseFloat(cfg.unitPriceRupees) || null,
          isIncludedNoCharge: cfg.isIncludedNoCharge,
          chargeWaiverReason: cfg.chargeWaiverReason,
          isSelected: cfg.isSelected,
        };
      });

      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          contactEmail,
          contactPhone,
          billingAddress,
          cityStatePin,
          projectTitle,
          projectBrief,
          timelineEstimate,
          validityDays,
          lines: payloadLines,
          manualDiscountRupees: parseFloat(manualDiscountRupees) || 0,
          appliedCouponCode: selectedCouponCode || null,
          internalNotes,
          publishImmediately,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create quotation");
      }

      router.push(`/admin/quotations/${data.quotation.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Client Setup */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Client Profile & Recipient</h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">Recipient organization details for quotation projection.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Apex Global Health Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Representative *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Dr. Arvind Swaminathan"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="e.g. arvind@apexhealth.in"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="+91 98401 22345"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Street Address</label>
            <input
              type="text"
              placeholder="12 Healthcare Avenue, Anna Nagar"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City, State & PIN Code</label>
            <input
              type="text"
              placeholder="Chennai, Tamil Nadu 600040"
              value={cityStatePin}
              onChange={(e) => setCityStatePin(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Project Scope & Timeline */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Project Title, Brief & Timeline</h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">High-level commercial identity displayed on header and contract.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline Estimate</label>
            <input
              type="text"
              placeholder="e.g. 3 to 5 weeks"
              value={timelineEstimate}
              onChange={(e) => setTimelineEstimate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Brief / Scope Summary</label>
            <textarea
              rows={2}
              value={projectBrief}
              onChange={(e) => setProjectBrief(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quotation Validity</label>
            <select
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days (Standard)</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: 77-Service Accordion Catalog Selector */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                Authoritative 77-Service Catalog Selector
              </h2>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                FE-01 is pre-priced at ₹50,000. All other 76 services require approved pricing or zero-charge waiver.
              </p>
            </div>
          </div>

          {/* Quick Search across 77 items */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 77 services (e.g. FE-01, DB, AI)..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Selected Services Counter Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="font-medium text-slate-700">
            Selected Services: <span className="font-bold text-blue-700">{calculations.selectedLinesCount}</span> / 77
          </span>
          <span className="text-slate-500 font-mono">
            Subtotal: <strong className="text-slate-900">{formatPaiseToINR(calculations.subtotalPaise)}</strong>
          </span>
        </div>

        {/* Categories Accordion */}
        <div className="space-y-3">
          {QUOTATION_CATEGORIES.map((cat) => {
            const catItems = CANONICAL_SERVICES_CATALOG.filter((s) => s.category_code === cat.code).filter(
              (s) =>
                !serviceSearch.trim() ||
                s.service_code.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                s.scope_description.toLowerCase().includes(serviceSearch.toLowerCase())
            );

            if (serviceSearch.trim() && catItems.length === 0) return null;

            const isExpanded = Boolean(expandedCategories[cat.code] || serviceSearch.trim());
            const selectedInCat = catItems.filter((s) => linesState[s.service_code]?.isSelected).length;

            return (
              <div
                key={cat.code}
                className="rounded-lg border border-slate-200 overflow-hidden bg-white"
              >
                {/* Category Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.code)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold font-mono flex items-center justify-center">
                      {cat.code}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-900">{cat.label}</span>
                      <p className="text-[11px] text-slate-500">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedInCat > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                        {selectedInCat} selected
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Category Service Items */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 p-2 space-y-2">
                    {catItems.map((item) => {
                      const cfg = linesState[item.service_code] || {
                        isSelected: false,
                        quantity: 1,
                        unitPriceRupees: "",
                        isIncludedNoCharge: false,
                        chargeWaiverReason: "",
                      };

                      const isDefaultPriced = item.service_code === "FE-01";

                      return (
                        <div
                          key={item.service_code}
                          className={`p-3 rounded-lg border transition-all ${
                            cfg.isSelected
                              ? "border-blue-300 bg-blue-50/20 shadow-2xs"
                              : "border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            {/* Checkbox & Details */}
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={cfg.isSelected}
                                onChange={(e) =>
                                  updateLine(item.service_code, { isSelected: e.target.checked })
                                }
                                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded">
                                    {item.service_code}
                                  </span>
                                  <span className="font-semibold text-sm text-slate-900">{item.title}</span>
                                  {isDefaultPriced ? (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                      Default ₹50,000 Starting Quoted Value
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                                      Requires Pricing / Zero-Charge Toggle
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600">{item.scope_description}</p>
                                {item.deliverables && item.deliverables.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {item.deliverables.map((del, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono"
                                      >
                                        ✓ {del}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Line Pricing & Controls */}
                            {cfg.isSelected && (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                                {/* Included at no additional charge toggle */}
                                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cfg.isIncludedNoCharge}
                                    onChange={(e) =>
                                      updateLine(item.service_code, {
                                        isIncludedNoCharge: e.target.checked,
                                        unitPriceRupees: e.target.checked ? "0" : cfg.unitPriceRupees,
                                      })
                                    }
                                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>Zero-charge waiver</span>
                                </label>

                                {cfg.isIncludedNoCharge ? (
                                  <input
                                    type="text"
                                    placeholder="Waiver rationale (e.g. Complimentary launch setup)"
                                    value={cfg.chargeWaiverReason}
                                    onChange={(e) =>
                                      updateLine(item.service_code, { chargeWaiverReason: e.target.value })
                                    }
                                    className="w-60 px-2.5 py-1 text-xs rounded border border-amber-300 bg-amber-50/50 text-slate-800 focus:ring-1 focus:ring-blue-500"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-slate-500 font-mono">Qty:</span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={cfg.quantity}
                                        onChange={(e) =>
                                          updateLine(item.service_code, {
                                            quantity: Math.max(1, parseInt(e.target.value) || 1),
                                          })
                                        }
                                        className="w-14 px-2 py-1 text-xs rounded border border-slate-200 text-center font-mono"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-slate-500 font-mono">₹</span>
                                      <input
                                        type="number"
                                        placeholder="Rupees"
                                        value={cfg.unitPriceRupees}
                                        onChange={(e) =>
                                          updateLine(item.service_code, { unitPriceRupees: e.target.value })
                                        }
                                        className="w-28 px-2.5 py-1 text-xs rounded border border-slate-200 font-mono font-semibold"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 4: Discounts, Coupons & Deductions */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Discounts & Coupon Application</h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">Founder direct goodwill discount or authorized promotional coupon.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Manual Founder Goodwill (₹)</label>
            <div className="relative">
              <span className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm">₹</span>
              <input
                type="number"
                min={0}
                value={manualDiscountRupees}
                onChange={(e) => setManualDiscountRupees(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Active Coupon</label>
            <select
              value={selectedCouponCode}
              onChange={(e) => setSelectedCouponCode(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">No Coupon Applied</option>
              {availableCoupons.map((c) => (
                <option key={c.id} value={c.code} disabled={!c.is_active}>
                  {c.code} — {c.campaign_name} {!c.is_active ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 5: Dual 50% Milestone Split & Calculation Display */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-blue-100">
          <div className="w-7 h-7 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white flex items-center justify-center font-bold text-xs">
            5
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Real-Time Pricing & Dual 50% Milestone Invariant
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Enforcing exact integer paise conservation with odd-paise allocated to Milestone 2.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Subtotal</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              {formatPaiseToINR(calculations.subtotalPaise)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{calculations.subtotalPaise} paise</span>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Discount Applied</span>
            <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
              {formatPaiseToINR(calculations.totalDiscountPaise)}
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">
              {calculations.couponLabel || "Founder Approved"}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Taxes (GST)</span>
            <div className="text-xl font-bold text-slate-700 mt-1 font-mono">₹0.00</div>
            <span className="text-[10px] text-slate-400">GST Exempt / Composition</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white">
            <span className="text-[11px] font-semibold text-blue-200 uppercase">Total Payable</span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">
              {formatPaiseToINR(calculations.totalPayablePaise)}
            </div>
            <span className="text-[10px] text-blue-200 font-mono">{calculations.totalPayablePaise} paise</span>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-blue-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">Milestone 1 · 50% Advance</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-800 font-bold">
                50% Upfront
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {formatPaiseToINR(calculations.milestone1Paise)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Payable before engineering sprint commences. Covers environment setup, component architecture, and discovery.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">Milestone 2 · 50% Completion</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-800 font-bold">
                50% Handover
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
              {formatPaiseToINR(calculations.milestone2Paise)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Payable upon demo sign-off prior to production deployment and domain handover.
              {calculations.hasOddPaiseConservation && (
                <span className="text-blue-700 font-medium block mt-0.5">
                  Includes odd-paise balance conservation (+₹0.01).
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Step 6: Issuer Profile & Legal Notice */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xs">
            6
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Issuer Profile & Terms</h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">Canonical issuer credentials embedded in the official PDF & portal.</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
          <div>
            <strong>Legal Entity:</strong> {DEFAULT_LIT_ISSUER.legal_name}
          </div>
          <div>
            <strong>MSME Registration:</strong> {DEFAULT_LIT_ISSUER.msme_udyam} ({DEFAULT_LIT_ISSUER.msme_category})
          </div>
          <div>
            <strong>Registered Address:</strong> {DEFAULT_LIT_ISSUER.registered_address}
          </div>
          <div>
            <strong>Official Email:</strong> {DEFAULT_LIT_ISSUER.official_email}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Staff Notes</label>
          <textarea
            rows={2}
            placeholder="Confidential notes for internal sales records (never leaked to client portal)..."
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Step 7: Publication Gate & Actions */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xs">
            7
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Validation & Publication Gate</h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">Ensure invariant compliance before issuing secure link.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {calculations.validationErrors.length > 0 ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Cannot Publish: {calculations.validationErrors.length} Requirement(s) Pending</span>
            </div>
            <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
              {calculations.validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-700 pt-1">
              * Note: You may still save as a Draft and finalize pricing later.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All publication checks passed! Ready to issue quotation with verified MSME credentials.</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href="/admin/quotations"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Cancel & Return to Registry
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={submitting || !calculations.isValidForPublish}
              onClick={() => handleSubmit(true)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg font-bold text-xs text-white shadow-xs transition-colors ${
                calculations.isValidForPublish && !submitting
                  ? "bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Publish & Generate Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
