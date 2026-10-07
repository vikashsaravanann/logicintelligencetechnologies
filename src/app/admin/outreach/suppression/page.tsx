import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listSuppressions } from "@/lib/outreach/intelligence/queues";
import { formatIST } from "@/lib/format/datetime";
import { SuppressForm } from "./suppress-form";

export const metadata: Metadata = { title: "Suppression | Outreach" };
export const dynamic = "force-dynamic";

export default async function OutreachSuppressionPage() {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/suppression");
  const rows = await listSuppressions();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Suppression</h1>
        <p className="mt-1 text-sm text-neutral-400">
          The do-not-contact list. Every entry is enforced by the database outreach gate — no draft can even be created
          for a suppressed business or contact.
        </p>
      </div>

      <SuppressForm />

      <div className="overflow-x-auto rounded-2xl border border-neutral-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-neutral-900/60 text-[10px] uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">No suppressions yet.</td></tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-mono text-[12px] text-neutral-200">{s.email || s.domain || s.phone || "—"}</td>
                  <td className="px-4 py-3 text-neutral-400">{s.reason}</td>
                  <td className="px-4 py-3 text-neutral-500">{s.source ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.active ? "bg-rose-500/10 text-rose-300" : "bg-neutral-700/30 text-neutral-400"}`}>
                      {s.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatIST(s.created_at, "date")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
