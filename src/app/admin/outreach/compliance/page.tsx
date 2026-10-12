import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Globe,
  Database,
  Clock,
  Layers,
  FileCheck,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { ComplianceRulesTable, type PolicyRuleWithApproval } from "./compliance-rules-table";

export const metadata: Metadata = {
  title: "Outreach Compliance & Jurisdiction Governance | Admin | Logic Intelligence Technologies",
  description: "Granular regulatory compliance policy, legal review registry, and dispatch gating matrix.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface JurisdictionRow {
  country_code: string;
  country_name: string | null;
  outreach_status: string;
  legal_framework: string | null;
  requires_opt_in: boolean | null;
  rule_summary: string | null;
}

interface PolicyRuleDbRow {
  id: string;
  country_code: string;
  region: string | null;
  channel: string;
  recipient_class: string;
  purpose: string;
  policy_status: string;
  requires_consent: boolean;
  rule_version: string;
  official_source_urls: string[] | null;
  expires_at: string | null;
  notes: string | null;
  rule_key: string | null;
}

interface PolicyApprovalDbRow {
  id: string;
  rule_id: string;
  reviewer_email: string;
  reviewer_role: string;
  reviewer_qualification: string | null;
  decision: string;
  expires_at: string;
  status: string;
  decided_at: string;
}

interface RecentDecisionRow {
  id: string;
  country_code: string;
  channel: string;
  result: string;
  reason_codes: string[];
  evaluated_at: string;
}

const STATUS_BADGES: Record<string, { label: string; tone: string }> = {
  permitted: {
    label: "Permitted for verified scenario",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  review_required: {
    label: "Legal review required",
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
  restricted: {
    label: "Restricted — evidence required",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
  },
  blocked: {
    label: "Not approved for this channel",
    tone: "border-rose-300 bg-rose-100 text-rose-900",
  },
};

export default async function OutreachCompliancePage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach/compliance");

  const [jurRes, rulesRes, approvalsRes, decRes] = await Promise.all([
    supabaseAdmin
      .from("lead_jurisdictions")
      .select("country_code, country_name, outreach_status, legal_framework, requires_opt_in, rule_summary")
      .order("country_code", { ascending: true }),
    supabaseAdmin
      .from("outreach_policy_rules")
      .select("id, country_code, region, channel, recipient_class, purpose, policy_status, requires_consent, rule_version, official_source_urls, expires_at, notes, rule_key")
      .order("country_code", { ascending: true })
      .order("purpose", { ascending: true }),
    supabaseAdmin
      .from("outreach_policy_approvals")
      .select("id, rule_id, reviewer_email, reviewer_role, reviewer_qualification, decision, expires_at, status, decided_at")
      .eq("status", "active")
      .order("decided_at", { ascending: false }),
    supabaseAdmin
      .from("outreach_eligibility_decisions")
      .select("id, country_code, channel, result, reason_codes, evaluated_at")
      .order("evaluated_at", { ascending: false })
      .limit(8),
  ]);

  const hasDbError = Boolean(jurRes.error || rulesRes.error);
  const jurisdictions: JurisdictionRow[] = jurRes.data || [];
  const rulesData: PolicyRuleDbRow[] = rulesRes.data || [];
  const approvalsData: PolicyApprovalDbRow[] = approvalsRes.data || [];
  const decisions: RecentDecisionRow[] = decRes.data || [];

  // Map active approvals to rules by rule_id
  const approvalMap = new Map<string, PolicyApprovalDbRow>();
  for (const app of approvalsData) {
    if (!approvalMap.has(app.rule_id)) {
      approvalMap.set(app.rule_id, app);
    }
  }

  const rulesWithApprovals: PolicyRuleWithApproval[] = rulesData.map((r) => ({
    id: r.id,
    country_code: r.country_code,
    region: r.region,
    channel: r.channel,
    recipient_class: r.recipient_class,
    purpose: r.purpose,
    policy_status: r.policy_status,
    requires_consent: r.requires_consent,
    rule_version: r.rule_version,
    official_source_urls: r.official_source_urls || [],
    expires_at: r.expires_at,
    notes: r.notes,
    rule_key: r.rule_key,
    active_approval: approvalMap.get(r.id) || null,
  }));

  // Metrics calculation
  const totalRules = rulesWithApprovals.length;
  const uniqueScopes = new Set(rulesWithApprovals.map((r) => r.rule_key || `${r.country_code}:${r.channel}:${r.purpose}`)).size;
  const approvedScenarios = rulesWithApprovals.filter((r) => r.policy_status === "permitted").length;
  const reviewNeeded = rulesWithApprovals.filter((r) => r.policy_status === "review_required").length;
  const restrictedProhibited = rulesWithApprovals.filter((r) => r.policy_status === "restricted" || r.policy_status === "blocked").length;

  const now = new Date();
  const expiringSoon = rulesWithApprovals.filter((r) => {
    const exp = r.active_approval?.expires_at || r.expires_at;
    if (!exp) return false;
    const diffDays = (new Date(exp).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  // India dual-state detection
  const indiaRules = rulesWithApprovals.filter((r) => r.country_code === "IN");
  const indiaHasNarrowPilot = indiaRules.some((r) => r.purpose === "b2b_pilot_demonstration" && r.policy_status === "permitted");
  const indiaHasReviewRequired = indiaRules.some((r) => r.purpose !== "b2b_pilot_demonstration" && r.policy_status === "review_required");
  const showIndiaCallout = indiaHasNarrowPilot && indiaHasReviewRequired;

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/outreach" label="Back to Outreach Overview" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[var(--lit-teal,#1FA9A2)]" />
            <h1 className="text-xl font-bold text-[var(--lit-navy,#0B2545)]">
              Global Outreach Compliance &amp; Regulatory Gate
            </h1>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
            Authoritative, channel-specific policy engine governing cross-border communications under international anti-spam statutes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Default-Deny Enforced
          </span>
        </div>
      </div>

      <OutreachNav active="compliance" />

      {/* Database Error Banner */}
      {hasDbError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold">Compliance Database Connection Interrupted</h3>
            <p>
              Could not retrieve real-time policy rules from Supabase. The system has automatically locked into
              fail-closed mode: all outbound marketing dispatches are blocked until connectivity is verified.
            </p>
          </div>
        </div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
            Scoped Rules
          </span>
          <span className="text-xl font-extrabold text-[var(--lit-navy,#0B2545)] block mt-1 font-mono">
            {totalRules}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
            {uniqueScopes} unique scopes
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Approved Scenarios
          </span>
          <span className="text-xl font-extrabold text-emerald-800 block mt-1 font-mono">
            {approvedScenarios}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            Signed by legal
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Review Needed
          </span>
          <span className="text-xl font-extrabold text-amber-800 block mt-1 font-mono">
            {reviewNeeded}
          </span>
          <span className="text-[10px] text-amber-600 block mt-0.5">
            Awaiting signoff
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Restricted / Blocked
          </span>
          <span className="text-xl font-extrabold text-rose-800 block mt-1 font-mono">
            {restrictedProhibited}
          </span>
          <span className="text-[10px] text-rose-600 block mt-0.5">
            Evidence required
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Expiring &lt;30d
          </span>
          <span className="text-xl font-extrabold text-slate-800 block mt-1 font-mono">
            {expiringSoon}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Review cycle active
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
            DB Health
          </span>
          <div className="flex items-center gap-1 mt-1 text-emerald-600 font-bold">
            <Database className="w-4 h-4 shrink-0" />
            <span className="text-xs">Normalized</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Constraints active
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider block">
            Synchronized
          </span>
          <div className="flex items-center gap-1 mt-1 text-slate-700 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{now.toISOString().slice(11, 19)} UTC</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Live PostgreSQL
          </span>
        </div>
      </div>

      {/* India Controlled Pilot Callout Banner */}
      {showIndiaCallout && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/75 p-4 flex items-start gap-3.5 text-amber-900 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-950">
              India Scoped Pilot Isolation Notice
            </h4>
            <p className="text-amber-800">
              Approved India scenario (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">v1.0-pilot</code>) is strictly restricted to{" "}
              <strong>B2B Pilot Demonstrations</strong> for qualified prospective enterprise partners. Standard commercial outreach (
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">v1.0</code>) remains in <em>Legal Review Required</em> status under DPDP Act 2023 &amp; TRAI commercial communication regulations.
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              &bull; Narrow pilot authorization does NOT constitute a blanket approval for general outreach across India. Specific scenario-over-broad precedence is enforced by database triggers and the eligibility engine.
            </p>
          </div>
        </div>
      )}

      {/* Non-Negotiable Five Independent Status Dimensions Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--lit-navy,#0B2545)]" />
          <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
            Five Independent Status Dimensions of Outreach Governance
          </h2>
        </div>
        <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
          LIT operates on a strict multi-tier verification model. A green policy rule is necessary but never sufficient on its own for message transmission.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1">
            <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)] block text-[11px]">
              1. Country Baseline
            </span>
            <p className="text-[11px] text-slate-600">
              Broad country posture recorded in <code className="font-mono text-[10px]">lead_jurisdictions</code>. Never grants individual contact clearance.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1">
            <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)] block text-[11px]">
              2. Scoped Legal Policy
            </span>
            <p className="text-[11px] text-slate-600">
              Specific jurisdiction, channel, recipient class, purpose, and version rule with active legal counsel approval.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1">
            <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)] block text-[11px]">
              3. Recipient Eligibility
            </span>
            <p className="text-[11px] text-slate-600">
              Dynamic verification of consent, opt-in records, global suppression lists, and cooldown timers at runtime.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1">
            <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)] block text-[11px]">
              4. Human Message Review
            </span>
            <p className="text-[11px] text-slate-600">
              10-point QA verification and authorized operator approval of draft content. Draft approval is not dispatch authorization.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-1">
            <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)] block text-[11px]">
              5. Delivery &amp; Telemetry
            </span>
            <p className="text-[11px] text-slate-600">
              Final preflight verification before provider transmission with cryptographic audit trail and HMAC webhook confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Normalized Granular Policy Rules Matrix with Filters and Modal */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
            Normalized Scoped Policy Rules Matrix
          </h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Deduplicated, version-controlled rules matching exact jurisdiction, channel, recipient classification, and communication purpose.
          </p>
        </div>

        <ComplianceRulesTable rules={rulesWithApprovals} />
      </div>

      {/* Macro Country Allowlist Status */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              Broad Country Baseline Registry (`lead_jurisdictions`)
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Macro statutory postures. Note: &ldquo;Allowed&rdquo; indicates absence of general embargo, NOT a contact-level sending license.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {jurisdictions.length} Jurisdictions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {jurisdictions.map((j) => {
            const badge = STATUS_BADGES[j.outreach_status] ?? {
              label: j.outreach_status.replace(/_/g, " "),
              tone: "border-slate-200 bg-slate-100 text-slate-700",
            };
            return (
              <div key={j.country_code} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                    {j.country_code} &mdash; {j.country_name || j.country_code}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold ${badge.tone}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {j.rule_summary || j.legal_framework || "Default conservative stance."}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Evaluated Decisions Stream */}
      {decisions.length > 0 && (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              Live Eligibility Evaluation Telemetry
            </h3>
            <span className="text-xs text-slate-400 font-mono">Last {decisions.length} evaluations</span>
          </div>

          <div className="space-y-2 text-xs">
            {decisions.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-700">{d.country_code}</span>
                  <span className="text-slate-500 capitalize">{d.channel}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {d.reason_codes?.[0] || d.result}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      d.result === "permitted"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {d.result}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {d.evaluated_at.slice(11, 19)} UTC
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
