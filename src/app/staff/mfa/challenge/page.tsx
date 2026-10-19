import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { MfaChallengeClient } from "./MfaChallengeClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify Authenticator | LIT Staff Portal" };

export default async function StaffMfaChallengePage() {
  await requireStaffPortal("/staff/mfa/challenge");

  return (
    <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Logic Intelligence Technologies · Staff Security
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Verify your authenticator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the current code from your authenticator app to continue to
          your authorized Staff Workspace. Your password alone is not enough
          when staff multi-factor authentication is required.
        </p>
      </div>
      <MfaChallengeClient />
    </div>
  );
}
