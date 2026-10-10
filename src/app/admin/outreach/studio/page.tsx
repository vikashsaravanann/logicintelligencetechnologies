import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listStudioLeads, getStudioLead } from "@/lib/outreach/intelligence/store";
import { guidanceFor } from "@/lib/outreach/intelligence/opportunities";
import { OPPORTUNITY_TYPES } from "@/lib/outreach/intelligence/message-schema";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import { StudioPanel } from "./studio-client";

export const metadata: Metadata = { title: "Campaign Copy Studio | Admin Command Center" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OutreachStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/studio");
  const sp = await searchParams;
  const selectedId = sp.lead && UUID.test(sp.lead) ? sp.lead : null;

  const [leads, detail] = await Promise.all([
    listStudioLeads(50),
    selectedId ? getStudioLead(selectedId) : Promise.resolve(null),
  ]);

  const opp = detail?.opportunities.find((o) => (o.status as string) === "open") ?? detail?.opportunities[0];
  const oppType = opp?.opportunity_type as string | undefined;
  const g = oppType && (OPPORTUNITY_TYPES as readonly string[]).includes(oppType) ? guidanceFor(oppType as never) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Navigation & Clinical Header */}
      <div className="space-y-4">
        <div>
          <AdminBackLink href="/admin/outreach" label="Outreach Pipeline" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" />
              Campaign Copy Studio
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Evidence-Gated AI
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Campaign Copy Studio
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)] max-w-3xl">
            Turn verified lead intelligence into concise, evidence-based first contact copy.
            Every draft is QA-gated and requires human approval; jurisdiction and suppression
            are strictly enforced by the database.
          </p>
        </div>

        {/* Global Outreach Navigation */}
        <OutreachNav active="studio" />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Verified Leads Directory (Sidebar) */}
        <aside className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Verified Leads
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
              {leads.length}
            </span>
          </div>

          <ul className="max-h-[75vh] divide-y divide-[var(--lit-border-light,#DFE7EF)] overflow-y-auto">
            {leads.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
                No scored leads yet. Discovery and enrichment populate this list.
              </li>
            ) : (
              leads.map((l) => {
                const isSelected = l.id === selectedId;
                return (
                  <li key={l.id}>
                    <Link
                      href={`/admin/outreach/studio?lead=${l.id}`}
                      className={`block px-4 py-3 text-sm transition-colors ${
                        isSelected
                          ? "bg-blue-50/70 border-l-4 border-[var(--lit-blue,#1565C0)]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-[var(--lit-navy,#0B2545)] line-clamp-1">
                          {l.company_name}
                        </span>
                        {typeof l.score === "number" ? (
                          <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 border border-blue-200">
                            {l.score}
                          </span>
                        ) : null}
                      </div>

                      <span className="block text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5 line-clamp-1">
                        {[l.industry, l.city, l.country_code].filter(Boolean).join(" · ") || "—"}
                      </span>

                      {l.opportunity_type ? (
                        <div className="mt-1.5">
                          <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 border border-slate-200">
                            {l.opportunity_type}
                          </span>
                        </div>
                      ) : null}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Studio Workspace */}
        <div className="space-y-6">
          {!detail ? (
            <div className="rounded-2xl border border-dashed border-[var(--lit-border-light,#DFE7EF)] bg-white p-14 text-center shadow-2xs">
              <div className="mx-auto w-12 h-12 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-center text-slate-400 mb-3">
                <Sparkles className="w-6 h-6 text-[var(--lit-teal,#1FA9A2)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                Select a Verified Lead
              </h2>
              <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
                Choose an account from the verified leads directory on the left to inspect factual evidence,
                preview personalization variables, and generate compliant copy drafts.
              </p>
            </div>
          ) : (
            <>
              {/* Lead Intelligence Card */}
              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
                      {detail.business.company_name as string}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--lit-text-muted,#52677C)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {[detail.business.city, detail.business.country_code].filter(Boolean).join(", ") || "Location unverified"}
                      </span>
                      <span>•</span>
                      <span>{(detail.business.industry as string) || "General Industry"}</span>
                      {detail.business.domain ? (
                        <>
                          <span>•</span>
                          <a
                            href={`https://${detail.business.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--lit-blue,#1565C0)] hover:underline font-mono"
                          >
                            {detail.business.domain as string}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {g ? (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs text-blue-800 self-start">
                      <span className="font-bold">Opportunity:</span> {g.label}
                    </div>
                  ) : null}
                </div>

                {/* Verified Evidence Ledger */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                      Verified Evidence Ledger ({detail.evidence.length})
                    </p>
                    <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] font-mono">
                      No fabrication allowed
                    </span>
                  </div>

                  {detail.evidence.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>No verified evidence yet — enrich this lead before drafting copy.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detail.evidence.map((e, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-3 text-xs text-[var(--lit-navy,#0B2545)]"
                        >
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono ${
                              e.kind === "technical_measurement"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {e.kind === "technical_measurement" ? "measured" : "observed"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium">{e.statement}</span>
                            {e.source ? (
                              <span className="block text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5 font-mono">
                                Source: {e.source}
                                {e.checked_at ? ` · Checked: ${e.checked_at}` : ""}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Studio Panel (Prompt Editor, AI Variants, Variables & QA Gates) */}
              <StudioPanel
                businessId={detail.business.id as string}
                companyName={detail.business.company_name as string}
                compliance={{
                  cleared: detail.compliance.cleared,
                  reason: detail.compliance.reason,
                  jurisdictionStatus: detail.compliance.jurisdictionStatus,
                  suppressed: detail.compliance.suppressed,
                }}
                evidenceCount={detail.evidence.length}
                hasOpportunity={Boolean(oppType)}
                leadData={{
                  domain: detail.business.domain as string | undefined,
                  industry: detail.business.industry as string | undefined,
                  city: detail.business.city as string | undefined,
                  country_code: detail.business.country_code as string | undefined,
                  opportunityType: oppType,
                  evidenceItems: detail.evidence.map((ev) => ({
                    kind: ev.kind,
                    statement: ev.statement,
                    source: ev.source,
                    measured_value: ev.measured_value,
                  })),
                }}
              />

              {/* Version History Card */}
              {detail.messages.length ? (
                <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-6">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <History className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                      Draft Version History ({detail.messages.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                    {detail.messages.map((m) => (
                      <div
                        key={m.id as string}
                        className="py-2.5 flex items-center justify-between text-xs text-[var(--lit-navy,#0B2545)]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[var(--lit-blue,#1565C0)]">
                            v{m.version as number}
                          </span>
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                            {m.status as string}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {typeof m.qa_score === "number" ? (
                            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              QA {m.qa_score}/60
                            </span>
                          ) : null}
                          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono">
                            {m.channel as string}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
