import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isJob(row: { company?: string | null; message?: string | null }) {
  const blob = `${row.company || ""} ${row.message || ""}`;
  return /seat:|chief executive|director of|leadership/i.test(blob);
}

export default async function LeadsPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient(
    { cookies: () => cookieStore as never },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email?.endsWith("@logicintelligencetechnologies.in")) {
    redirect("/login");
  }

  const { data: rows } = await supabaseAdmin
    .from("contact_leads")
    .select("id,name,email,company,message,created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  const jobs = (rows || []).filter(isJob);
  const others = (rows || []).filter((r) => !isJob(r));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Leads & applications</h1>
      <p className="text-sm text-zinc-400 mb-8">Jobs applications first. Company column is the seat when they applied from /jobs.</p>

      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300 mb-3">Jobs applications ({jobs.length})</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10 mb-10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Seat</th>
              <th className="p-3">Pitch</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-zinc-500">No applications yet.</td></tr>
            )}
            {jobs.map((r) => (
              <tr key={r.id} className="border-t border-white/10 align-top">
                <td className="p-3 text-zinc-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "—"}</td>
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.company || "—"}</td>
                <td className="p-3 text-zinc-300 max-w-md whitespace-pre-wrap">{(r.message || "").slice(0, 400)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">Other leads ({others.length})</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {others.map((r) => (
              <tr key={r.id} className="border-t border-white/10 align-top">
                <td className="p-3 text-zinc-400 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "—"}</td>
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3 text-zinc-300 max-w-lg whitespace-pre-wrap">{(r.message || "").slice(0, 280)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
