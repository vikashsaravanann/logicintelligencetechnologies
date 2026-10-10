import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ADMIN_DASHBOARD_PATH } from "@/config/admin-nav";

type Props = {
  href?: string;
  label?: string;
};

/** Consistent back navigation for nested admin pages */
export function AdminBackLink({
  href = ADMIN_DASHBOARD_PATH,
  label = "Admin Dashboard",
}: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white border border-transparent hover:border-[var(--lit-border-light,#DFE7EF)] shadow-2xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
