import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { getStaffProfileBundle } from "@/lib/staff/profile";
import { PortraitUpload } from "./PortraitUpload";
import { ProfileEditor } from "./ProfileEditor";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const ctx = await requireStaffPortal("/staff/profile");
  const bundle = await getStaffProfileBundle(ctx.userId);

  const portrait =
    (bundle.details as { portrait_url?: string; avatar_url?: string } | null)?.portrait_url ||
    (bundle.details as { avatar_url?: string } | null)?.avatar_url ||
    null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Professional Profile</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Manage your personal information, professional background and career achievements while
            keeping official employment details securely maintained by Logic Intelligence
            Technologies.
          </p>
        </div>
        <Link
          href="/staff/settings/security"
          className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
        >
          Account Security
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Portrait (4:5)</h2>
          <PortraitUpload currentUrl={portrait} />
          <div className="mt-4 space-y-1 text-sm">
            <p className="font-semibold text-slate-900">{ctx.fullName}</p>
            <p className="text-xs text-slate-600">{ctx.jobTitle}</p>
            <p className="text-xs text-slate-500">{ctx.department}</p>
            <p className="text-xs text-slate-500">
              {ctx.employeeCode ? `Employee Code: ${ctx.employeeCode}` : "Employee Code: Not Assigned"}
            </p>
          </div>
        </section>

        <ProfileEditor
          fullName={ctx.fullName}
          employeeCode={ctx.employeeCode}
          email={ctx.email}
          department={ctx.department}
          jobTitle={ctx.jobTitle}
          role={ctx.role}
          details={bundle.details as Record<string, unknown> | null}
          entries={(bundle.entries || []).map((e: Record<string, unknown>) => ({
            id: String(e.id),
            entry_type: String(e.entry_type),
            title: (e.title as string) || null,
            organization: (e.organization as string) || null,
            category: (e.category as string) || null,
            description: (e.description as string) || null,
            include_in_resume: e.include_in_resume !== false,
          }))}
        />
      </div>
    </div>
  );
}
