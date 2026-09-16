import { ReactNode } from "react";
import { AdminNav } from "./components/AdminNav";

export const metadata = {
  title: "Admin Command Center | Logic Intelligence Technologies",
  description: "Secure internal operations console for Logic Intelligence Technologies.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      <AdminNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
