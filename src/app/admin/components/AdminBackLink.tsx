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
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}
