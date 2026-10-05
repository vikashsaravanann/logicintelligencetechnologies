import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart2, MessageSquare, FileText, FolderKanban, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [projectsRes, invoicesRes, ticketsRes, chatsRes] = await Promise.all([
    supabase.from("projects").select("id, status", { count: "exact" }).eq("user_id", session.user.id),
    supabase.from("invoices").select("id, amount, status", { count: "exact" }).eq("user_id", session.user.id),
    supabase.from("support_tickets").select("id, status", { count: "exact" }).eq("user_id", session.user.id),
    supabase.from("ai_chats").select("id", { count: "exact" }).eq("user_id", session.user.id),
  ]);

  const paidTotal = (invoicesRes.data ?? [])
    .filter((i: any) => i.status === "paid")
    .reduce((s: number, i: any) => s + (i.amount ?? 0), 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const stats = [
    { label: "Active Projects", value: String(projectsRes.count ?? 0), icon: FolderKanban, color: "text-blue-400 border-blue-400/20" },
    { label: "Total Invoiced", value: fmt(paidTotal), icon: FileText, color: "text-emerald-400 border-emerald-400/20" },
    { label: "Support Tickets", value: String(ticketsRes.count ?? 0), icon: MessageSquare, color: "text-amber-400 border-amber-400/20" },
    { label: "AI Conversations", value: String(chatsRes.count ?? 0), icon: TrendingUp, color: "text-primary border-primary/20" },
  ];

  const projectsByStatus = (projectsRes.data ?? []).reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">A high-level view of your account activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`p-5 rounded-2xl bg-white/5 border ${s.color.split(" ")[1]} flex flex-col gap-3`}>
            <s.icon className={`w-5 h-5 ${s.color.split(" ")[0]}`} />
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Projects by Status</h3>
          </div>
          {Object.keys(projectsByStatus).length === 0 ? (
            <p className="text-zinc-600 text-sm">No projects found.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(projectsByStatus).map(([status, count]) => (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="capitalize">{status.replace("-", " ")}</span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      style={{ width: `${Math.round(((count as number) / (projectsRes.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Invoice Status</h3>
          </div>
          {(invoicesRes.data ?? []).length === 0 ? (
            <p className="text-zinc-600 text-sm">No invoices found.</p>
          ) : (
            <div className="space-y-3">
              {(["paid", "pending", "expired"] as const).map((status) => {
                const cnt = (invoicesRes.data ?? []).filter((i: any) => i.status === status).length;
                if (!cnt) return null;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span className="capitalize">{status}</span>
                      <span className="font-bold text-white">{cnt}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        style={{ width: `${Math.round((cnt / (invoicesRes.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
