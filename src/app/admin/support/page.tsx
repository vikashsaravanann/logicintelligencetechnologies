import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";

export const metadata: Metadata = {
  title: "Support Desk | Admin Command Center",
};

export const revalidate = 0;

export default async function AdminSupportPage() {
  const { data: tickets } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <AdminBackLink />
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Support Desk Queue
        </h1>
        <p className="text-sm text-zinc-400">
          Triage client issues, bug alerts, and feature requests. Ticket content stays inside the
          admin console — not on public routes.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/50 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {tickets && tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="text-sm font-bold text-white">{t.subject}</div>
                      <div className="mt-1 max-w-xl text-xs text-zinc-400 whitespace-pre-wrap">
                        {t.message}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          t.status === "Open"
                            ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-xs text-zinc-500">
                    Support queue is clear. No unresolved issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
