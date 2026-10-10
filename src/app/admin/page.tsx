import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_DASHBOARD_PATH } from "@/config/admin-nav";

export const metadata: Metadata = {
  title: "Admin Command Center | Gateway",
  description: "Internal operations gateway and command center redirect for Logic Intelligence Technologies staff.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Canonical admin entry point.
 * Redirects authenticated staff to the executive command center.
 */
export default function AdminIndexPage() {
  redirect(ADMIN_DASHBOARD_PATH);
}
