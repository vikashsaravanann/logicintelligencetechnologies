import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  getRecentInvalidationRequests,
  CANONICAL_CDN_SITES,
  type InvalidationRecord,
} from "@/lib/cdn/edge-client";
import { InvalidationConsole } from "./InvalidationConsole";
import {
  Zap,
  Server,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
  History,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Targeted Cache Invalidation Console | Admin | LIT",
  description:
    "Controlled edge cache invalidation console with mandatory justification, dual-control safeguards, and strict blanket purge prohibition.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CacheJobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("cdn.read", "/admin/cdn/cache-jobs");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = params?.site || "all";

  const history = await getRecentInvalidationRequests(
    currentSite === "all" ? undefined : currentSite,
    25
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/cdn" label="CDN Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Zap className="w-3 h-3" />
              Edge Operations
            </span>
            <RiskTierBadge tier="R2" />
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              Selective Invalidation
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Targeted Cache Invalidation Console
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Execute precision edge cache invalidation across the 4 production sites. Blanket wildcards are prohibited under Section 11 reliability policies.
          </p>
        </div>
      </div>

      {/* Subnav Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold">
        <Link
          href="/admin/cdn"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          CDN Overview & Probes
        </Link>
        <Link
          href="/admin/cdn/cache-jobs"
          className="px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
        >
          Cache Invalidation Console (R2/R3)
        </Link>
      </div>

      {/* 4-Site Scope Filter */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider">
          Filter Invalidation Queue:
        </div>
        <FourSiteTabs currentSite={currentSite} baseUrl="/admin/cdn/cache-jobs" />
      </div>

      {/* Interactive Invalidation Console */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            Selective Invalidation Dispatch
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Submit modified URL paths for edge purging. Substantive justification is logged in the permanent audit trail.
          </p>
        </div>

        <InvalidationConsole initialSite={currentSite} />
      </div>

      {/* Invalidation History Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--lit-navy,#0B2545)]" />
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Historical Invalidation Queue & Receipts
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            {history.length} Request(s)
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--lit-text-muted,#52677C)] space-y-2">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-semibold text-[var(--lit-navy,#0B2545)]">
              No recent invalidation requests recorded
            </p>
            <p>
              Targeted invalidation requests dispatched above will appear here with audit timestamps.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)] font-mono">
                <tr>
                  <th className="py-3 px-6">Request ID</th>
                  <th className="py-3 px-6">Site</th>
                  <th className="py-3 px-6">Target Paths</th>
                  <th className="py-3 px-6">Justification</th>
                  <th className="py-3 px-6">Timestamp (IST)</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {history.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                      {req.id}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {req.siteId}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)] max-w-xs truncate">
                      {req.paths.join(", ") || "/"}
                    </td>
                    <td className="py-4 px-6 text-xs text-[var(--lit-text-muted,#52677C)] max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {req.requestedAtIst}
                    </td>
                    <td className="py-4 px-6">
                      <TruthfulStatusBadge
                        status={
                          req.status === "DISPATCHED" || req.status === "APPROVED"
                            ? "HEALTHY"
                            : req.status === "PENDING_APPROVAL"
                            ? "WARNING"
                            : req.status === "FAILED" || req.status === "REJECTED"
                            ? "CRITICAL"
                            : "UNKNOWN"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
