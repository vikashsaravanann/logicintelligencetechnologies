import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = { title: "Clients | Admin" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  prospect: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  closed: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
};

const STATUSES = ["prospect", "active", "paused", "closed"] as const;

export default async function ClientsPage() {
  await requireCapabilityPage("clients.read", "/admin/clients");

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id, client_code, legal_name, contact_email, status, created_at")
    .not("is_fixture", "is", true)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const counts = STATUSES.map((s) => ({
    status: s,
    count: rows.filter((r) => r.status === s).length,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <p className="mt-1 text-sm text-neutral-400">Real client accounts (fixtures excluded).</p>
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {counts.map((c) => (
          <div key={c.status} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{c.status}</span>
            <div className="mt-2 text-2xl font-black text-white">{error ? "—" : c.count}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
          Could not load clients. The database query failed.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Legal name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-200">{c.client_code}</td>
                  <td className="px-4 py-3 text-neutral-200">
                    <Link href={`/admin/clients/${c.id}`} className="font-medium text-white hover:text-primary">
                      {c.legal_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{c.contact_email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[c.status] ?? STATUS_TONE.closed}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatIST(c.created_at, "date")}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                    No clients yet. Start a contract from an approved proposal to create one.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
