import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminAiLeadsPage() {
  const { data: leads } = await supabaseAdmin
    .from("ai_captured_leads")
    .select("id, name, email, phone, company, interest, source, chat_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI leads</h1>
          <p className="text-neutral-400 text-sm">Captured from /ai and the site-wide chat widget.</p>
        </div>
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white">Back</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-[11px] uppercase tracking-wider text-neutral-400">
            <tr>
              {["When", "Name", "Email", "Interest", "Source", "Chat"].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(leads || []).map((row) => (
              <tr key={row.id} className="border-t border-neutral-800">
                <td className="px-3 py-2 text-neutral-400 whitespace-nowrap">{new Date(row.created_at).toLocaleString("en-IN")}</td>
                <td className="px-3 py-2 text-white">{row.name}</td>
                <td className="px-3 py-2 text-neutral-300">{row.email}</td>
                <td className="px-3 py-2 text-neutral-400 max-w-xs truncate">{row.interest || "—"}</td>
                <td className="px-3 py-2 text-neutral-400">{row.source}</td>
                <td className="px-3 py-2 text-neutral-500 font-mono text-[11px]">{row.chat_id ? String(row.chat_id).slice(0, 8) : "—"}</td>
              </tr>
            ))}
            {!leads?.length && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-neutral-500">No AI leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
