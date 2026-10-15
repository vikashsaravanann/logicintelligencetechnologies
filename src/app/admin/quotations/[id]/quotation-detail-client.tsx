"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QuotationRecord,
  QuotationLineItem,
  QuotationVersion,
  QuotationStatus,
} from "@/types/quotations";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import {
  FileText,
  Copy,
  Check,
  Download,
  Share2,
  Mail,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building,
  User,
  Calendar,
  Layers,
  History,
  Activity,
  MessageSquare,
  Lock,
  ArrowRight,
  Eye,
  X,
} from "lucide-react";

interface QuotationDetailClientProps {
  initialData: {
    quotation: QuotationRecord;
    lines: QuotationLineItem[];
    versions: QuotationVersion[];
    auditLogs: Array<{
      id: string;
      quotation_id: string;
      action: string;
      actor_email?: string | null;
      details: Record<string, unknown>;
      created_at: string;
    }>;
    acceptance?: {
      id: string;
      signer_name: string;
      signer_email: string;
      signer_title?: string | null;
      created_at: string;
    } | null;
  };
}

export function QuotationDetailClient({ initialData }: QuotationDetailClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"items" | "versions" | "audit">("items");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const { quotation, lines, versions, auditLogs, acceptance } = data;

  const clientPortalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quotation/${quotation.secure_token}`
      : `/quotation/${quotation.secure_token}`;

  const emailDraftSubject = `Quotation ${quotation.quotation_ref}: ${quotation.project_title} — Logic Intelligence Technologies`;
  const emailDraftBody = `Dear ${quotation.recipient_name},

Thank you for consulting with Logic Intelligence Technologies regarding "${quotation.project_title}".

We have prepared and issued your formal technical services quotation under MSME Registration UDYAM-TN-03-0345274.

Quotation Summary:
• Reference: ${quotation.quotation_ref} (Version ${quotation.version_number})
• Total Payable: ${formatPaiseToINR(quotation.total_payable_paise)}
• Milestone 1 (50% Upfront): ${formatPaiseToINR(quotation.milestone_1_paise)}
• Milestone 2 (50% Completion): ${formatPaiseToINR(quotation.milestone_2_paise)}
• Validity: 14 Days

You can review the full itemized scope, deliverables, and digitally sign off on the secure client portal:
${clientPortalUrl}

Or download the official PDF directly:
${typeof window !== "undefined" ? window.location.origin : ""}/api/documents/quotation/${quotation.secure_token}/pdf

Please feel free to reply directly or request revisions via the portal.

Sincerely,
Vikash Saravanan, Founder
Logic Intelligence Technologies
https://www.logicintelligencetechnologies.in`;

  const handlePublish = async () => {
    if (!confirm("Publish this quotation and freeze version snapshot?")) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/admin/quotations/${quotation.id}/publish`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.ok) {
        router.refresh();
        window.location.reload();
      } else {
        alert(result.error || "Failed to publish quotation");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDuplicate = async () => {
    if (!confirm("Create a duplicate copy of this quotation?")) return;
    try {
      const res = await fetch(`/api/admin/quotations/${quotation.id}/duplicate`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.ok && result.newId) {
        router.push(`/admin/quotations/${result.newId}`);
      } else {
        alert(result.error || "Failed to duplicate quotation");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleCopyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(clientPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      prompt("Copy client portal link:", clientPortalUrl);
    }
  };

  const handleCopyEmailText = async () => {
    try {
      await navigator.clipboard.writeText(emailDraftBody);
      setCopiedEmailText(true);
      setTimeout(() => setCopiedEmailText(false), 2000);
    } catch {
      prompt("Copy email draft:", emailDraftBody);
    }
  };

  const handleSendEmail = async () => {
    if (!confirm(`Dispatch formal quotation email to ${quotation.recipient_email}?`)) return;
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch(`/api/admin/quotations/${quotation.id}/send-email`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.ok) {
        setEmailStatus("Email dispatched successfully via Resend.");
        setTimeout(() => setEmailStatus(null), 4000);
      } else {
        alert(result.error || "Failed to send email");
      }
    } catch (e: any) {
      alert("Error sending email: " + e.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const whatsappHref = `https://wa.me/${(quotation.recipient_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${quotation.recipient_name}, your official quotation ${quotation.quotation_ref} for "${quotation.project_title}" (${formatPaiseToINR(
      quotation.total_payable_paise
    )}) is ready for review: ${clientPortalUrl}`
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-[var(--lit-navy,#0B2545)]">
                {quotation.quotation_ref}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700">
                v{quotation.version_number}
              </span>

              {quotation.status === "draft" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3" /> Draft
                </span>
              )}
              {quotation.status === "published" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3" /> Published
                </span>
              )}
              {quotation.status === "accepted" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Accepted & Signed
                </span>
              )}
              {quotation.status === "changes_requested" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <AlertCircle className="w-3 h-3" /> Revisions Requested
                </span>
              )}
            </div>

            <h1 className="mt-2 text-xl font-bold text-slate-900">{quotation.project_title}</h1>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Client: <strong className="text-slate-800">{quotation.company_name}</strong> ({quotation.recipient_name} · {quotation.recipient_email})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {quotation.status === "draft" && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold hover:bg-[var(--lit-navy,#0B2545)]/90 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isPublishing ? "Publishing..." : "Publish Quotation"}</span>
              </button>
            )}

            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share & Dispatch</span>
            </button>

            <a
              href={`/api/documents/quotation/${quotation.secure_token}/pdf`}
              download={`LIT_Quotation_${quotation.quotation_ref}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </a>

            <button
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
              title="Duplicate to new draft"
            >
              <span>Duplicate</span>
            </button>

            <a
              href={clientPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors"
              title="Preview Client View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </a>
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400">Total Value</span>
            <div className="font-mono font-bold text-base text-[var(--lit-navy,#0B2545)]">
              {formatPaiseToINR(quotation.total_payable_paise)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Dual Milestones</span>
            <div className="font-mono font-medium text-slate-700">
              50% / 50% split
            </div>
          </div>
          <div>
            <span className="text-slate-400">Date Issued</span>
            <div className="font-medium text-slate-700">
              {new Date(quotation.issued_at || quotation.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Valid Until</span>
            <div className="font-medium text-slate-700">
              {quotation.valid_until
                ? new Date(quotation.valid_until).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "30 days from issue"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "items"
              ? "border-[var(--lit-navy,#0B2545)] text-[var(--lit-navy,#0B2545)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Scope & Line Items ({lines.filter((l) => l.is_selected).length})</span>
        </button>

        <button
          onClick={() => setActiveTab("versions")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "versions"
              ? "border-[var(--lit-navy,#0B2545)] text-[var(--lit-navy,#0B2545)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version Snapshots ({versions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-[var(--lit-navy,#0B2545)] text-[var(--lit-navy,#0B2545)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Log & Acceptance ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Line Items & Commercial Breakdown */}
      {activeTab === "items" && (
        <div className="space-y-6">
          {/* Itemized Table */}
          <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Itemized Scope & Technical Deliverables</h3>
              <p className="text-xs text-slate-500">Contractual lines included in this quotation.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Scope & Deliverables</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Extended Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines
                    .filter((l) => l.is_selected)
                    .map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded">
                            {item.service_code}
                          </span>
                          <div className="font-semibold text-slate-900 text-xs mt-1">
                            {item.title}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <p className="text-xs text-slate-600">{item.scope_summary}</p>
                          {item.deliverables && item.deliverables.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.deliverables.map((del, dIdx) => (
                                <span
                                  key={dIdx}
                                  className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                                >
                                  ✓ {del}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.included_at_no_additional_charge && (
                            <div className="mt-1">
                              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Complimentary · {item.inclusion_rationale || "Approved Waiver"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-700">
                          {item.included_at_no_additional_charge
                            ? "₹0.00"
                            : formatPaiseToINR(item.quoted_unit_price_paise)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-slate-900">
                          {formatPaiseToINR(item.extended_amount_paise)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & 50% Milestones Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commercial Summary */}
            <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Financial Breakdown</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal</span>
                  <span className="font-mono font-medium">{formatPaiseToINR(quotation.subtotal_paise)}</span>
                </div>
                {quotation.discount_paise > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({quotation.discount_label || "Applied"})</span>
                    <span className="font-mono font-semibold">-{formatPaiseToINR(quotation.discount_paise)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST)</span>
                  <span className="font-mono font-medium">₹0.00 (Exempt)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  <span>Total Payable (INR)</span>
                  <span className="font-mono text-lg">{formatPaiseToINR(quotation.total_payable_paise)}</span>
                </div>
              </div>
            </div>

            {/* Dual 50% Milestones */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-900">Contractual Payment Schedule</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  Dual 50% Split
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Milestone 1: 50% Upfront Advance</span>
                    <span className="font-mono text-sm text-[var(--lit-navy,#0B2545)]">
                      {formatPaiseToINR(quotation.milestone_1_paise)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Payable prior to commencement of engineering sprints and environment setup.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Milestone 2: 50% Completion & Handover</span>
                    <span className="font-mono text-sm text-[var(--lit-navy,#0B2545)]">
                      {formatPaiseToINR(quotation.milestone_2_paise)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Payable upon demonstration sign-off prior to production deployment and domain routing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          {quotation.internal_notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Internal Staff Notes (Restricted · Never Projected to Client)</span>
              </div>
              <p className="text-amber-800">{quotation.internal_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Version Snapshots */}
      {activeTab === "versions" && (
        <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Immutable Version Snapshots</h3>
            <p className="text-xs text-slate-500">
              Every published version is cryptographically snapshotted with line snapshots and total payable.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {versions.map((ver) => (
              <div key={ver.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      Version {ver.version_number}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      SHA256: {ver.version_hash ? ver.version_hash.slice(0, 12) + "..." : "Initial"}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(ver.created_at).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Lines Snapshot:</span>{" "}
                    <strong>{ver.lines_snapshot?.length || 0} items</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Payable:</span>{" "}
                    <strong className="font-mono">{formatPaiseToINR(ver.total_payable_paise)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">M1:</span>{" "}
                    <span className="font-mono">{formatPaiseToINR(ver.milestone_1_paise)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">M2:</span>{" "}
                    <span className="font-mono">{formatPaiseToINR(ver.milestone_2_paise)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail & Acceptance Certificate */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Acceptance Certificate (if accepted) */}
          {quotation.status === "accepted" && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Legally Binding Digital Acceptance Certificate</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                <div>
                  <span className="text-emerald-700">Signatory:</span>
                  <div className="font-semibold text-slate-900">
                    {acceptance?.signer_name || quotation.recipient_name}
                  </div>
                  <div className="text-slate-500">{acceptance?.signer_title || "Authorized Representative"}</div>
                </div>
                <div>
                  <span className="text-emerald-700">Signed Timestamp:</span>
                  <div className="font-semibold text-slate-900">
                    {quotation.accepted_at ? new Date(quotation.accepted_at).toLocaleString("en-IN") : "Recorded"}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700">Agreed Contract Value:</span>
                  <div className="font-mono font-bold text-slate-900">
                    {formatPaiseToINR(quotation.total_payable_paise)}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white/80 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div>✓ Confirmed exact scope and specifications for Version {quotation.version_number}</div>
                <div>✓ Accepted 50% upfront advance and 50% completion milestone terms</div>
                <div>✓ Certified legal authorization to bind {quotation.company_name}</div>
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">System Activity & Audit Log</h3>
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{log.action}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Actor: {log.actor_email || "System"}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="mt-1 text-[10px] bg-slate-50 p-1.5 rounded font-mono text-slate-600 max-w-xl overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">
                    {new Date(log.created_at).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share / Dispatch Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Share & Dispatch Quotation</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailStatus && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailStatus}</span>
              </div>
            )}

            {/* Link 1: Secure Client Portal Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">1. Client Portal Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={clientPortalUrl}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
                <button
                  onClick={handleCopyPortalLink}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Email Dispatch Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">2. Email Dispatch</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 rounded-lg shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? "Sending..." : `Send to ${quotation.recipient_email}`}</span>
                </button>

                <button
                  onClick={handleCopyEmailText}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copiedEmailText ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedEmailText ? "Email Draft Copied" : "Copy Email Draft"}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">3. WhatsApp Direct Dispatch</label>
              <div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Dispatch Pre-filled WhatsApp Message</span>
                </a>
              </div>
            </div>

            {/* PDF Link */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">4. Official Cryptographic PDF</label>
              <div>
                <a
                  href={`/api/documents/quotation/${quotation.secure_token}/pdf`}
                  download={`LIT_Quotation_${quotation.quotation_ref}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Quotation-{quotation.quotation_ref}.pdf</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
