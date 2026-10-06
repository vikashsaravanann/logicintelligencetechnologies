import Link from "next/link";
import { getStaffSession } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/config/roles";

export const dynamic = "force-dynamic";

export default async function AdminForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const { need } = await searchParams;
  const session = await getStaffSession();
  return (
    <div className="mx-auto max-w-lg py-16 text-center" role="alert">
      <h1 className="text-lg font-bold text-white">Not permitted</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Your role{session ? ` (${ROLE_LABELS[session.role]})` : ""} does not have
        access to this page{need ? ` (requires "${need}")` : ""}. Ask a super admin
        if you need it.
      </p>
      <Link
        href="/admin/command-center"
        className="mt-6 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
      >
        Back to Command Center
      </Link>
    </div>
  );
}
