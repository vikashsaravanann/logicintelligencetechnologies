import { redirect } from "next/navigation";

/**
 * Legacy client profile route.
 * Redirects permanently to canonical unified /profile route.
 */
export default function ClientProfilePage() {
  redirect("/profile");
}
