import type { ReactNode } from "react";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { buildStaffNavigation } from "@/config/staff-nav";
import { StaffShell } from "./components/StaffShell";

export const metadata = {
  title: "LIT Staff Portal | Logic Intelligence Technologies",
  description: "Private operational workspace for authorized staff.",
};

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const ctx = await requireStaffPortal("/staff/dashboard");
  const nav = buildStaffNavigation(ctx.capabilities).map((e) => ({
    label: e.label,
    href: e.href,
    icon: e.icon,
  }));

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
