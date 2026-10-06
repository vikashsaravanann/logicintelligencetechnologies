import Link from "next/link";
import { z } from "zod";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const filtersSchema = z.object({
  action: z.string().trim().max(80).optional(),
  actor: z.string().trim().max(200).optional(),
  target_type: z.string().trim().max(80).optional(),
  outcome: z.enum(["succeeded", "failed", "denied"]).optional(),
  from: z.string().trim().max(40).optional(),
  to: z.string().trim().max(40).optional(),
  // keyset cursor: "<occurred_at>|<id>"
  cursor: z.string().trim().max(120).optional(),
});

interface AuditRow {
  id: string;
  occurred_at: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  outcome: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  error_code: string | null;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapabilityPage("audit.read", "/admin/audit");
  const raw = await searchParams;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string") flat[k] = v;
  const f = filtersSchema.safeParse(flat);
  const filters = f.success ? f.data : {};

  let q = supabaseAdmin
    .from("admin_audit_log")
    .select("id, occurred_at, actor_email, actor_role, action, outcome, target_type, target_id, metadata, error_code")
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (filters.action) q = q.ilike("action", `${filters.action}%`);
  if (filters.actor) q = q.ilike("actor_email", `%${filters.actor}%`);
  if (filters.target_type) q = q.eq("target_type", filters.target_type);
  if (filters.outcome) q = q.eq("outcome", filters.outcome);
  if (filters.from) q = q.gte("occurred_at", filters.from);
  if (filters.to) q = q.lte("occurred_at", filters.to);
  if (filters.cursor) {
    const [ts, id] = filters.cursor.split("|");
    // keyset: rows strictly "older" than the cursor in (occurred_at desc, id desc)
    if (ts && id) q = q.or(`occurred_at.lt.${ts},and(occurred_at.eq.${ts},id.lt.${id})`);
  }

  const { data, error } = await q;
  const rows = (data ?? []) as AuditRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const page = rows.slice(0, PAGE_SIZE);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? `${last.occurred_at}|${last.id}` : null;

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, cursor: undefined, ...extra })) {
      if (v) p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Audit Log</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Append-only record of every administrative action. Times in IST.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Action prefix
          <input name="action" defaultValue={filters.action ?? ""} placeholder="e.g. proposal."
            className="w-44 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Actor email
          <input name="actor" defaultValue={filters.actor ?? ""}
            className="w-52 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Outcome
          <select name="outcome" defaultValue={filters.outcome ?? ""}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white">
            <option value="">Any</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="denied">Denied</option>
          </select>
        </label>
        <button type="submit" className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400">
          Filter
        </button>
        <Link href="/admin/audit" className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900">
          Reset
        </Link>
      </form>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
          Could not load the audit log. The database request failed.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Outcome</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {page.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-400">{formatIST(r.occurred_at, "datetime")}</td>
                    <td className="px-4 py-3 text-neutral-300">
                      <div>{r.actor_email ?? "system"}</div>
                      {r.actor_role ? <div className="text-[11px] text-neutral-500">{r.actor_role}</div> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-indigo-300">{r.action}</td>
                    <td className="px-4 py-3">
                      <span className={
                        r.outcome === "succeeded" ? "text-emerald-400"
                        : r.outcome === "denied" ? "text-amber-400" : "text-rose-400"
                      }>{r.outcome}</span>
                      {r.error_code ? <div className="text-[11px] text-neutral-500">{r.error_code}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {r.target_type ? <span>{r.target_type}</span> : "—"}
                      {r.target_id ? <div className="font-mono text-[10px] text-neutral-600">{r.target_id}</div> : null}
                    </td>
                    <td className="px-4 py-3">
                      {r.metadata && Object.keys(r.metadata).length ? (
                        <details>
                          <summary className="cursor-pointer text-xs text-neutral-500">view</summary>
                          <pre className="mt-1 max-w-sm overflow-x-auto rounded bg-neutral-900 p-2 text-[11px] text-neutral-400">
{JSON.stringify(r.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
                {page.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No audit records match.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {nextCursor ? (
            <div className="flex justify-end">
              <Link href={`/admin/audit${qs({ cursor: nextCursor })}`}
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900">
                Next →
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
