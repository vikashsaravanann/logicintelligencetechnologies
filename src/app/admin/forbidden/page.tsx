import { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, FileText, Lock } from "lucide-react";
import { getStaffSession } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/config/roles";

export const metadata: Metadata = {
  title: "Access Restricted | Admin",
  description: "Cryptographic capability check failed for the requested administrative route.",
};

export const dynamic = "force-dynamic";

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
        Anonymous
      </span>
    );
  }
  const norm = role.toLowerCase();
  let tone = "bg-slate-100 text-slate-700 border-slate-200";

  if (norm === "super_admin") {
    tone = "bg-purple-50 text-purple-700 border-purple-200";
  } else if (norm === "admin") {
    tone = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (norm === "agent" || norm === "operations") {
    tone = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (norm === "viewer") {
    tone = "bg-slate-100 text-slate-700 border-slate-200";
  } else if (norm === "support") {
    tone = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (norm === "developer") {
    tone = "bg-cyan-50 text-cyan-700 border-cyan-200";
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider ${tone}`}
    >
      {ROLE_LABELS[norm as keyof typeof ROLE_LABELS] ?? role}
    </span>
  );
}

export default async function AdminForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const { need } = await searchParams;
  const session = await getStaffSession();

  return (
    <div className="mx-auto max-w-xl py-12 px-4 sm:px-6" role="alert">
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-8 sm:p-10 shadow-xs text-center">
        {/* Shield Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* 403 Status Pill */}
        <div className="mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-rose-700">
            <Lock className="h-3 w-3 text-rose-600" />
            403 Forbidden · Authorization Required
          </span>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
          Your current personnel account does not possess the requisite capability privileges to
          access this administrative section.
        </p>

        {/* Context Diagnostic Card */}
        <div className="mt-6 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/70 p-4 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--lit-text-muted,#52677C)]">Current Role</span>
            <RoleBadge role={session?.role ?? null} />
          </div>

          {session?.email ? (
            <div className="mt-2.5 flex items-center justify-between border-t border-[var(--lit-border-light,#DFE7EF)] pt-2.5 text-xs">
              <span className="font-semibold text-[var(--lit-text-muted,#52677C)]">Account Identity</span>
              <span className="font-mono text-xs font-medium text-[var(--lit-navy,#0B2545)]">
                {session.email}
              </span>
            </div>
          ) : null}

          {need ? (
            <div className="mt-2.5 flex items-center justify-between border-t border-[var(--lit-border-light,#DFE7EF)] pt-2.5 text-xs">
              <span className="font-semibold text-[var(--lit-text-muted,#52677C)]">Required Capability</span>
              <code className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-xs font-semibold text-rose-700">
                {need}
              </code>
            </div>
          ) : null}
        </div>

        {/* Advisory Explanation */}
        <p className="mt-5 text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
          Access matrices are strictly enforced at the routing and database query layers. If your operational
          duties require this capability, please contact a Super Administrator.
        </p>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/admin/command-center"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-5 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#153a66]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Command Center</span>
          </Link>

          <Link
            href="/admin/audit"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--lit-navy,#0B2545)] shadow-xs transition-colors hover:bg-slate-50"
          >
            <FileText className="h-4 w-4 text-[var(--lit-text-muted,#52677C)]" />
            <span>View Audit Log</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
