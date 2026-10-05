import { ReactNode } from "react";
import { AdminNav } from "./components/AdminNav";
import { requireAdminPage } from "@/lib/auth/require-admin";

export const metadata = {
  title: "Admin Command Center | Logic Intelligence Technologies",
  description: "Secure internal operations console for Logic Intelligence Technologies.",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side gate; the middleware check alone is not relied on.
  await requireAdminPage("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      <AdminNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
