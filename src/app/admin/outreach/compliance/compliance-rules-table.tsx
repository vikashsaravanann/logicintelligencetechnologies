"use client";

import { useState, useMemo } from "react";
import { LegalApprovalModal } from "./legal-approval-modal";
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";

export interface PolicyRuleWithApproval {
  id: string;
  country_code: string;
  region: string | null;
  channel: string;
  recipient_class: string;
  purpose: string;
  policy_status: string;
  requires_consent: boolean;
  rule_version: string;
  official_source_urls: string[];
  expires_at: string | null;
  notes: string | null;
  rule_key: string | null;
  active_approval?: {
    id: string;
    reviewer_email: string;
    reviewer_role: string;
    reviewer_qualification: string | null;
    decision: string;
    expires_at: string;
    status: string;
    decided_at: string;
  } | null;
}

interface ComplianceRulesTableProps {
  rules: PolicyRuleWithApproval[];
}

const STATUS_BADGES: Record<string, { label: string; tone: string; dot: string }> = {
  permitted: {
    label: "Permitted for verified scenario",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
  review_required: {
    label: "Legal review required",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  restricted: {
    label: "Restricted — evidence required",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
  },
  blocked: {
    label: "Not approved for this channel",
    tone: "border-rose-300 bg-rose-100 text-rose-900",
    dot: "bg-rose-700",
  },
};

export function ComplianceRulesTable({ rules }: ComplianceRulesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (statusFilter !== "all" && r.policy_status !== statusFilter) {
        return false;
      }
      if (channelFilter !== "all" && r.channel !== channelFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesCountry = r.country_code.toLowerCase().includes(q);
        const matchesPurpose = r.purpose.toLowerCase().includes(q);
        const matchesChannel = r.channel.toLowerCase().includes(q);
        const matchesClass = r.recipient_class.toLowerCase().includes(q);
        const matchesNotes = (r.notes || "").toLowerCase().includes(q);
        const matchesReviewer = (r.active_approval?.reviewer_email || "").toLowerCase().includes(q);
        if (
          !matchesCountry &&
          !matchesPurpose &&
          !matchesChannel &&
          !matchesClass &&
          !matchesNotes &&
          !matchesReviewer
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rules, searchTerm, statusFilter, channelFilter]);

  const exportCsv = () => {
    const headers = [
      "Jurisdiction",
      "Region",
      "Channel",
      "Recipient Class",
      "Purpose",
      "Rule Version",
      "Policy Status",
      "Requires Consent",
      "Reviewer Email",
      "Reviewer Role",
      "Approval Expiry",
      "Official Source",
      "Notes",
    ];

    const rows = filteredRules.map((r) => [
      `"${r.country_code}"`,
      `"${r.region || "National"}"`,
      `"${r.channel}"`,
      `"${r.recipient_class}"`,
      `"${r.purpose}"`,
      `"${r.rule_version}"`,
      `"${r.policy_status}"`,
      `"${r.requires_consent ? "true" : "false"}"`,
      `"${r.active_approval?.reviewer_email || "N/A"}"`,
      `"${r.active_approval?.reviewer_role || "N/A"}"`,
      `"${r.active_approval?.expires_at ? r.active_approval.expires_at.slice(0, 10) : "Unassigned"}"`,
      `"${(r.official_source_urls || []).join("; ")}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `outreach_policy_rules_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by country, purpose, reviewer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 text-xs text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs text-[var(--lit-navy,#0B2545)] focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
          >
            <option value="all">All Statuses</option>
            <option value="permitted">Permitted</option>
            <option value="review_required">Review Required</option>
            <option value="restricted">Restricted</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs text-[var(--lit-navy,#0B2545)] focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500">
            Showing {filteredRules.length} of {rules.length} Rules
          </span>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-xs font-bold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[900px]">
          <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <tr>
              <th className="px-4 py-3">Jurisdiction</th>
              <th className="px-4 py-3">Channel / Class</th>
              <th className="px-4 py-3">Purpose &amp; Version</th>
              <th className="px-4 py-3">Effective Status</th>
              <th className="px-4 py-3">Legal Basis &amp; Source</th>
              <th className="px-4 py-3">Reviewer &amp; Expiry</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No policy rules match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredRules.map((r) => {
                const badge = STATUS_BADGES[r.policy_status] ?? {
                  label: r.policy_status.replace(/_/g, " "),
                  tone: "border-slate-200 bg-slate-100 text-slate-700",
                  dot: "bg-slate-400",
                };

                const approval = r.active_approval;
                let expiryDisplay = "Approval not recorded / expiry not assigned";
                let daysLeft: number | null = null;

                if (approval && approval.expires_at) {
                  const expDate = new Date(approval.expires_at);
                  const now = new Date();
                  const diffTime = expDate.getTime() - now.getTime();
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  expiryDisplay = `${approval.expires_at.slice(0, 10)} (${daysLeft}d left)`;
                } else if (r.expires_at) {
                  const expDate = new Date(r.expires_at);
                  const now = new Date();
                  const diffTime = expDate.getTime() - now.getTime();
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  expiryDisplay = `${r.expires_at.slice(0, 10)} (${daysLeft}d left)`;
                }

                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Jurisdiction */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                          {r.country_code}
                        </span>
                        {r.region && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                            {r.region}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {r.rule_key?.slice(0, 24)}...
                      </span>
                    </td>

                    {/* Channel & Recipient Class */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 capitalize block">
                        {r.channel}
                      </span>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {r.recipient_class.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Purpose & Version */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-700 block">
                        {r.purpose.replace(/_/g, " ")}
                      </span>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                        v{r.rule_version}
                      </span>
                    </td>

                    {/* Effective Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${badge.tone}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                      {r.requires_consent && (
                        <span className="block mt-1 text-[10px] font-semibold text-rose-700">
                          Prior Opt-In Required
                        </span>
                      )}
                    </td>

                    {/* Legal Basis & Source */}
                    <td className="px-4 py-3.5 text-[11px] text-slate-600 max-w-xs">
                      <p className="line-clamp-2">{r.notes || "Standard statutory requirements apply."}</p>
                      {r.official_source_urls?.[0] && (
                        <a
                          href={r.official_source_urls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[var(--lit-blue,#1565C0)] hover:underline mt-1 font-medium"
                        >
                          <span>Official Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>

                    {/* Reviewer & Expiry */}
                    <td className="px-4 py-3.5 text-[11px]">
                      {approval ? (
                        <div className="space-y-0.5">
                          <span className="font-mono font-medium text-slate-800 block truncate max-w-[150px]">
                            {approval.reviewer_email}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize block">
                            {approval.reviewer_role.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`font-mono text-[10px] block ${
                              daysLeft !== null && daysLeft <= 30
                                ? "text-amber-600 font-bold"
                                : "text-slate-500"
                            }`}
                          >
                            {expiryDisplay}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5 text-slate-400">
                          <span className="font-medium text-slate-500 block">Pending Review</span>
                          <span className="text-[10px] italic block text-slate-400">
                            Approval not recorded / expiry not assigned
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <LegalApprovalModal
                        ruleId={r.id}
                        countryCode={r.country_code}
                        channel={r.channel}
                        purpose={r.purpose}
                        ruleVersion={r.rule_version}
                        currentStatus={r.policy_status}
                        activeApprovalId={approval?.id}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
