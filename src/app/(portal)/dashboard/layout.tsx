import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/auth/require-admin";
import DashboardShell from "./dashboard-shell";

/** Server-side gate for the internal dashboard; the middleware check alone is not relied on. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdminPage("/dashboard");
  return <DashboardShell>{children}</DashboardShell>;
}
