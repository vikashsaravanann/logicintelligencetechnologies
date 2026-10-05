import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";

export const revalidate = 0;

export default async function AdminAiLeadsPage() {
  const { data: leads } = await supabaseAdmin
    .from("ai_captured_leads")
    .select("id, name, email, phone, company, interest, source, chat_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <AdminBackLink />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">AI Leads</h1>
          <p className="text-sm text-neutral-400">
            Captured from /ai and the site-wide chat widget.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-[11px] uppercase tracking-wider text-neutral-400">
            <tr>
              {["When", "Name", "Email", "Interest", "Source", "Chat"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(leads || []).map((row) => (
              <tr key={row.id} className="border-t border-neutral-800">
                <td className="whitespace-nowrap px-3 py-2 text-neutral-400">
                  {new Date(row.created_at).toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-2 text-white">{row.name}</td>
                <td className="px-3 py-2 text-neutral-300">
                  <a
                    href={`mailto:${row.email}`}
                    className="hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                  >
                    {row.email}
                  </a>
                </td>
                <td className="max-w-xs truncate px-3 py-2 text-neutral-400">
                  {row.interest || "—"}
                </td>
                <td className="px-3 py-2 text-neutral-400">{row.source}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-neutral-500">
                  {row.chat_id ? String(row.chat_id).slice(0, 8) : "—"}
                </td>
              </tr>
            ))}
            {!leads?.length && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                  No AI leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
