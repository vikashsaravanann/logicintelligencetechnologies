import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  CANONICAL_GSC_SITES,
  getGscSiteProperties,
  resolveGscCredentials,
} from "@/lib/seo/gsc-client";
import {
  Globe,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Server,
  FileCode,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Property Authorizations & Canonical Hostnames | Admin | LIT",
  description:
    "Property authorization states, canonical hostnames, and GSC account configuration across the 4 corporate digital entities.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GscSitesPage() {
  await requireCapabilityPage("seo.read", "/admin/seo/sites");

  const creds = resolveGscCredentials();
  const sites = await getGscSiteProperties();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/seo" label="SEO Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <KeyRound className="w-3 h-3" />
              GSC Authorization
            </span>
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              4 Canonical Entities
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Property Authorization &amp; Canonical Hostnames
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Canonical hostnames, URL-prefix property authorization, DNS ownership records, and Search Console account binding.
          </p>
        </div>
      </div>

      {/* Account State Card */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)]">
              <Server className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                Google Search Console Account State
              </h2>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                OAuth2 / Service Account identity used for read-only inspection queries.
              </p>
            </div>
          </div>
          <TruthfulStatusBadge
            status={creds.configured ? "Connected" : "Unconfigured"}
            size="md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Service Account Email</span>
            <p className="font-mono font-bold text-[var(--lit-navy,#0B2545)] truncate">
              {creds.clientEmail || "None Configured"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Authorization Scope</span>
            <p className="font-mono font-semibold text-slate-800 truncate">
              webmasters.readonly
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Quota Governance</span>
            <p className="font-mono font-semibold text-emerald-800">
              2,000 req/day enforced
            </p>
          </div>
        </div>

        {!creds.configured && (
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/80 text-[11px] text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Truthful State Notice:</strong> Without valid Search Console credentials in environment variables, live property verification cannot be confirmed from Google's servers. Properties truthfully report <code className="font-mono font-semibold">UNCONFIGURED</code>.
            </span>
          </div>
        )}
      </div>

      {/* Properties List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            Canonical Digital Properties
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            Exact hostname registrations, property types, and sitemap endpoints for the LIT suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div
              key={site.siteCode}
              className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)]">
                      <Globe className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--lit-teal,#1FA9A2)]">
                          {site.siteCode}
                        </span>
                        <RiskTierBadge tier="R0" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                        {site.name}
                      </h3>
                    </div>
                  </div>
                  <TruthfulStatusBadge status={site.status} size="sm" />
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Canonical Origin:</span>
                    <a
                      href={site.siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-semibold text-[var(--lit-blue,#1565C0)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{site.siteUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Property Format:</span>
                    <span className="font-mono text-slate-700">{site.propertyType} (Strict Scheme + Host)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Canonical Sitemap:</span>
                    <a
                      href={site.sitemapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <span>{site.sitemapUrl}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Source Repository:</span>
                    <span className="font-mono text-slate-700">{site.repo}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {site.lastVerifiedAt ? `Verified: ${site.lastVerifiedAt.slice(0, 10)}` : "Not verified"}
                </span>
                <Link
                  href={`/admin/seo/sites/${site.siteCode.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-[var(--lit-navy,#0B2545)] border border-slate-200 transition-colors"
                >
                  <span>Property Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Protocol Guidance */}
      <section className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
          Search Console Verification Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <h4 className="font-semibold text-slate-900">1. URL-Prefix Matching</h4>
            <p className="leading-relaxed">
              Properties use URL-prefix specifications (<code className="font-mono">https://...</code>) rather than Domain properties to cleanly isolate subdomains and guarantee sub-service security boundaries.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <h4 className="font-semibold text-slate-900">2. DNS TXT Ownership Records</h4>
            <p className="leading-relaxed">
              Apex and subdomain DNS records must contain Google site verification tokens (<code className="font-mono">google-site-verification=...</code>) bound to the registered corporate Cloud identity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
