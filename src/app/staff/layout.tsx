import type { ReactNode } from "react";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { buildStaffNavigation, toSerializableStaffNav } from "@/config/staff-nav";
import { StaffShell } from "./components/StaffShell";
import { getStaffSession } from "@/lib/auth/session";
import { getSelfStaffWorkspace } from "@/lib/workspaces/service";
import { redirect } from "next/navigation";

export const metadata = {
  title: "LIT Staff Portal | Logic Intelligence Technologies",
  description: "Private operational workspace for authorized staff.",
};

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await getStaffSession();
  if (!session) {
    redirect("/login?next=/staff/dashboard");
  }

  const self = await getSelfStaffWorkspace(session.userId);
  const status = self?.status || "";

  // Onboarding: password setup uses minimal chrome (page provides UI)
  if (
    self?.hasActiveWorkspace &&
    (status === "pending_email_verification" || status === "initial_password_change_required")
  ) {
    return <>{children}</>;
  }

  const ctx = await requireStaffPortal("/staff/dashboard");
  // CRITICAL: only plain serializable data crosses Server → Client boundary
  const nav = toSerializableStaffNav(buildStaffNavigation(ctx.capabilities));

  return (
    <StaffShell
      fullName={ctx.fullName}
      jobTitle={ctx.jobTitle}
      department={ctx.department}
      employeeCode={ctx.employeeCode}
      email={ctx.email}
      navItems={nav}
    >
      {children}
    </StaffShell>
  );
}
