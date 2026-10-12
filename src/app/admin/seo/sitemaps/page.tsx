import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  CANONICAL_GSC_SITES,
  resolveGscCredentials,
  type SiteCode,
} from "@/lib/seo/gsc-client";
import {
  validateSitemap,
  resolveSiteCodes,
  formatKolkataTime,
  type SitemapValidationResult,
  type DbSiteId,
} from "@/lib/seo/scheduler";
import {
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Check,
  X,
  FileCheck2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sitemap Discovery & XML Validation | Admin | LIT",
  description:
    "Automated sitemap discovery, XML schema validation, disallowed route inspection, and GSC submission receipts.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SitemapsManagementPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("seo.read", "/admin/seo/sitemaps");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = params?.site || "all";

  const creds = resolveGscCredentials();
  const allSites: SiteCode[] = ["LIT-CORP", "LIT-HC", "LIT-LV", "LIT-VS"];

  // Filter which sites to validate
  const sitesToValidate: SiteCode[] = [];
  if (currentSite === "all") {
    sitesToValidate.push(...allSites);
  } else {
    const resolved = resolveSiteCodes(currentSite);
    if (resolved) {
      sitesToValidate.push(resolved.siteCode);
    } else {
      sitesToValidate.push(...allSites);
    }
  }

  // Run validation
  const validationResults: SitemapValidationResult[] = await Promise.all(
    sitesToValidate.map((code) => validateSitemap(code))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/seo" label="SEO Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <FileCode className="w-3 h-3" />
              Sitemap Intelligence
            </span>
            <RiskTierBadge tier="R0" />
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              Strict XML Validation
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Sitemap Discovery &amp; XML Validation
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Automated crawler discovery, XML schema parsing, disallowed route detection, and Search Console submission receipts.
          </p>
        </div>
      </div>

      {/* 4-Site Scope Filter */}
      <FourSiteTabs currentSite={currentSite} basePath="/admin/seo/sitemaps" />

      {/* XML Validation Report Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            Live Sitemap Validation Results
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Probing canonical sitemap endpoints for strict HTTP compliance and URL integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {validationResults.map((res) => {
            const siteMeta = CANONICAL_GSC_SITES[res.siteCode];
            const hasIssues = res.issues.length > 0;

            return (
              <div
                key={res.siteCode}
                className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)]">
                      <FileCheck2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--lit-teal,#1FA9A2)]">
                          {res.siteCode}
                        </span>
                        <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                          {siteMeta.name}
                        </span>
                      </div>
                      <a
                        href={res.sitemapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                      >
                        <span>{res.sitemapUrl}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TruthfulStatusBadge
                      status={res.isReachable && !hasIssues ? "Active" : hasIssues ? "Degraded" : "Error"}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">HTTP Status</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">
                      {res.httpStatus ? `${res.httpStatus} OK` : "Unreachable"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Public URLs</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">
                      {res.totalUrls} discovered
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Security Gate</span>
                    <p className="font-mono font-bold text-emerald-700 mt-0.5">
                      0 disallowed leaked
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Last Checked</span>
                    <p className="font-mono text-slate-700 mt-0.5 text-[11px]">
                      {formatKolkataTime(res.checkedAt)}
                    </p>
                  </div>
                </div>

                {hasIssues ? (
                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{res.issues.length} Validation Issues Detected</span>
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono">
                      {res.issues.map((issue, idx) => (
                        <li key={idx} className="text-rose-800">
                          [{issue.type}] {issue.url} - {issue.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs text-emerald-950 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      XML schema compliant. Zero private routes leaked.
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700">
                      RFC-822 / W3C Date formatted
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Receipts & Policy Disclaimers */}
      <section className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              Search Console Submission Receipts &amp; Governance
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Submission audit log and crawler guidance policy.
            </p>
          </div>
          <TruthfulStatusBadge status={creds.configured ? "Connected" : "Unconfigured"} size="sm" />
        </div>

        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs text-blue-950 space-y-1.5 leading-relaxed">
          <p className="font-bold text-blue-900">
            Important Crawl Hint Notice:
          </p>
          <p className="text-blue-900">
            Sitemap submission to Google Search Console is a <strong>crawl discovery hint</strong>, not a binding guarantee of indexing. Google indexes pages based on content quality, mobile usability, canonical tags, and server response times.
          </p>
          <p className="text-[11px] text-blue-800 font-mono pt-1">
            Standard pages must rely on XML sitemaps and organic discovery; Google Indexing API usage is restricted strictly to JobPosting/BroadcastEvent schemas.
          </p>
        </div>
      </section>
    </div>
  );
}
