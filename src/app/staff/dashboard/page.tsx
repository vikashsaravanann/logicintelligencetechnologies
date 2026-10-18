import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }> | { denied?: string };
}) {
  const params = await searchParams;
  const ctx = await requireStaffPortal("/staff/dashboard");

  let tasks: Array<{
    id: string;
    title: string;
    state: string;
    priority: string;
    due_at: string | null;
  }> = [];
  try {
    const { data, error } = await supabaseAdmin
      .from("staff_tasks")
      .select("id, title, state, priority, due_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) console.error("[staff/dashboard] tasks:", error.message);
    else tasks = data || [];
  } catch (e: any) {
    console.error("[staff/dashboard] tasks exception:", e?.message);
  }

  let activeAssignments: Array<{
    id: string;
    assignment_role: string;
    title: string;
  }> = [];
  try {
    const { data, error } = await supabaseAdmin
      .from("staff_client_assignments")
      .select("id, assignment_role, status, expires_at, engagement_id")
      .eq("staff_user_id", ctx.userId)
      .eq("status", "active")
      .limit(8);
    if (error) {
      console.error("[staff/dashboard] assignments:", error.message);
    } else {
      const rows = (data || []).filter(
        (a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now()
      );
      // Resolve titles separately to avoid nested join failures
      const engIds = rows.map((r) => r.engagement_id).filter(Boolean) as string[];
      let titleMap = new Map<string, string>();
      if (engIds.length) {
        const { data: engs } = await supabaseAdmin
          .from("client_engagements")
          .select("id, project_title, company_name")
          .in("id", engIds);
        (engs || []).forEach((e) => {
          titleMap.set(e.id, e.project_title || e.company_name || "Engagement");
        });
      }
      activeAssignments = rows.map((a) => ({
        id: a.id,
        assignment_role: a.assignment_role,
        title: (a.engagement_id && titleMap.get(a.engagement_id)) || "Assigned engagement",
      }));
    }
  } catch (e: any) {
    console.error("[staff/dashboard] assignments exception:", e?.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome, {ctx.fullName}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {ctx.jobTitle} · {ctx.department}
          {ctx.employeeCode ? ` · Code ${ctx.employeeCode}` : ""}
        </p>
      </div>

      {params?.denied ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Access denied for module: <code className="font-mono">{params.denied}</code>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">My Assigned Tasks</h2>
            <Link href="/staff/tasks" className="text-xs font-medium text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {t.state} · {t.priority}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No tasks currently assigned.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Assigned Projects</h2>
            <Link href="/staff/projects" className="text-xs font-medium text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {activeAssignments.length > 0 ? (
            <ul className="space-y-2">
              {activeAssignments.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.assignment_role}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No projects currently assigned.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Workspace</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-800">{ctx.workspaceStatus}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Modules granted</dt>
              <dd className="font-medium text-slate-800">{ctx.capabilities.length}</dd>
            </div>
            <div className="pt-2">
              <Link href="/staff/profile" className="text-xs font-medium text-teal-700 hover:underline">
                Open profile →
              </Link>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
