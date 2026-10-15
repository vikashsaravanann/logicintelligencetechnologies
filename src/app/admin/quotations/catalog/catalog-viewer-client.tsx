"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CANONICAL_SERVICES_CATALOG,
  QUOTATION_CATEGORIES,
} from "@/lib/quotations/catalog-seed-data";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import {
  Search,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";

export function CatalogViewerClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredServices = useMemo(() => {
    return CANONICAL_SERVICES_CATALOG.filter((item) => {
      if (selectedCategory !== "ALL" && item.category_code !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.service_code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.scope_description.toLowerCase().includes(q) ||
        (item.deliverables && item.deliverables.some((d) => d.toLowerCase().includes(q)))
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Policy Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 text-sm text-blue-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-blue-950">
              Deterministic 77-Service Canonical Catalog & Pricing Policy
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              In accordance with LIT Enterprise Pricing Policy, exactly one service (
              <span className="font-mono font-bold">FE-01: Enterprise Frontend Engineering</span>
              ) holds an authoritative starting default of ₹50,000 (5,000,000 paise). The remaining 76 services
              remain strictly bespoke and unpriced (<span className="font-mono font-semibold">NULL</span>) until
              authorized staff explicitly enter a manual valuation during quotation authoring.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code (e.g. FE-01), service title, or deliverable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Author Quotation</span>
          </Link>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            selectedCategory === "ALL"
              ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
              : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-600 hover:bg-slate-50"
          }`}
        >
          All 77 Services ({CANONICAL_SERVICES_CATALOG.length})
        </button>
        {QUOTATION_CATEGORIES.map((cat) => {
          const count = CANONICAL_SERVICES_CATALOG.filter((s) => s.category_code === cat.code).length;
          return (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.code
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                  : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.code}. {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const isPricedDefault = service.service_code === "FE-01";

          return (
            <div
              key={service.service_code}
              className={`flex flex-col justify-between rounded-xl border p-5 bg-white transition-all shadow-2xs hover:shadow-sm ${
                isPricedDefault
                  ? "border-emerald-300 ring-2 ring-emerald-500/20"
                  : "border-[var(--lit-border-light,#DFE7EF)]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {service.service_code}
                  </span>
                  {isPricedDefault ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      ₹50,000 Starting Quoted Value
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Bespoke (Unpriced)
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] line-clamp-1">
                  {service.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed line-clamp-2">
                  {service.scope_description}
                </p>

                {/* Deliverables */}
                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Key Deliverables
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {service.deliverables.slice(0, 3).map((d, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{d}</span>
                        </li>
                      ))}
                      {service.deliverables.length > 3 && (
                        <li className="text-[10px] text-slate-400 font-mono">
                          + {service.deliverables.length - 3} additional deliverable items
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px]">Unit: {service.unit}</span>
                <span className="text-[11px] text-slate-400">Category {service.category_code}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
