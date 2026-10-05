import { redirect } from "next/navigation";
import { ADMIN_DASHBOARD_PATH } from "@/config/admin-nav";

/** Canonical admin entry → Command Center */
export default function AdminIndexPage() {
  redirect(ADMIN_DASHBOARD_PATH);
}
