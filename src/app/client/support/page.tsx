import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Plus, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Support Tickets | Client Portal",
};

export const revalidate = 0;

export default async function ClientSupportPage() {
  const { data: tickets } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Submit bug reports, feature change requests, and architecture questions.
          </p>
        </div>

        <Link
          href="/support/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Ticket</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tickets && tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{t.subject}</div>
                      <div className="text-xs text-zinc-400 truncate max-w-sm">{t.message}</div>
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
                        className="text-primary hover:underline font-bold text-xs inline-flex items-center gap-1"
                      >
                        <span>View Discussion</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-zinc-500 text-xs">
                    No support tickets open. Everything is operating smoothly.
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
