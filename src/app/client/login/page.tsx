import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal Login | Logic Intelligence Technologies",
  description: "Secure gateway to the Logic Intelligence Technologies client workspace.",
  robots: { index: false, follow: false },
};

/**
 * Client Portal Login Gateway (Page 071).
 * Canonical redirect to unified secure login route with portal dashboard destination.
 */
export default function ClientLoginPage() {
  redirect("/login?next=/client/dashboard");
}
