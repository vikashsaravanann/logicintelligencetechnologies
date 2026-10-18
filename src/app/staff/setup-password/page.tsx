import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { StaffSetupPasswordForm } from "./SetupPasswordForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Set Personal Password | LIT Staff Portal",
};

export default async function StaffSetupPasswordPage() {
  const session = await getStaffSession();
  if (!session) {
    redirect("/login?next=/staff/setup-password");
  }

  const { data: ws } = await supabaseAdmin
    .from("staff_workspaces")
    .select("id, status, owner_user_id")
    .eq("owner_user_id", session.userId)
    .maybeSingle();

  if (!ws) {
    if (session.role === "super_admin") {
      redirect("/admin/command-center");
    }
    redirect("/login?reason=no-workspace");
  }

  // Already active → dashboard
  if (ws.status === "active") {
    redirect("/staff/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          LIT Staff Portal
        </p>
        <h1 className="mt-2 text-xl font-bold text-slate-900">Set your personal password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Replace the temporary password provided by leadership. You will then access your Staff Portal.
        </p>
        <div className="mt-6">
          <StaffSetupPasswordForm workspaceId={ws.id} />
        </div>
      </div>
    </div>
  );
}
