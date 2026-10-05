import "server-only";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

export interface Viewer {
  email: string;
  name: string;
}

/**
 * The signed-in visitor for server components, or null for anonymous visitors
 * (and whenever auth is unavailable). Uses getUser(), which validates the token.
 */
export async function getViewer(): Promise<Viewer | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    );
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const name = [meta.full_name, meta.name].find((v): v is string => typeof v === "string" && v.trim().length > 0);
    return { email: data.user.email, name: name?.trim() ?? "" };
  } catch {
    return null;
  }
}
