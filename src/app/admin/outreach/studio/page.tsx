import type { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listStudioLeads, getStudioLead } from "@/lib/outreach/intelligence/store";
import { guidanceFor } from "@/lib/outreach/intelligence/opportunities";
import { OPPORTUNITY_TYPES } from "@/lib/outreach/intelligence/message-schema";
import { StudioPanel } from "./studio-client";

export const metadata: Metadata = { title: "Outreach Studio" };
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
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Studio</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Turn verified lead intelligence into a concise, evidence-based first message. Every draft is QA-gated and
          needs human approval; jurisdiction + suppression are enforced by the database.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Lead list */}
        <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/50">
          <p className="border-b border-neutral-800 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Verified leads ({leads.length})
          </p>
          <ul className="max-h-[70vh] divide-y divide-neutral-800 overflow-y-auto">
            {leads.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-neutral-500">
                No scored leads yet. Discovery + enrichment populate this list.
              </li>
            ) : (
              leads.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/outreach/studio?lead=${l.id}`}
                    className={`block px-4 py-3 text-sm hover:bg-neutral-900 ${l.id === selectedId ? "bg-indigo-500/10" : ""}`}
                  >
                    <span className="block font-semibold text-white">{l.company_name}</span>
                    <span className="block text-[11px] text-neutral-500">
                      {[l.industry, l.city, l.country_code].filter(Boolean).join(" · ") || "—"}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-2 text-[10px]">
                      {typeof l.score === "number" ? (
                        <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-bold text-indigo-300">Score {l.score}</span>
                      ) : null}
                      {l.opportunity_type ? <span className="font-mono text-neutral-500">{l.opportunity_type}</span> : null}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Studio workspace */}
        <div className="space-y-4">
          {!detail ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
              Select a lead to review its verified evidence and draft a message.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <h2 className="text-lg font-bold text-white">{detail.business.company_name as string}</h2>
                <p className="text-xs text-neutral-500">
                  {[detail.business.industry, detail.business.city, detail.business.country_code].filter(Boolean).join(" · ") || "—"}
                  {detail.business.domain ? ` · ${detail.business.domain as string}` : ""}
                </p>
                {g ? <p className="mt-2 text-xs text-indigo-300">Opportunity: {g.label}</p> : null}

                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Verified evidence ({detail.evidence.length})</p>
                  <ul className="mt-1 space-y-1">
                    {detail.evidence.length === 0 ? (
                      <li className="text-xs text-amber-300">No verified evidence yet — enrich this lead before drafting.</li>
                    ) : (
                      detail.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
                            {e.kind === "technical_measurement" ? "measured" : "observed"}
                          </span>
                          <span>
                            {e.statement}
                            {e.source ? <span className="text-neutral-500"> — {e.source}{e.checked_at ? `, ${e.checked_at}` : ""}</span> : null}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

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
              />

              {detail.messages.length ? (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Version history ({detail.messages.length})
                  </p>
                  <ul className="space-y-1 text-xs text-neutral-400">
                    {detail.messages.map((m) => (
                      <li key={m.id as string} className="flex items-center justify-between">
                        <span>v{m.version as number} · {m.status as string}</span>
                        <span className="text-neutral-600">{typeof m.qa_score === "number" ? `QA ${m.qa_score}/60` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
