import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getAutomationsSnapshot, type AutomationsState } from "@/lib/automations/n8n-client";

export const metadata: Metadata = { title: "Automations | Admin" };
export const dynamic = "force-dynamic";

const STATE_TONE: Record<AutomationsState, string> = {
  CONNECTED: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  ERROR: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  "NOT CONFIGURED": "text-zinc-400 border-zinc-600/40 bg-zinc-800/40",
};

export default async function AutomationsPage() {
  await requireCapabilityPage("automations.read", "/admin/automations");
  const snap = await getAutomationsSnapshot();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Automations</h1>
          <p className="text-sm text-zinc-400">
            Read-only view of the n8n workflow instance. Execution data is never shown here.
          </p>
        </div>
        <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATE_TONE[snap.state]}`}>
          {snap.state}
        </span>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 text-sm text-zinc-300">
        <p>{snap.detail}</p>
        <p className="mt-1 text-xs text-zinc-500">
          Liveness probe: {snap.healthy === null ? "not run" : snap.healthy ? "healthy" : "unreachable"}
        </p>
      </div>

      {snap.state === "CONNECTED" ? (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Workflow</th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {snap.workflows.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 text-neutral-200">{w.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{w.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        w.active
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-neutral-600/30 bg-neutral-700/20 text-neutral-400"
                      }`}
                    >
                      {w.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {snap.workflows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-neutral-500">No workflows found on the instance.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-sm text-zinc-400">
          {snap.state === "NOT CONFIGURED"
            ? "Set N8N_BASE_URL and N8N_API_KEY on the deployment to connect this view."
            : "The n8n instance could not be read. Check the base URL, API key, and that the instance is reachable."}
        </div>
      )}
    </div>
  );
}
