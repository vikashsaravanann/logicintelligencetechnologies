import Image from "next/image";
import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COMPANY } from "@/config/company";
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
      "workspace.email_verified_reconciled",
    ])
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      {/* Brand header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src={COMPANY.logoIconPath || "/assets/logo-icon.webp"}
              alt={COMPANY.displayName}
              fill
              className="object-contain p-1"
            />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {COMPANY.displayName}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Secure Your Staff Account
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Your Staff Workspace provides access to authorized client projects, internal documents,
              technical tasks and company systems. Strong account protection helps safeguard
              confidential information and prevents unauthorized access.
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Email", value: "Verified", note: ctx.email || "—" },
          { label: "Workspace", value: ctx.workspaceStatus, note: "Access state" },
          { label: "MFA", value: "Manage below", note: "Authenticator app" },
          { label: "Password", value: "Change anytime", note: "Min. 12 characters" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{c.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{c.value}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{c.note}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Why account security matters</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Protects confidential client project data and technical documents.</li>
          <li>Prevents unauthorized access to assigned workspaces and systems.</li>
          <li>Authenticator MFA adds a second factor beyond passwords.</li>
          <li>Never share passwords or MFA codes; LIT will never email your password.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">
          Confirm your current password, then choose a new personal password. After a successful
          change, a security notification is queued to your registered email.
        </p>
        <ChangePasswordForm />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Two-Factor Authentication</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enroll an authenticator app (TOTP) for stronger sign-in protection.
          </p>
          <Link
            href="/staff/settings/security/mfa"
            className="mt-3 inline-flex rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-3 py-2 text-sm font-semibold text-white"
          >
            Manage Two-Factor Authentication
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Active Sessions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sign out this browser, other devices, or all sessions using Supabase Auth scopes.
          </p>
          <Link
            href="/staff/settings/security/sessions"
            className="mt-3 inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
          >
            Manage Active Sessions
          </Link>
        </div>
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
        <h2 className="text-sm font-semibold text-slate-900">Help and recovery</h2>
        <p className="mt-1 text-sm text-slate-600">
          If you did not authorize a password change or MFA enrollment, contact an authorized LIT
          administrator and use the official recovery process on the sign-in page.
        </p>
        <Link href="/login" className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:underline">
          Open sign-in / recovery →
        </Link>
      </section>
    </div>
  );
}
