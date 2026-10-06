import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Analytics | Admin" };
export const dynamic = "force-dynamic";

function tally(rows: Array<Record<string, unknown>> | null, key: string): Array<[string, number]> {
  const counts: Record<string, number> = {};
  for (const r of rows ?? []) {
    const v = String(r[key] ?? "unknown");
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default async function AnalyticsPage() {
  await requireCapabilityPage("analytics.read", "/admin/analytics");

  const [leadsRes, proposalsRes, invoicesRes, bookingsRes, ticketsRes] = await Promise.all([
    supabaseAdmin.from("contact_leads").select("lifecycle_stage"),
    supabaseAdmin.from("proposals").select("status"),
    supabaseAdmin.from("invoices").select("status"),
    supabaseAdmin.from("bookings").select("status"),
    supabaseAdmin.from("support_tickets").select("status"),
  ]);

  const anyError = Boolean(
    leadsRes.error || proposalsRes.error || invoicesRes.error || bookingsRes.error || ticketsRes.error,
  );

  const tiles = [
    { label: "Leads", total: leadsRes.data?.length ?? 0, err: Boolean(leadsRes.error) },
    { label: "Proposals", total: proposalsRes.data?.length ?? 0, err: Boolean(proposalsRes.error) },
    { label: "Invoices", total: invoicesRes.data?.length ?? 0, err: Boolean(invoicesRes.error) },
    { label: "Bookings", total: bookingsRes.data?.length ?? 0, err: Boolean(bookingsRes.error) },
    { label: "Tickets", total: ticketsRes.data?.length ?? 0, err: Boolean(ticketsRes.error) },
  ];

  const breakdowns: Array<{ title: string; rows: Array<[string, number]>; err: boolean }> = [
    { title: "Leads by lifecycle", rows: tally(leadsRes.data, "lifecycle_stage"), err: Boolean(leadsRes.error) },
    { title: "Proposals by status", rows: tally(proposalsRes.data, "status"), err: Boolean(proposalsRes.error) },
    { title: "Invoices by status", rows: tally(invoicesRes.data, "status"), err: Boolean(invoicesRes.error) },
    { title: "Tickets by status", rows: tally(ticketsRes.data, "status"), err: Boolean(ticketsRes.error) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-400">Real counts from the operational tables. No sampled or projected figures.</p>
      </div>

      {anyError ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300" role="alert">
          Some figures could not be loaded and show as errors below.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            <div className="text-2xl font-black text-white">{t.err ? "—" : t.total}</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {breakdowns.map((b) => (
          <div key={b.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-300">{b.title}</h2>
            {b.err ? (
              <p className="text-xs text-rose-300">Could not load.</p>
            ) : b.rows.length === 0 ? (
              <p className="text-xs text-zinc-500">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {b.rows.map(([k, n]) => (
                  <li key={k} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-300">{k}</span>
                    <span className="font-mono text-neutral-400">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
