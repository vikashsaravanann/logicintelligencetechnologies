import type { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listMessagesByStatus } from "@/lib/outreach/intelligence/queues";
import { formatIST } from "@/lib/format/datetime";
import { ApproveButton } from "./approve-button";

export const metadata: Metadata = { title: "Outreach Queue" };
export const dynamic = "force-dynamic";

const TABS: Array<{ key: string; label: string; statuses: string[] }> = [
  { key: "review", label: "Approval Queue", statuses: ["needs_review"] },
  { key: "draft", label: "Drafts", statuses: ["draft"] },
  { key: "approved", label: "Approved", statuses: ["approved", "scheduled"] },
  { key: "sent", label: "Sent", statuses: ["sent"] },
];

export default async function OutreachQueuePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/queue");
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const rows = await listMessagesByStatus(tab.statuses);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Queue</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Review and approve generated drafts. Approval is a human gate; a message only sends through the controlled
          dispatch step, never automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/outreach/queue?tab=${t.key}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              t.key === tab.key ? "bg-indigo-500/15 text-indigo-200" : "text-neutral-400 hover:bg-neutral-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
          Nothing in {tab.label.toLowerCase()}.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/admin/outreach/studio?lead=${m.business_id}`} className="font-semibold text-white hover:underline">
                    {m.company_name}
                  </Link>
                  <p className="text-[11px] text-neutral-500">
                    v{m.version} · {m.channel} · {m.opportunity_type ?? "—"} · {formatIST(m.generated_at, "datetime")}
                    {m.generated_by ? ` · ${m.generated_by}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {typeof m.qa_score === "number" ? (
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                      QA {m.qa_score}/60
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.blockers_pass ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {m.blockers_pass ? "QA pass" : "QA blocked"}
                  </span>
                </div>
              </div>
              {m.subject ? <p className="mt-2 text-sm font-semibold text-neutral-200">{m.subject}</p> : null}
              <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[12px] text-neutral-300">{m.body}</pre>
              {tab.key === "review" ? (
                <div className="mt-3">
                  <ApproveButton messageId={m.id} disabled={!m.blockers_pass} />
                </div>
              ) : m.approved_by ? (
                <p className="mt-2 text-[11px] text-emerald-300">Approved by {m.approved_by} · {formatIST(m.approved_at, "datetime")}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
