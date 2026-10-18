import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resolveCanonicalByEngagementId } from "@/lib/projects/canonical";

export const dynamic = "force-dynamic";

export default async function StaffProjectDetailPage({
  params,
}: {
  params: Promise<{ engagementId: string }> | { engagementId: string };
}) {
  const { engagementId } = await params;
  const ctx = await requireStaffPortal(`/staff/projects/${engagementId}`);

  // Assignment gate
  const { data: assignment } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("id, assignment_role, status, expires_at")
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

  const canonical = await resolveCanonicalByEngagementId(engagementId);
  if (!canonical) notFound();

  const { data: tasks } = await supabaseAdmin
    .from("staff_tasks")
    .select("id, title, state, priority, due_at")
    .eq("workspace_id", ctx.workspaceId)
    .eq("engagement_id", engagementId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: tickets } = await supabaseAdmin
    .from("support_tickets")
    .select("id, ticket_ref, subject, status, severity, created_at")
    .eq("engagement_id", engagementId)
    .or(`assigned_staff_id.eq.${ctx.userId},assigned_staff_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/staff/projects" className="text-xs font-medium text-teal-700 hover:underline">
          ← Projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{canonical.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {canonical.engagementRef ? `Ref ${canonical.engagementRef} · ` : ""}
          Role: {assignment.assignment_role}
          {canonical.status ? ` · ${canonical.status}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
          {tasks && tasks.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {t.state} · {t.priority}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No tasks currently assigned.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Support tickets</h2>
          {tickets && tickets.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/staff/support/${t.id}`}
                    className="block rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-xs text-slate-500">
                      {t.ticket_ref || t.id.slice(0, 8)} · {t.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No tickets for this project.</p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">13-Stage inspector</h2>
        <p className="mt-1 text-sm text-slate-600">Review canonical lifecycle status for this engagement.</p>
        <Link
          href={`/staff/projects/${engagementId}/stages`}
          className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:underline"
        >
          Open stage inspector →
        </Link>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Messages</h2>
        <p className="mt-1 text-sm text-slate-600">
          Open the staff messages inbox for client conversations linked to your assignments.
        </p>
        <Link
          href="/staff/messages"
          className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:underline"
        >
          Open Messages →
        </Link>
      </section>
    </div>
  );
}
