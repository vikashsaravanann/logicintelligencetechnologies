import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Client Portal Login | Logic Intelligence Technologies",
  description: "Secure gateway to the Logic Intelligence Technologies client workspace.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ ref?: string; next?: string }>;
};

/**
 * Client Portal Login Gateway (Page 071).
 * Authenticated clients are routed immediately to their dedicated workspace.
 * Unauthenticated clients are routed to /login with portal destination preserved.
 */
export default async function ClientLoginPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  let destination = "/client/dashboard";
  if (sp.next) {
    destination = sp.next;
  } else if (sp.ref) {
    destination = `/client/dashboard?ref=${encodeURIComponent(sp.ref)}`;
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );
    const { data } = await supabase.auth.getUser();
    if (data?.user && !data.user.is_anonymous && data.user.email_confirmed_at) {
      redirect(destination);
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
  }

  redirect(`/login?next=${encodeURIComponent(destination)}`);
}
