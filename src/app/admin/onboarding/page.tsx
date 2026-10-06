import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { sessionState } from "@/lib/onboarding/token-core";
import { IssueLinkForm } from "./issue-link-form";

export const metadata: Metadata = { title: "Onboarding | Admin" };
export const dynamic = "force-dynamic";

const STATE_TONE: Record<string, string> = {
  valid: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  consumed: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  revoked: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
  expired: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  invalid: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default async function OnboardingPage() {
  await requireCapabilityPage("onboarding.manage", "/admin/onboarding");

  const { data, error } = await supabaseAdmin
    .from("onboarding_sessions")
    .select("id, contract_id, client_id, project_id, created_at, expires_at, revoked_at, consumed_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Client Onboarding</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Issue single-use onboarding links and review their status. Tokens are hashed at rest and shown only once.
        </p>
      </div>

      <IssueLinkForm />

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
          Could not load onboarding sessions.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Contract</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(data ?? []).map((s) => {
                const state = sessionState(s);
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATE_TONE[state]}`}>
                        {state}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-400">{s.contract_id ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-400">{formatIST(s.created_at, "datetime")}</td>
                    <td className="px-4 py-3 text-neutral-400">{formatIST(s.expires_at, "datetime")}</td>
                  </tr>
                );
              })}
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">No onboarding links yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
