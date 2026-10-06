import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = { title: "Email Activity | Admin" };
export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  await requireCapabilityPage("emails.read", "/admin/emails");

  const [statusRes, recentRes, auditCountRes] = await Promise.all([
    supabaseAdmin.from("email_outbox").select("status"),
    supabaseAdmin.from("email_outbox").select("*").order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("email_admin_audit").select("*", { count: "exact", head: true }),
  ]);

  const counts: Record<string, number> = {};
  for (const row of statusRes.data ?? []) {
    const s = String((row as { status: string | null }).status ?? "unknown");
    counts[s] = (counts[s] ?? 0) + 1;
  }
  const total = (statusRes.data ?? []).length;
  const recent = (recentRes.data ?? []) as Array<Record<string, unknown>>;

  const str = (r: Record<string, unknown>, ...keys: string[]) => {
    for (const k of keys) if (typeof r[k] === "string" && r[k]) return r[k] as string;
    return "—";
  };

  return (
    <div className="container mx-auto max-w-5xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Email Activity</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Live counts from the SMTP outbox. Administrative email actions are also audited.
          </p>
        </div>
        <Link href="/admin/emails/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-black hover:bg-primary/90">
          Compose
        </Link>
      </div>

      {statusRes.error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
          Could not load the email outbox.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            <div className="text-2xl font-black text-white">{total}</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Outbox total</div>
          </div>
          {["pending", "sent", "failed"].map((s) => (
            <div key={s} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="text-2xl font-black text-white">{counts[s] ?? 0}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">{s}</div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Audited admin email actions: {auditCountRes.error ? "unavailable" : (auditCountRes.count ?? 0)}
      </p>

      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Recipient</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {recent.map((r, i) => (
              <tr key={(r.id as string) ?? i}>
                <td className="px-4 py-3 text-neutral-200">{str(r, "recipient", "to_email", "to", "email")}</td>
                <td className="px-4 py-3 text-neutral-300">{str(r, "subject")}</td>
                <td className="px-4 py-3 text-neutral-400">{str(r, "status")}</td>
                <td className="px-4 py-3 text-neutral-500">{formatIST((r.created_at as string) ?? null, "datetime")}</td>
              </tr>
            ))}
            {recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">No outbox entries yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
