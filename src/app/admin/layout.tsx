import { ReactNode } from "react";
import { AdminShell } from "./components/AdminShell";
import { requireStaffPage } from "@/lib/auth/session";

export const metadata = {
  title: "Admin Command Center | Logic Intelligence Technologies",
  description: "Secure internal operations console for Logic Intelligence Technologies.",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side gate. Each page also declares its own capability (layouts do not
  // re-run on client navigation, so the per-page check is the real guard).
  const session = await requireStaffPage("/admin");

  return (
    <AdminShell role={session.role} email={session.email}>
      {children}
    </AdminShell>
  );
}
