import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  CANONICAL_GSC_SITES,
  inspectUrl,
  getRemainingDailyQuota,
  resolveGscCredentials,
  type SiteCode,
} from "@/lib/seo/gsc-client";
import { formatKolkataTime } from "@/lib/seo/scheduler";
import {
  Eye,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "GSC URL Inspection Console | Admin | LIT",
  description:
    "Allowlisted public URL inspection tool with real-time 2,000 req/day quota tracking and Google Search Console indexing state.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ALLOWLISTED_SAMPLES: Record<SiteCode, string[]> = {
  "LIT-CORP": [
    "https://www.logicintelligencetechnologies.in/",
    "https://www.logicintelligencetechnologies.in/about",
    "https://www.logicintelligencetechnologies.in/services",
    "https://www.logicintelligencetechnologies.in/contact",
    "https://www.logicintelligencetechnologies.in/privacy",
    "https://www.logicintelligencetechnologies.in/terms",
  ],
  "LIT-HC": [
    "https://healthcare.logicintelligencetechnologies.in/",
    "https://healthcare.logicintelligencetechnologies.in/features",
    "https://healthcare.logicintelligencetechnologies.in/compliance",
    "https://healthcare.logicintelligencetechnologies.in/abdm",
  ],
  "LIT-LV": [
    "https://logicvoice.logicintelligencetechnologies.in/",
    "https://logicvoice.logicintelligencetechnologies.in/platform",
    "https://logicvoice.logicintelligencetechnologies.in/agents",
    "https://logicvoice.logicintelligencetechnologies.in/demo",
  ],
  "LIT-VS": [
    "https://voiceshield.logicintelligencetechnologies.in/",
    "https://voiceshield.logicintelligencetechnologies.in/technology",
    "https://voiceshield.logicintelligencetechnologies.in/security",
    "https://voiceshield.logicintelligencetechnologies.in/faq",
  ],
};

export default async function UrlInspectionPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string; url?: string }>;
}) {
  await requireCapabilityPage("seo.read", "/admin/seo/url-inspection");
  const params = searchParams ? await searchParams : undefined;

  const rawSite = (params?.site || "LIT-CORP").toUpperCase() as SiteCode;
  const currentSiteCode: SiteCode = CANONICAL_GSC_SITES[rawSite] ? rawSite : "LIT-CORP";
  const targetSite = CANONICAL_GSC_SITES[currentSiteCode];

  const inspectTargetUrl = params?.url?.trim() || "";
  const remainingQuota = getRemainingDailyQuota();
  const creds = resolveGscCredentials();

  let inspectionOutcome: Awaited<ReturnType<typeof inspectUrl>> | null = null;
  if (inspectTargetUrl) {
    inspectionOutcome = await inspectUrl(currentSiteCode, inspectTargetUrl);
  }

  const quotaPercentUsed = Math.min(100, Math.round(((2000 - remainingQuota) / 2000) * 100));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/seo" label="SEO Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Eye className="w-3 h-3" />
              URL Inspection API
            </span>
            <RiskTierBadge tier="R0" />
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              Max 2,000/day
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Allowlisted Public URL Inspection
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Query Google Search Console index metadata, canonical evaluation, and mobile crawler verdict for any verified public route.
          </p>
        </div>
      </div>

      {/* Quota & Policy Guard Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Quota Card */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Daily Inspection Quota
            </span>
            <span className="font-mono font-bold text-xs text-[var(--lit-navy,#0B2545)]">
              {remainingQuota.toLocaleString()} / 2,000 left
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                quotaPercentUsed > 80 ? "bg-rose-500" : "bg-[var(--lit-teal,#1FA9A2)]"
              }`}
              style={{ width: `${Math.max(2, quotaPercentUsed)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Used today: {2000 - remainingQuota}</span>
            <span>Resets at 00:00 UTC</span>
          </div>
        </div>

        {/* Policy Guard Card */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              Policy Compliance: QA-50 / Section 10.3 Enforced
            </h3>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
            The Google Indexing API is strictly forbidden for standard marketing, blog, or service pages. Per Google guidelines, only JobPosting and BroadcastEvent schemas qualify. This console exclusively queries the compliant <strong>URL Inspection API</strong> and Search Console Sitemaps API.
          </p>
        </div>
      </div>

      {/* URL Inspection Form */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
            Inspect a Public Page
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Select a canonical site and provide a fully qualified URL within that domain prefix.
          </p>
        </div>

        <form method="GET" action="/admin/seo/url-inspection" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Property
              </label>
              <select
                name="site"
                defaultValue={currentSiteCode}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-[var(--lit-navy,#0B2545)] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
              >
                {Object.values(CANONICAL_GSC_SITES).map((s) => (
                  <option key={s.siteCode} value={s.siteCode}>
                    {s.siteCode} · {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Fully Qualified Public URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="url"
                  required
                  defaultValue={inspectTargetUrl || targetSite.siteUrl}
                  placeholder={targetSite.siteUrl}
                  className="flex-1 text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-[var(--lit-navy,#0B2545)] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-navy,#0B2545)]/90 shadow-2xs transition-colors shrink-0"
                >
                  Inspect URL
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Quick-Pick Allowlisted Samples */}
        <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-500">
            Allowlisted Route Suggestions ({currentSiteCode}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ALLOWLISTED_SAMPLES[currentSiteCode].map((sampleUrl) => (
              <Link
                key={sampleUrl}
                href={`/admin/seo/url-inspection?site=${currentSiteCode}&url=${encodeURIComponent(sampleUrl)}`}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-[var(--lit-teal,#1FA9A2)] text-slate-700 transition-colors"
              >
                {sampleUrl.replace(targetSite.siteUrl, "/")}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection Results Panel */}
      {inspectTargetUrl && inspectionOutcome && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
              Inspection Findings
            </h2>
            <TruthfulStatusBadge
              status={
                inspectionOutcome.ok
                  ? inspectionOutcome.result?.source === "DIRECT_EDGE_INSPECTION"
                    ? "Active"
                    : "Success"
                  : "Error"
              }
              size="md"
            />
          </div>

          {!inspectionOutcome.ok ? (
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/90 text-rose-950 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="text-sm font-bold text-rose-900">
                  Inspection Request Failed
                </h3>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {inspectionOutcome.error || "The target URL could not be inspected or reached."}
              </p>
              <p className="text-[11px] font-mono text-rose-900 pt-1">
                Target URL: {inspectTargetUrl}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspectionOutcome.result?.source === "DIRECT_EDGE_INSPECTION" && (
                <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/80 text-teal-950 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0" />
                      <h3 className="text-xs font-bold text-teal-950">
                        Live Edge Indexability Active · GSC Service Account Optional / Pending Delegation
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      DIRECT_EDGE_INSPECTION
                    </span>
                  </div>
                  <p className="text-xs text-teal-900 leading-relaxed">
                    Direct edge inspection verified live HTTP response, canonical headers, robots directives, and site verification tags for this public route. Google Search Console API credentials remain unconfigured (or pending service account RSA delegation); no fake Search Console data is injected.
                  </p>
                  {inspectionOutcome.result?.gscStatus?.reason && (
                    <p className="text-[11px] font-mono text-teal-800/90 pt-0.5">
                      GSC Status Note: {inspectionOutcome.result.gscStatus.reason}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
                      Inspection Target
                    </span>
                    <h3 className="text-base font-bold font-mono text-[var(--lit-navy,#0B2545)] break-all">
                      {inspectionOutcome.result?.url}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Verdict: {inspectionOutcome.result?.verdict}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Indexing & Crawl State */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">Indexing &amp; Crawl State</span>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Coverage State:</span>
                      <span className="font-mono font-bold text-slate-800">{inspectionOutcome.result?.coverageState}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Indexing Allowed:</span>
                      <span className="font-mono font-bold text-emerald-700">{inspectionOutcome.result?.indexingState}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Crawled As:</span>
                      <span className="font-mono text-slate-800">{inspectionOutcome.result?.crawledAs}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Page Fetch:</span>
                      <span className="font-mono text-slate-800">{inspectionOutcome.result?.edgeDetails?.httpStatusText || "SUCCESSFUL"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Last Checked / Crawl:</span>
                      <span className="font-mono text-slate-800">{formatKolkataTime(inspectionOutcome.result?.lastCrawlTime)}</span>
                    </div>
                  </div>

                  {/* Canonical Evaluation */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">Canonical Evaluation</span>
                    <div className="py-1 border-b border-slate-200">
                      <span className="text-slate-600 text-[11px] block">User-Declared Canonical:</span>
                      <span className="font-mono font-semibold text-slate-800 text-[11px] break-all">
                        {inspectionOutcome.result?.userCanonical || "None declared"}
                      </span>
                    </div>
                    <div className="py-1 border-b border-slate-200">
                      <span className="text-slate-600 text-[11px] block">Google-Selected Canonical:</span>
                      <span className="font-mono font-semibold text-slate-800 text-[11px] break-all">
                        {inspectionOutcome.result?.googleCanonical || "Same as user declared"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Self-Referential:</span>
                      <span className={`font-mono font-bold ${inspectionOutcome.result?.edgeDetails?.isCanonicalSelfReferential ? "text-emerald-700" : "text-amber-700"}`}>
                        {inspectionOutcome.result?.edgeDetails ? (inspectionOutcome.result.edgeDetails.isCanonicalSelfReferential ? "YES (Conformant)" : "NO / Non-matching") : "Evaluated in GSC"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Telemetry Source:</span>
                      <span className="font-mono text-slate-700">{inspectionOutcome.result?.source}</span>
                    </div>
                  </div>

                  {/* Edge Directives & Verification */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">Edge Directives &amp; Security</span>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">HTTP Status:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {inspectionOutcome.result?.edgeDetails ? `${inspectionOutcome.result.edgeDetails.httpStatus} OK` : "200 OK"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Latency:</span>
                      <span className="font-mono text-slate-800">
                        {inspectionOutcome.result?.edgeDetails ? `${inspectionOutcome.result.edgeDetails.responseTimeMs}ms` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Meta Robots:</span>
                      <span className="font-mono text-slate-800">
                        {inspectionOutcome.result?.edgeDetails?.metaRobots || "None (Default Indexable)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Robots.txt Allowance:</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {inspectionOutcome.result?.edgeDetails?.isRobotsAllowed ? "Allowed" : "Blocked"}
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-600 text-[11px] block">Site Verification Meta:</span>
                      <span className="font-mono text-slate-700 text-[11px] break-all">
                        {inspectionOutcome.result?.edgeDetails?.googleSiteVerification || "Not detected in head"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
