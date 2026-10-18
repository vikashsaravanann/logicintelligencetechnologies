import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Account Security | LIT Staff Portal",
};

export default async function StaffAccountSecurityPage() {
  const ctx = await requireStaffPortal("/staff/settings/security");

  const { data: events } = await supabaseAdmin
    .from("staff_workspace_events")
    .select("id, event_key, details, created_at")
    .eq("workspace_id", ctx.workspaceId)
    .in("event_key", [
      "staff.password.changed",
      "workspace.password_setup_completed",
      "workspace.created",
    ])
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Security</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your password, account protection, and security preferences.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Password Security</h2>
        <p className="mt-1 text-sm text-slate-600">
          Use a unique password of at least 12 characters. Never share it or send it by email.
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Registered email</dt>
            <dd className="font-medium">{ctx.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Email verification</dt>
            <dd className="font-medium text-emerald-700">Verified (required for staff access)</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Workspace status</dt>
            <dd className="font-medium">{ctx.workspaceStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Two-factor authentication</dt>
            <dd className="font-medium text-slate-600">Not configured</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">
          Confirm your current password, then choose a new personal password.
        </p>
        <ChangePasswordForm />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Account Security Activity</h2>
        <p className="mt-1 mb-3 text-sm text-slate-600">Recent security events for your workspace.</p>
        {events && events.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {events.map((e) => (
              <li key={e.id} className="py-2.5 text-sm">
                <p className="font-medium text-slate-800">{e.event_key}</p>
                <p className="text-xs text-slate-500">
                  {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
                  {(e.details as { event_reference?: string } | null)?.event_reference
                    ? ` · ${(e.details as { event_reference?: string }).event_reference}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No security events recorded yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Account Recovery</h2>
        <p className="mt-1 text-sm text-slate-600">
          If you cannot sign in, use the official forgot-password flow. Recovery links expire and
          never include your password.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:underline"
        >
          Open sign-in / recovery →
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Help and Security Support</h2>
        <p className="mt-1 text-sm text-slate-600">
          Contact an authorized LIT administrator if you did not authorize a password change or
          receive unexpected security email.
        </p>
      </section>
    </div>
  );
}
