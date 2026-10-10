import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Client Profile Settings | Logic Intelligence Technologies",
  description: "Unified client account security, organization profile, and notification preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Client profile settings entry point.
 * Redirects to the canonical, unified profile management console at `/profile`.
 */
export default function ClientProfilePage() {
  redirect("/profile");
}
