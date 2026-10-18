import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffProjectsPage() {
  const ctx = await requireStaffPortal("/staff/projects");

  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select(
      "id, assignment_role, status, expires_at, client_engagements(project_title, company_name, engagement_ref)"
    )
    .eq("staff_user_id", ctx.userId)
    .eq("status", "active");

  const active = (assignments || []).filter(
    (a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now()
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned Projects</h1>
      {active.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {active.map((a) => {
            const eng = Array.isArray(a.client_engagements)
              ? a.client_engagements[0]
              : a.client_engagements;
            const engObj = eng as {
              project_title?: string;
              company_name?: string;
              engagement_ref?: string;
            } | null;
            return (
              <li key={a.id} className="px-4 py-3">
                <p className="font-medium text-slate-900">
                  {engObj?.project_title || engObj?.company_name || "Engagement"}
                </p>
                <p className="text-xs text-slate-500">
                  {a.assignment_role}
                  {engObj?.engagement_ref ? ` · ${engObj.engagement_ref}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          No projects have been assigned to your workspace.
        </p>
      )}
    </div>
  );
}
