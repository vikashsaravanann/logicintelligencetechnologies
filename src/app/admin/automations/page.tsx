import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getAutomationsSnapshot, type AutomationsState } from "@/lib/automations/n8n-client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { retryProvisioningStep } from "./actions";
import ImportButton from "./import-button";

export const metadata: Metadata = { title: "Automations | Admin" };
export const dynamic = "force-dynamic";

interface FailedEventRow {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
}

interface FailedStepRow {
  id: string;
  step: string;
  status: string;
  created_at: string;
}

async function getFailureQueue(): Promise<{ events: FailedEventRow[]; steps: FailedStepRow[] }> {
  const [eventsRes, stepsRes] = await Promise.all([
    supabaseAdmin
      .from("automation_events")
      .select("id, event_type, status, created_at")
      .in("status", ["failed", "dead_letter"])
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("provisioning_steps")
      .select("id, step, status, created_at")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return {
    events: (eventsRes.data as FailedEventRow[] | null) ?? [],
    steps: (stepsRes.data as FailedStepRow[] | null) ?? [],
  };
}

function statusBadge(status: string): string {
  if (status === "dead_letter") return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  if (status === "failed") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-neutral-600/30 bg-neutral-700/20 text-neutral-400";
}

const STATE_TONE: Record<AutomationsState, string> = {
  CONNECTED: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  ERROR: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  "NOT CONFIGURED": "text-zinc-400 border-zinc-600/40 bg-zinc-800/40",
};

export default async function AutomationsPage() {
  const session = await requireCapabilityPage("automations.read", "/admin/automations");
  const snap = await getAutomationsSnapshot();
  const { events: failedEvents, steps: failedSteps } = await getFailureQueue();

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

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Failure queue</h2>
          <p className="text-sm text-zinc-400">
            Automation events and provisioning steps that need attention. Retry re-queues a failed step.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Type / Step</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {failedEvents.map((e) => (
                <tr key={`event-${e.id}`}>
                  <td className="px-4 py-3 text-neutral-200">
                    <span className="font-mono text-xs text-neutral-400">event</span> {e.event_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadge(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatIST(e.created_at, "datetime")}</td>
                  <td className="px-4 py-3 text-neutral-600">—</td>
                </tr>
              ))}
              {failedSteps.map((s) => (
                <tr key={`step-${s.id}`}>
                  <td className="px-4 py-3 text-neutral-200">
                    <span className="font-mono text-xs text-neutral-400">step</span> {s.step}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatIST(s.created_at, "datetime")}</td>
                  <td className="px-4 py-3">
                    <form action={retryProvisioningStep}>
                      <input type="hidden" name="stepId" value={s.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-100 transition hover:bg-neutral-700"
                      >
                        Retry
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {failedEvents.length === 0 && failedSteps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">
                    Nothing in the failure queue.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {session.role === "super_admin" ? (
        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Import workflow definitions</h2>
            <p className="text-sm text-zinc-400">
              Create any missing LIT workflows on the n8n instance from the bundled definitions. Existing
              workflows are left untouched and nothing is activated.
            </p>
          </div>
          <ImportButton />
        </section>
      ) : null}
    </div>
  );
}
