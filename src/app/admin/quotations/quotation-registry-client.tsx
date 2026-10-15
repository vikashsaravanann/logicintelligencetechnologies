"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuotationRecord, QuotationStatus } from "@/types/quotations";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Download,
  ExternalLink,
  BookOpen,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
  Share2,
  ArrowUpRight,
  FileEdit,
  Loader2,
  Send,
} from "lucide-react";

interface QuotationRegistryClientProps {
  initialQuotations: QuotationRecord[];
}

export function QuotationRegistryClient({
  initialQuotations,
}: QuotationRegistryClientProps) {
  const router = useRouter();
  const [quotations, setQuotations] = useState<QuotationRecord[]>(initialQuotations);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());

  // Filtered list
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        q.quotation_ref.toLowerCase().includes(term) ||
        q.company_name.toLowerCase().includes(term) ||
        q.project_title.toLowerCase().includes(term) ||
        q.recipient_name.toLowerCase().includes(term) ||
        q.recipient_email.toLowerCase().includes(term)
      );
    });
  }, [quotations, statusFilter, searchQuery]);

  // KPI calculations
  const kpis = useMemo(() => {
    const totalCount = quotations.length;
    const totalPaise = quotations.reduce((acc, q) => acc + (q.total_payable_paise || 0), 0);
    const publishedCount = quotations.filter((q) => q.status === "published").length;
    const acceptedCount = quotations.filter((q) => q.status === "accepted").length;
    const acceptedPaise = quotations
      .filter((q) => q.status === "accepted")
      .reduce((acc, q) => acc + (q.total_payable_paise || 0), 0);
    const draftCount = quotations.filter((q) => q.status === "draft").length;

    return {
      totalCount,
      totalPaise,
      publishedCount,
      acceptedCount,
      acceptedPaise,
      draftCount,
    };
  }, [quotations]);

  const handleCopyLink = async (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const portalUrl = `${window.location.origin}/quotation/${token}`;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    } catch {
      prompt("Copy secure quotation link:", portalUrl);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Create a duplicate copy of this quotation?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/quotations/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok && data.newId) {
        router.push(`/admin/quotations/${data.newId}`);
      } else {
        alert(data.error || "Failed to duplicate quotation");
      }
    } catch (err: any) {
      alert("Error duplicating quotation: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispatchEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchingId(id);
    try {
      const res = await fetch(`/api/admin/quotations/${id}/send-email`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDispatchedIds((prev) => new Set(prev).add(id));
      } else {
        alert(data.error || "Failed to dispatch quotation email");
      }
    } catch {
      alert("Network error dispatching email");
    } finally {
      setDispatchingId(null);
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowUpRight className="w-3 h-3" /> Published
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case "changes_requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle className="w-3 h-3" /> Revisions Req.
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            <XCircle className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getDeliveryBadge = (state?: string) => {
    switch (state) {
      case "email_sent":
        return <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Email Dispatched</span>;
      case "link_shared":
        return <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Link Active</span>;
      case "viewed":
        return <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Client Viewed</span>;
      default:
        return <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Not Dispatched</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[var(--lit-text-muted,#52677C)]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Pipeline</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--lit-navy,#0B2545)]">
              {kpis.totalCount}
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              ({formatPaiseToINR(kpis.totalPaise)})
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)]">All authored quotations</p>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Active</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-900">{kpis.publishedCount}</span>
            <span className="text-xs text-blue-700 font-medium">Pending Decision</span>
          </div>
          <p className="mt-1 text-xs text-blue-600">Locked versions in client hands</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Accepted Deals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-900">{kpis.acceptedCount}</span>
            <span className="text-xs text-emerald-700 font-medium">
              ({formatPaiseToINR(kpis.acceptedPaise)})
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600">Digitally signed & approved</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts In Work</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{kpis.draftCount}</span>
            <span className="text-xs text-amber-700 font-medium">Unpublished</span>
          </div>
          <p className="mt-1 text-xs text-amber-600">Awaiting pricing or review</p>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref, company, project, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--lit-border-light,#DFE7EF)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "draft", label: "Drafts" },
            { id: "published", label: "Published" },
            { id: "accepted", label: "Accepted" },
            { id: "changes_requested", label: "Revisions" },
            { id: "expired", label: "Expired" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                  : "text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Hub Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/quotations/catalog"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Inspect 77 Canonical IT Services"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>77-Catalog</span>
          </Link>
          <Link
            href="/admin/quotations/coupons"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Manage Discount & Launch Coupons"
          >
            <Tag className="w-3.5 h-3.5 text-slate-600" />
            <span>Coupons</span>
          </Link>
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Reference & Status</th>
                <th className="py-3.5 px-4">Client & Project</th>
                <th className="py-3.5 px-4">Total Payable (INR)</th>
                <th className="py-3.5 px-4">50% Milestones</th>
                <th className="py-3.5 px-4">Delivery</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-medium text-slate-700">No quotations found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => router.push(`/admin/quotations/${q.id}`)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    {/* Reference & Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-[var(--lit-navy,#0B2545)] text-sm">
                        {q.quotation_ref}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {getStatusBadge(q.status)}
                        <span className="text-[11px] font-mono text-slate-400">v{q.version_number}</span>
                      </div>
                    </td>

                    {/* Client & Project */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {q.company_name}
                      </div>
                      <div className="text-xs text-[var(--lit-text-muted,#52677C)] truncate">
                        {q.project_title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {q.recipient_name} · {q.recipient_email}
                      </div>
                    </td>

                    {/* Total Payable */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-[var(--lit-navy,#0B2545)] text-base">
                        {formatPaiseToINR(q.total_payable_paise)}
                      </div>
                      {q.discount_paise > 0 && (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Saved {formatPaiseToINR(q.discount_paise)}
                        </div>
                      )}
                    </td>

                    {/* Milestones Dual 50% */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-xs text-slate-600 font-mono">
                        M1: <span className="font-semibold">{formatPaiseToINR(q.milestone_1_paise)}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        M2: <span className="font-semibold">{formatPaiseToINR(q.milestone_2_paise)}</span>
                      </div>
                    </td>

                    {/* Delivery State */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getDeliveryBadge(q.delivery_state)}
                    </td>

                    {/* Valid Until */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                      <div>
                        {q.valid_until
                          ? new Date(q.valid_until).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                      <div className="text-[10px] text-slate-400">14-day validity</div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Inspect Button - EXACTLY matching Proposal Creation */}
                        <Link
                          href={`/admin/quotations/${q.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs"
                          title="Inspect Quotation Details"
                        >
                          <FileEdit className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                          <span>Inspect</span>
                        </Link>

                        {/* Dispatch Button - EXACTLY matching Proposal Creation */}
                        <button
                          type="button"
                          onClick={(e) => handleDispatchEmail(q.id, e)}
                          disabled={dispatchingId === q.id || dispatchedIds.has(q.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
                            dispatchedIds.has(q.id)
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] disabled:opacity-50"
                          }`}
                          title="Dispatch quotation email to client"
                        >
                          {dispatchingId === q.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : dispatchedIds.has(q.id) ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Send className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                          )}
                          <span>
                            {dispatchingId === q.id ? "Sending…" : dispatchedIds.has(q.id) ? "Dispatched" : "Dispatch"}
                          </span>
                        </button>

                        {/* Portal Public View Link */}
                        {q.secure_token && (
                          <Link
                            href={`/quotation/${q.secure_token}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors ml-1"
                            title="Open Public Client View"
                          >
                            <span>Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}

                        {/* Copy Link Button */}
                        <button
                          onClick={(e) => handleCopyLink(q.secure_token || "", e)}
                          disabled={!q.secure_token}
                          title="Copy Client Portal Link"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-40"
                        >
                          {copiedToken === q.secure_token ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Download PDF Button */}
                        <a
                          href={`/api/documents/quotation/${q.secure_token}/pdf`}
                          download={`LIT_Quotation_${q.quotation_ref}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          title="Download Generated PDF"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
