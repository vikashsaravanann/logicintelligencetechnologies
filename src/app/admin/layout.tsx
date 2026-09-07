import { ReactNode } from "react";
import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Portal | Logic Intelligence",
  description: "Secure admin dashboard for Logic Intelligence.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            <span className="text-lg font-semibold tracking-tight">Admin Portal</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin" className="text-neutral-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/ai-leads" className="text-neutral-300 hover:text-white transition-colors">
              AI leads
            </Link>
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
              Exit to Site
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
