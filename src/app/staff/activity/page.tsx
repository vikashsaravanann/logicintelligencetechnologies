import { requireStaffPortal } from "@/lib/auth/staff-portal";

export const dynamic = "force-dynamic";

export default async function StaffActivityPage() {
  const ctx = await requireStaffPortal("/staff/activity");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Activity for {ctx.fullName} will appear here.
      </div>
    </div>
  );
}
