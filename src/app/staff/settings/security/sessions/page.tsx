import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { SessionsClient } from "./SessionsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Active Sessions | LIT Staff Portal" };

export default async function StaffSessionsPage() {
  await requireStaffPortal("/staff/settings/security/sessions");
  return (
    <div className="space-y-6">
      <div>
        <Link href="/staff/settings/security" className="text-xs font-medium text-teal-700 hover:underline">
          ← Account Security
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Active Sessions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign out this browser, other sessions, or all sessions. Refresh tokens are revoked according to
          Supabase scope; short-lived access tokens may remain valid until natural expiry.
        </p>
      </div>
      <SessionsClient />
    </div>
  );
}
