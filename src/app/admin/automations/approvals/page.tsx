import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Four-Eye Approval Queue | Admin | Logic Intelligence Technologies",
  description: "Review and decide high-risk automation activation requests with dual-control authorization.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  const session = await requireCapabilityPage("approvals.decide", "/admin/automations/approvals");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  // High-risk items (R3/R4) requiring dual control
  const pendingApprovals = allCanonical.filter(
    (w) => (w.riskClass === "R3" || w.riskClass === "R4") && (currentSite === "all" || w.siteKey === currentSite)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-900 text-[10px] font-bold uppercase tracking-wider font-mono">
              <UserCheck className="w-3 h-3 text-amber-700" />
              Dual-Control Protocol
            </span>
            <span className="text-xs font-mono text-slate-500">Deciding Role: {session.role}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Four-Eye Approval Queue
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Mandatory dual-authorization console for high-risk automations (R3/R4), production schema migrations, and credential updates.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/approvals" counts={siteCounts} />

      {/* Security Governance Notice */}
      <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-2xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <p className="font-bold">Strict Four-Eye Invariant Enforced:</p>
          <p className="text-amber-900">
            A single operator cannot initiate AND authorize an R3/R4 automation. An independent staff member with <code className="font-mono font-semibold">approvals.decide</code> capability must confirm the change after diff verification.
          </p>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--lit-navy,#0B2545)]">{pendingApprovals.length}</span>
            <span className="text-[var(--lit-text-muted,#52677C)]">high-risk automations subject to dual sign-off</span>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">Audit Logging: Immutable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Workflow ID</th>
                <th className="px-5 py-3 font-semibold">Name &amp; Category</th>
                <th className="px-5 py-3 font-semibold">Entity</th>
                <th className="px-5 py-3 font-semibold">Risk Tier</th>
                <th className="px-5 py-3 font-semibold">Gate Status</th>
                <th className="px-5 py-3 font-semibold text-right">Decide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {pendingApprovals.map((w) => (
                <tr key={w.workflowId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                    <a
                      href={`/admin/automations/workflows/${w.workflowId}`}
                      className="text-[var(--lit-blue,#1565C0)] hover:underline inline-flex items-center gap-1"
                    >
                      {w.workflowId}
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{w.name}</div>
                    <span className="font-mono text-[10px] text-slate-400">{w.category}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {w.siteName}
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskTierBadge riskClass={w.riskClass} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Dual Sign-Off Gate
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled
                        title="Decision audit trail requires live sign-off transaction"
                        className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold text-xs opacity-60 cursor-not-allowed"
                      >
                        Authorize
                      </button>
                      <button
                        type="button"
                        disabled
                        title="Decision audit trail requires live sign-off transaction"
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs opacity-60 cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
