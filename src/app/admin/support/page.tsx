import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Support Desk Queue
        </h1>
        <p className="text-zinc-400 text-sm">
          Triage client issues, bug alerts, and feature requests across all tenant accounts.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/50 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Ticket Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {tickets && tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{t.subject}</div>
                      <div className="text-xs text-zinc-400 truncate max-w-md">{t.message}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status === "Open"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/support/${t.id}`}
                        target="_blank"
                        className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-zinc-500 text-xs">
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
