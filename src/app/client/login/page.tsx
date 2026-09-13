import { redirect } from "next/navigation";

/**
 * Legacy client login route.
 * Redirects to canonical unified /login route with next=/client/dashboard.
 */
export default function ClientLoginPage() {
  redirect("/login?next=/client/dashboard");
}
