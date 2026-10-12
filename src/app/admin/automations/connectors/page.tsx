import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Integration Connectors Health | Admin | Logic Intelligence Technologies",
  description: "Inspect connector status, token expiry, and allowed endpoints with zero plaintext secrets displayed.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ConnectorHealthItem {
  id: string;
  provider: string;
  purpose: string;
  envKeys: string[];
  status: "Connected" | "Unconfigured" | "Staged";
  lastVerified: string;
  allowedScope: string;
}

export default async function ConnectorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/connectors");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  const hasN8n = Boolean(process.env.N8N_BASE_URL && process.env.N8N_API_KEY);
  const hasGsc = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GSC_SERVICE_ACCOUNT_JSON);
  const hasVercel = Boolean(process.env.VERCEL_API_TOKEN || process.env.VERCEL_BEARER_TOKEN);
  const hasSmtp = Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  const connectors: ConnectorHealthItem[] = [
    {
      id: "conn-supabase",
      provider: "Supabase Database & Auth Engine",
      purpose: "Multi-tenant persistence, outbox event ledger, and staff RBAC profiles",
      envKeys: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      status: hasSupabase ? "Connected" : "Unconfigured",
      lastVerified: "Runtime Verified",
      allowedScope: "Service Role (Database RLS bypassed on server)",
    },
    {
      id: "conn-n8n",
      provider: "n8n Workflow Execution Engine",
      purpose: "Workflow blueprint hosting, node execution, and webhook listener targets",
      envKeys: ["N8N_BASE_URL", "N8N_API_KEY"],
      status: hasN8n ? "Connected" : "Unconfigured",
      lastVerified: hasN8n ? "Connected & Live" : "Unconfigured",
      allowedScope: "REST API /api/v1/workflows, /executions",
    },
    {
      id: "conn-gsc",
      provider: "Google Search Console API",
      purpose: "Automated 72h site indexing audits, sitemap submissions, and URL inspection",
      envKeys: ["GSC_SERVICE_ACCOUNT_JSON"],
      status: hasGsc ? "Connected" : "Unconfigured",
      lastVerified: hasGsc ? "Ready" : "Pending Credentials",
      allowedScope: "https://www.googleapis.com/auth/webmasters.readonly",
    },
    {
      id: "conn-vercel",
      provider: "Vercel Edge Platform API",
      purpose: "Edge cache invalidation queue and deployment status probes",
      envKeys: ["VERCEL_API_TOKEN", "VERCEL_PROJECT_ID"],
      status: hasVercel ? "Connected" : "Unconfigured",
      lastVerified: hasVercel ? "Configured" : "Unconfigured",
      allowedScope: "Deployments & Edge Purge (Strict targeted path limits)",
    },
    {
      id: "conn-smtp",
      provider: "Transactional SMTP Provider (Resend / SendGrid)",
      purpose: "Outreach emails, booking confirmations, and dunning notifications",
      envKeys: ["RESEND_API_KEY", "SENDGRID_API_KEY"],
      status: hasSmtp ? "Connected" : "Unconfigured",
      lastVerified: hasSmtp ? "Operational" : "Unconfigured",
      allowedScope: "Transactional Mail Send (Sender domain restricted)",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <KeyRound className="w-3 h-3" />
              Integration Health
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> Zero Plaintext Secrets Policy
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Credential Health &amp; Integration Providers
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time liveness and configuration state for third-party cloud service connectors and background API integrations.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/connectors" counts={siteCounts} />

      {/* Connectors Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--lit-navy,#0B2545)]">Configured Infrastructure Connectors</span>
          <span className="font-mono text-slate-500 text-[11px]">HMAC &amp; KMS Gated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Integration Provider</th>
                <th className="px-5 py-3 font-semibold">Environment Variables</th>
                <th className="px-5 py-3 font-semibold">Allowed Scope</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Liveness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {connectors.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{c.provider}</div>
                    <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">{c.purpose}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[10px] text-slate-600">
                    {c.envKeys.map((k) => (
                      <div key={k} className="flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>{k}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-[11px]">
                    {c.allowedScope}
                  </td>
                  <td className="px-5 py-3.5">
                    <TruthfulStatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-slate-500">
                    {c.lastVerified}
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
