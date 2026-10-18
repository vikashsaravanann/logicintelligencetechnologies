import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { getStaffProfileBundle } from "@/lib/staff/profile";
import { PortraitUpload } from "./PortraitUpload";
import { ProfileEditor } from "./ProfileEditor";
import { ResumeBuilder } from "./ResumeBuilder";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const ctx = await requireStaffPortal("/staff/profile");
  const bundle = await getStaffProfileBundle(ctx.userId);

  const portrait =
    (bundle.details as { portrait_url?: string; avatar_url?: string } | null)?.portrait_url ||
    (bundle.details as { avatar_url?: string } | null)?.avatar_url ||
    null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            My Professional Profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Manage your personal information, professional background and career achievements while
            official employment details remain secured by Logic Intelligence Technologies.
          </p>
        </div>
        <Link
          href="/staff/settings/security"
          className="inline-flex shrink-0 justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
        >
          Account Security
        </Link>
      </div>

      {/* Centered portrait + identity — single column top */}
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-6 sm:px-6 sm:py-8">
        <PortraitUpload currentUrl={portrait} />
        <div className="mx-auto mt-5 max-w-xl space-y-1 text-center">
          <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl md:text-[1.75rem]">
            {ctx.fullName}
          </h2>
          <p className="break-words text-sm font-semibold text-slate-700 sm:text-base">
            {ctx.jobTitle}
          </p>
          <p className="break-words text-sm text-slate-500">{ctx.department}</p>
          <p className="break-words text-xs text-slate-500 sm:text-sm">
            {ctx.employeeCode
              ? `Employee Code: ${ctx.employeeCode}`
              : "Employee Code: Not Assigned"}
          </p>
          {ctx.email ? (
            <p className="break-all text-xs text-slate-500 sm:text-sm">{ctx.email}</p>
          ) : null}
        </div>
      </section>

      {/* Vertical profile sections */}
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

      {/* Resume builder last */}
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <ResumeBuilder />
      </div>
    </div>
  );
}
