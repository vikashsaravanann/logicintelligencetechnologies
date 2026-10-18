import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffProjectsPage() {
  const ctx = await requireStaffPortal("/staff/projects");

  const { data: assignments, error } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("id, assignment_role, status, expires_at, engagement_id")
    .eq("staff_user_id", ctx.userId)
    .eq("status", "active");

  if (error) console.error("[staff/projects]", error.message);

  const rows = (assignments || []).filter(
    (a) => !a.expires_at || new Date(a.expires_at).getTime() > Date.now()
  );
  const engIds = rows.map((r) => r.engagement_id).filter(Boolean) as string[];
  const titleMap = new Map<string, { title: string; ref: string }>();
  if (engIds.length) {
    const { data: engs } = await supabaseAdmin
      .from("client_engagements")
      .select("id, project_title, company_name, engagement_ref")
      .in("id", engIds);
    (engs || []).forEach((e) => {
      titleMap.set(e.id, {
        title: e.project_title || e.company_name || "Engagement",
        ref: e.engagement_ref || "",
      });
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned Projects</h1>
      {rows.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {rows.map((a) => {
            const meta = a.engagement_id ? titleMap.get(a.engagement_id) : null;
            return (
              <li key={a.id} className="px-4 py-3">
                {a.engagement_id ? (
                  <Link
                    href={`/staff/projects/${a.engagement_id}`}
                    className="block hover:bg-slate-50 -mx-4 -my-3 px-4 py-3 rounded-lg"
                  >
                    <p className="font-medium text-slate-900">{meta?.title || "Engagement"}</p>
                    <p className="text-xs text-slate-500">
                      {a.assignment_role}
                      {meta?.ref ? ` · ${meta.ref}` : ""}
                    </p>
                  </Link>
                ) : (
                  <>
                    <p className="font-medium text-slate-900">{meta?.title || "Engagement"}</p>
                    <p className="text-xs text-slate-500">{a.assignment_role}</p>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No projects currently assigned.</p>
      )}
    </div>
  );
}
