import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { MfaEnrollClient } from "./MfaEnrollClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Two-Factor Authentication | LIT Staff Portal" };

export default async function StaffMfaPage() {
  await requireStaffPortal("/staff/settings/security/mfa");
  return (
    <div className="space-y-6">
      <div>
        <Link href="/staff/settings/security" className="text-xs font-medium text-teal-700 hover:underline">
          ← Account Security
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Two-Factor Authentication</h1>
        <p className="mt-1 text-sm text-slate-600">
          Use an authenticator app (TOTP) for an extra sign-in factor. Secrets are never emailed or logged.
        </p>
      </div>
      <MfaEnrollClient />
    </div>
  );
}
