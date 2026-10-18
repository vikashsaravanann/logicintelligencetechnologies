import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffSupportPage() {
  const ctx = await requireStaffPortal("/staff/support");

  const { data: tickets } = await supabaseAdmin
    .from("support_tickets")
    .select(
      "id, ticket_ref, subject, status, severity, priority, requester_email, engagement_id, created_at, assigned_staff_id"
    )
    .eq("assigned_staff_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: events } = await supabaseAdmin
    .from("staff_workspace_events")
    .select("id, event_key, details, created_at")
    .eq("workspace_id", ctx.workspaceId)
    .eq("event_key", "client.message.received")
    .order("created_at", { ascending: false })
    .limit(15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tickets assigned to you and recent client message alerts.
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href="/staff/messages"
          className="inline-flex rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-3 py-2 text-sm font-semibold text-white"
        >
          Messages inbox
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Assigned tickets</h2>
        {tickets && tickets.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/staff/support/${t.id}`}
                  className="block py-2.5 text-sm hover:bg-slate-50 -mx-2 px-2 rounded"
                >
                  <p className="font-medium text-slate-900">{t.subject}</p>
                  <p className="text-xs text-slate-500">
                    {t.ticket_ref || t.id.slice(0, 8)} · {t.status}
                    {t.severity ? ` · ${t.severity}` : ""}
                    {t.requester_email ? ` · ${t.requester_email}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No tickets assigned to you yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Client message alerts</h2>
        {events && events.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {events.map((e) => {
              const d = (e.details || {}) as { client_email?: string; preview?: string };
              return (
                <li key={e.id} className="py-2.5 text-sm">
                  <p className="font-medium text-slate-800">{d.client_email || "Client"}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{d.preview}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No message alerts yet.</p>
        )}
      </section>
    </div>
  );
}
