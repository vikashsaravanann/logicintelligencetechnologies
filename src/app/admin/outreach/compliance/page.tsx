import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";

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

interface PolicyRuleRow {
  id: string;
  country_code: string;
  channel: string;
  recipient_class: string;
  purpose: string;
  policy_status: string;
  requires_consent: boolean;
  rule_version: string;
  official_source_urls: string[];
  expires_at: string | null;
  notes: string | null;
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

  const [jurRes, rulesRes, decRes] = await Promise.all([
    supabaseAdmin
      .from("lead_jurisdictions")
      .select("country_code, country_name, outreach_status, legal_framework, requires_opt_in, rule_summary")
      .order("country_code", { ascending: true }),
    supabaseAdmin
      .from("outreach_policy_rules")
      .select("id, country_code, channel, recipient_class, purpose, policy_status, requires_consent, rule_version, official_source_urls, expires_at, notes")
      .order("country_code", { ascending: true }),
    supabaseAdmin
      .from("outreach_eligibility_decisions")
      .select("id, country_code, channel, result, reason_codes, evaluated_at")
      .order("evaluated_at", { ascending: false })
      .limit(8),
  ]);

  const hasDbError = Boolean(jurRes.error || rulesRes.error);
  const jurisdictions: JurisdictionRow[] = jurRes.data || [];
  const rules: PolicyRuleRow[] = rulesRes.data || [];
  const decisions: RecentDecisionRow[] = decRes.data || [];

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

      {/* Core Governance Principles Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
          Legal Basis &amp; System Enforcement Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-4 space-y-1.5">
            <span className="font-bold text-[var(--lit-navy,#0B2545)] block">1. Zero Presumption of Legality</span>
            <p className="text-slate-600">
              Absence of a recorded prohibition does not constitute permission. Communications are strictly denied until a documented legal ground is attached.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-4 space-y-1.5">
            <span className="font-bold text-[var(--lit-navy,#0B2545)] block">2. Channel &amp; Recipient Isolation</span>
            <p className="text-slate-600">
              Corporate email rules never authorize SMS, WhatsApp, or phone calls. Sole traders and consumers receive heightened individual protection.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-4 space-y-1.5">
            <span className="font-bold text-[var(--lit-navy,#0B2545)] block">3. 180-Day Rule Expiry</span>
            <p className="text-slate-600">
              Approved policy rules expire automatically after 6 months. Expired rules fall back to review-required posture without exception.
            </p>
          </div>
        </div>
      </div>

      {/* Granular Policy Rules Matrix */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              Normalized Channel Policy Matrix
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Multi-dimensional rule registry matching country, channel, recipient class, and direct-marketing purpose.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {rules.length} Rules Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-4 py-3">Jurisdiction</th>
                <th className="px-4 py-3">Channel / Class</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Legal Condition / Source</th>
                <th className="px-4 py-3 text-right">Review Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No granular policy rules configured in staging database. All communications default to blocked.
                  </td>
                </tr>
              ) : (
                rules.map((r) => {
                  const badge = STATUS_BADGES[r.policy_status] ?? {
                    label: r.policy_status.replace(/_/g, " "),
                    tone: "border-slate-200 bg-slate-100 text-slate-700",
                  };
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                        {r.country_code}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 capitalize">{r.channel}</span>
                        <span className="block text-[11px] text-slate-500">{r.recipient_class.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${badge.tone}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{r.notes || "Standard statutory requirements apply."}</p>
                        {r.official_source_urls?.[0] && (
                          <a
                            href={r.official_source_urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[var(--lit-blue,#1565C0)] hover:underline mt-1 font-medium"
                          >
                            <span>Regulator Guidance</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-500">
                        {r.expires_at ? r.expires_at.slice(0, 10) : "180 days default"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Macro Country Allowlist Status */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              Broad Country Stance Registry (`lead_jurisdictions`)
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Baseline country postures seeded in database. Note: "Allowed" means scoped scenario, not carte blanche.
            </p>
          </div>
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
                    {j.country_code} — {j.country_name || j.country_code}
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
