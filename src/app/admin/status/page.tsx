import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { checkAllServices, overallState, type ServiceState } from "@/lib/status/service-checks";
import { runConfigChecks, type CheckStatus } from "@/lib/status/config-checks";
import { checkDatabase, type LiveState } from "@/lib/status/live-checks";

export const metadata: Metadata = {
  title: "System Status | Admin",
};

// Admin view: always run fresh checks, never serve a cached result.
export const dynamic = "force-dynamic";

const SERVICE_TONE: Record<ServiceState, string> = {
  OPERATIONAL: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  DEGRADED: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  OUTAGE: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  UNKNOWN: "text-zinc-400 border-zinc-600/40 bg-zinc-800/40",
};

const CONFIG_TONE: Record<CheckStatus, string> = {
  ok: "text-emerald-400",
  degraded: "text-amber-400",
  unconfigured: "text-zinc-400",
};

export default async function StatusPage() {
  await requireCapabilityPage("status.read", "/admin/status");
  const [results, db] = await Promise.all([checkAllServices(), checkDatabase()]);
  const overall = overallState(results);
  const config = runConfigChecks();

  const LIVE_TONE: Record<LiveState, string> = {
    PASS: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    FAIL: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    "NOT CONFIGURED": "text-zinc-400 border-zinc-600/40 bg-zinc-800/40",
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">System Status</h1>
          <p className="text-sm text-zinc-400">Live checks run when this page loads. No uptime history is stored yet.</p>
        </div>
        <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${SERVICE_TONE[overall.state]}`}>
          {overall.label}
        </span>
      </header>

      <section aria-labelledby="svc-heading" className="overflow-hidden rounded-2xl border border-neutral-800">
        <h2 id="svc-heading" className="border-b border-neutral-800 bg-neutral-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Services
        </h2>
        <ul className="divide-y divide-neutral-800">
          {results.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-white">{r.name}</p>
                <p className="break-words text-xs text-zinc-500">
                  {r.detail}
                  {r.httpStatus !== null && ` · HTTP ${r.httpStatus}`}
                  {r.latencyMs !== null && ` · ${r.latencyMs} ms`}
                </p>
              </div>
              <span className={`w-fit shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold ${SERVICE_TONE[r.state]}`}>{r.state}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="db-heading" className="overflow-hidden rounded-2xl border border-neutral-800">
        <h2 id="db-heading" className="border-b border-neutral-800 bg-neutral-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Live database
        </h2>
        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-white">Supabase round-trip</p>
            <p className="break-words text-xs text-zinc-500">
              {db.note ? db.note : "A real head query against profiles"}
              {db.latencyMs !== undefined && ` · ${db.latencyMs} ms`}
            </p>
          </div>
          <span className={`w-fit shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold ${LIVE_TONE[db.state]}`}>{db.state}</span>
        </div>
      </section>

      <section aria-labelledby="cfg-heading" className="overflow-hidden rounded-2xl border border-neutral-800">
        <h2 id="cfg-heading" className="border-b border-neutral-800 bg-neutral-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Corporate site configuration
        </h2>
        <ul className="divide-y divide-neutral-800">
          {Object.entries(config.checks).map(([name, check]) => (
            <li key={name} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-sm text-white">{name}</p>
                {check.note && <p className="break-words text-xs text-zinc-500">{check.note}</p>}
              </div>
              <span className={`text-xs font-semibold uppercase ${CONFIG_TONE[check.status]}`}>{check.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
