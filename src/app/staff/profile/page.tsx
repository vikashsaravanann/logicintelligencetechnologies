import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const ctx = await requireStaffPortal("/staff/profile");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
      <dl className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Full legal name</dt>
          <dd className="font-medium">{ctx.fullName}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Employee code</dt>
          <dd className="font-medium">{ctx.employeeCode || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Official email</dt>
          <dd className="font-medium">{ctx.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Department</dt>
          <dd className="font-medium">{ctx.department}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Job title</dt>
          <dd className="font-medium">{ctx.jobTitle}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">System role</dt>
          <dd className="font-medium">{ctx.role}</dd>
        </div>
      </dl>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Account Security</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage your password and protect access to your Staff Workspace.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/staff/settings/security"
            className="inline-flex rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-3 py-2 text-sm font-semibold text-white"
          >
            Change Password
          </Link>
          <Link
            href="/staff/settings/security"
            className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          >
            View Security Activity
          </Link>
        </div>
      </section>
    </div>
  );
}
