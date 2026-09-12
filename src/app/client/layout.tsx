import Link from "next/link";
import { LayoutDashboard, Briefcase, FileText, Receipt, MessageSquare, HelpCircle, User, ShieldCheck, LogOut } from "lucide-react";
import { COMPANY } from "@/config/company";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/client/projects", icon: Briefcase },
  { label: "Documents Vault", href: "/client/documents", icon: FileText },
  { label: "Invoices & Billing", href: "/client/invoices", icon: Receipt },
  { label: "Messages", href: "/client/messages", icon: MessageSquare },
  { label: "Support Tickets", href: "/client/support", icon: HelpCircle },
  { label: "Profile", href: "/client/profile", icon: User },
];

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060B18] text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-white/10 bg-neutral-950/80 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#060B18] rounded-[10px] flex items-center justify-center font-black text-xs text-white">
                LIT
              </div>
            </div>
            <div>
              <span className="text-xs font-black tracking-widest text-white block uppercase">
                Client Portal
              </span>
              <span className="text-[9px] text-primary tracking-wider uppercase block">
                Enterprise Workspace
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Status */}
        <div className="pt-6 border-t border-white/5 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-400 font-semibold">Tenant Isolated</span>
          </div>
          <p>© {new Date().getFullYear()} {COMPANY.displayName}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
