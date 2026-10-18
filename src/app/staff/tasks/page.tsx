import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffTasksPage() {
  const ctx = await requireStaffPortal("/staff/tasks");

  const { data: tasks } = await supabaseAdmin
    .from("staff_tasks")
    .select("id, title, description_safe, priority, state, due_at")
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
      {tasks && tasks.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {tasks.map((t) => (
            <li key={t.id} className="px-4 py-3">
              <p className="font-medium text-slate-900">{t.title}</p>
              <p className="text-xs text-slate-500">
                {t.state} · {t.priority}
              </p>
              {t.description_safe ? (
                <p className="mt-1 text-sm text-slate-600">{t.description_safe}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No tasks assigned.</p>
      )}
    </div>
  );
}
