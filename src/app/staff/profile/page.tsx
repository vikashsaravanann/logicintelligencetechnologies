import { requireStaffPortal } from "@/lib/auth/staff-portal";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const ctx = await requireStaffPortal("/staff/profile");

  return (
    <div className="space-y-4">
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
    </div>
  );
}
