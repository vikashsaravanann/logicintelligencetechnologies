import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal Login | Logic Intelligence Technologies",
  description: "Secure gateway to the Logic Intelligence Technologies client workspace.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams?: Promise<{ ref?: string; next?: string }>;
};

/**
 * Client Portal Login Gateway (Page 071).
 * Canonical redirect to unified secure login route with portal dashboard destination.
 */
export default async function ClientLoginPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  let destination = "/client/dashboard";
  if (sp.next) {
    destination = sp.next;
  } else if (sp.ref) {
    destination = `/client/dashboard?ref=${encodeURIComponent(sp.ref)}`;
  }
  redirect(`/login?next=${encodeURIComponent(destination)}`);
}
