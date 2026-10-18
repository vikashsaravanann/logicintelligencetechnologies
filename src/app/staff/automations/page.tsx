import { requireStaffCapability } from "@/lib/auth/staff-portal";

export const dynamic = "force-dynamic";

export default async function StaffAutomationsPage() {
  const ctx = await requireStaffCapability("automations.read", "/staff/automations");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Automations</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Authorized module for {ctx.fullName}. Operational records appear here when available.
      </div>
    </div>
  );
}
