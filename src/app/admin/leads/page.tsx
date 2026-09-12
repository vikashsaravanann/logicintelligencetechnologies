import { Metadata } from "next";
import Link from "next/link";
import { Users, Search, ArrowRight, ShieldCheck, Filter } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "CRM Leads Ledger | Admin Command Center",
};

export const revalidate = 0;

export default async function AdminLeadsPage() {
  const { data: leads } = await supabaseAdmin
    .from("contact_leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            CRM Inbound Leads Ledger
          </h1>
          <p className="text-zinc-400 text-sm">
            Centralized registry of contact inquiries, demo requests, and calculated intent scores.
          </p>
        </div>

        <Link
          href="/admin/command-center"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          Command Center
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/50 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Lead Name / Email</th>
                <th className="p-4">Company</th>
                <th className="p-4">Intent Score</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Captured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {leads && leads.length > 0 ? (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{l.name}</div>
                      <div className="text-xs text-zinc-400">{l.email}</div>
                    </td>
                    <td className="p-4 text-xs text-zinc-300">{l.company || "Not Specified"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (l.lead_score || 35) >= 75
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : (l.lead_score || 35) >= 50
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
                        }`}
                      >
                        {l.lead_score || 35} / 100
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                        {l.pipeline_stage || "New Lead"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-zinc-500 text-xs">
                    No leads in database yet.
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
