import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffStageInspectorPage({
  params,
}: {
  params: Promise<{ engagementId: string }> | { engagementId: string };
}) {
  const { engagementId } = await params;
  const ctx = await requireStaffPortal(`/staff/projects/${engagementId}/stages`);

  const { data: assignment } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("id, assignment_role, can_view_technical_stages, status, expires_at")
    .eq("staff_user_id", ctx.userId)
    .eq("engagement_id", engagementId)
    .eq("status", "active")
    .maybeSingle();

  if (
    !assignment ||
    (assignment.expires_at && new Date(assignment.expires_at).getTime() <= Date.now())
  ) {
    notFound();
  }

  const { data: eng } = await supabaseAdmin
    .from("client_engagements")
    .select("id, engagement_ref, project_title, company_name, status, current_stage")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng) notFound();

  const { data: stages } = await supabaseAdmin
    .from("engagement_stages")
    .select("id, stage_key, ordinal, title, status, summary, updated_at")
    .eq("engagement_id", engagementId)
    .order("ordinal", { ascending: true });

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/staff/projects/${engagementId}`}
          className="text-xs font-medium text-teal-700 hover:underline"
        >
          ← Project
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">13-Stage Technical Inspector</h1>
        <p className="text-sm text-slate-600">
          {eng.project_title || eng.company_name} · {eng.engagement_ref}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-teal-800">
          Staff Technical Inspection — Authorized Project Access · Role {assignment.assignment_role}
        </p>
      </div>

      <ol className="space-y-2">
        {(stages || []).map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-slate-900">
                <span className="mr-2 text-slate-400">{s.ordinal}.</span>
                {s.title || s.stage_key}
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {s.status}
              </span>
            </div>
            {s.summary ? <p className="mt-1 text-xs text-slate-600 line-clamp-3">{s.summary}</p> : null}
          </li>
        ))}
        {(!stages || stages.length === 0) && (
          <li className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
            No stage records yet for this engagement. Stages appear after the engagement lifecycle is provisioned.
          </li>
        )}
      </ol>
    </div>
  );
}
