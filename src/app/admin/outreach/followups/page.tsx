import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listFollowups, followupStats } from "@/lib/outreach/intelligence/followups";
import { listStudioLeads } from "@/lib/outreach/intelligence/store";
import { FollowupsClient } from "./followups-client";

export const metadata: Metadata = { title: "Follow-Ups | Outreach" };
export const dynamic = "force-dynamic";

export default async function OutreachFollowupsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/followups");
  const sp = await searchParams;
  const statusFilter = ["scheduled", "sent", "cancelled", "skipped"].includes(sp.status ?? "") ? sp.status! : "scheduled";

  const [rows, stats, leads] = await Promise.all([
    listFollowups([statusFilter]),
    followupStats(),
    listStudioLeads(100),
  ]);

  const leadOptions = leads.map((l) => ({ id: l.id, label: `${l.company_name}${l.city ? ` · ${l.city}` : ""}` }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Follow-Ups</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Scheduled next touches. At most one is active per lead, and a follow-up is cancelled automatically the moment
          a human reply lands — so nobody is chased after they engage. Nothing sends automatically.
        </p>
      </div>

      <FollowupsClient
        rows={rows}
        stats={stats}
        statusFilter={statusFilter}
        leadOptions={leadOptions}
      />
    </div>
  );
}
