import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listReplies, replyCategoryCounts } from "@/lib/outreach/intelligence/replies";
import { listStudioLeads } from "@/lib/outreach/intelligence/store";
import { REPLY_CATEGORY_META, REPLY_CATEGORIES } from "@/lib/outreach/intelligence/reply-schema";
import { RepliesClient } from "./replies-client";

export const metadata: Metadata = { title: "Replies | Outreach" };
export const dynamic = "force-dynamic";

export default async function OutreachRepliesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/replies");
  const sp = await searchParams;
  const filter = (REPLY_CATEGORIES as readonly string[]).includes(sp.filter ?? "") ? sp.filter : undefined;

  const [replies, counts, leads] = await Promise.all([
    listReplies({ category: filter }),
    replyCategoryCounts(),
    listStudioLeads(100),
  ]);

  const leadOptions = leads.map((l) => ({ id: l.id, label: `${l.company_name}${l.city ? ` · ${l.city}` : ""}` }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Replies</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Inbound replies, classified by intent. The classifier only labels intent — it never drafts a response or
          invents facts. Opt-outs and bounces are flagged for immediate suppression.
        </p>
      </div>

      <RepliesClient
        replies={replies}
        counts={counts}
        activeFilter={filter ?? null}
        leadOptions={leadOptions}
        categoryMeta={REPLY_CATEGORY_META}
      />
    </div>
  );
}
