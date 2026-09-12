import { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FileText, Plus, ArrowRight, CheckCircle2, Clock, Eye, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Proposal Management | Admin Command Center",
};

export const revalidate = 0;

export default async function AdminProposalsPage() {
  const { data: proposals } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Client Proposals & Contracts
          </h1>
          <p className="text-zinc-400 text-sm">
            Generate, send, and track client proposals and digital signatures.
          </p>
        </div>
        <Link
          href="/admin/proposals/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Proposal</span>
        </Link>
      </div>

      {/* Proposals List */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/50 text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Proposal Title / Client</th>
                <th className="p-4">Status</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {proposals && proposals.length > 0 ? (
                proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{p.title}</div>
                      <div className="text-xs text-zinc-400">
                        {p.client_name} {p.client_company ? `(${p.client_company})` : ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "Viewed"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      {p.currency === "INR" ? "₹" : "$"}{Number(p.pricing).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs text-zinc-400">{p.timeline}</td>
                    <td className="p-4 text-xs text-zinc-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/proposal/${p.secure_token}`}
                        target="_blank"
                        className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Client Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">
                    No proposals generated yet. Click &quot;Create New Proposal&quot; to begin.
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
