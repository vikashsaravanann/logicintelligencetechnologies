import { ReactNode } from "react";
import { Shield } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "./components/AdminNav";

export const metadata = {
  title: "Admin Command Center | Logic Intelligence",
  description: "Secure admin dashboard for Logic Intelligence.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md relative">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <Link href="/admin/command-center" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
            <Shield className="h-6 w-6 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight truncate hidden sm:block leading-tight">Logic Intelligence</span>
              <span className="text-[10px] sm:text-xs text-neutral-400 font-semibold tracking-wider uppercase leading-tight">Admin Command Center</span>
            </div>
          </Link>
          <AdminNav />
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
