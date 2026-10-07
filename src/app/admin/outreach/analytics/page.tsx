import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { outreachStats } from "@/lib/outreach/intelligence/queues";

export const metadata: Metadata = { title: "Outreach Analytics" };
export const dynamic = "force-dynamic";

function Stat({ label, value, tone = "text-white" }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

const JUR_TONE: Record<string, string> = {
  allowed: "text-emerald-300",
  review_required: "text-amber-300",
  blocked: "text-rose-300",
};

export default async function OutreachAnalyticsPage() {
  await requireCapabilityPage("outreach.read", "/admin/outreach/analytics");
  const s = await outreachStats();

  const m = s.messagesByStatus;
  const sent = m.sent ?? 0;
  const approved = (m.approved ?? 0) + (m.scheduled ?? 0);
  const review = m.needs_review ?? 0;
  const totalLeads = Object.values(s.leadsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Analytics</h1>
        <p className="mt-1 text-sm text-neutral-400">Real counts from the lead engine. No projections, no fabricated metrics.</p>
      </div>

      {s.error ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">Some metrics could not be loaded.</div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Leads" value={totalLeads} />
        <Stat label="Awaiting approval" value={review} tone="text-amber-300" />
        <Stat label="Approved" value={approved} tone="text-indigo-300" />
        <Stat label="Sent" value={sent} tone="text-emerald-300" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Messages by status</h2>
          {Object.keys(m).length === 0 ? (
            <p className="text-sm text-neutral-500">No messages generated yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {Object.entries(m).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-neutral-300">
                  <span className="capitalize">{k.replace(/_/g, " ")}</span>
                  <span className="font-bold text-white">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Leads by stage</h2>
          {Object.keys(s.leadsByStatus).length === 0 ? (
            <p className="text-sm text-neutral-500">No leads yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {Object.entries(s.leadsByStatus).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-neutral-300">
                  <span className="capitalize">{k}</span>
                  <span className="font-bold text-white">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Jurisdictions</h2>
          <span className="text-[11px] text-rose-300">{s.suppressions} active suppression{s.suppressions === 1 ? "" : "s"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-neutral-500">
              <tr><th className="pb-2">Country</th><th className="pb-2">Outreach status</th><th className="pb-2">Businesses</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {s.jurisdictions.map((j) => (
                <tr key={j.country_code}>
                  <td className="py-2 font-mono text-neutral-200">{j.country_code}</td>
                  <td className={`py-2 font-semibold ${JUR_TONE[j.outreach_status] ?? "text-neutral-400"}`}>{j.outreach_status.replace(/_/g, " ")}</td>
                  <td className="py-2 text-neutral-300">{j.businesses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-neutral-500">
          Outreach is only possible to a country marked <span className="text-emerald-300">allowed</span>. Everything else is blocked by the database.
        </p>
      </div>
    </div>
  );
}
