import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Client-portal data access. Every query runs with the signed-in user's own
 * Supabase session (never the service-role key) and is filtered to rows that
 * user owns, so RLS and the explicit filter both have to agree before a row is
 * shown. Any query error yields an empty list: the portal fails closed rather
 * than falling back to unscoped data.
 *
 * Every portal table links to its client through user_id. Records with no
 * user_id (not yet assigned to a client account) are shown to no one.
 */

type Row = Record<string, any>;

export interface PortalContext {
  supabase: SupabaseClient;
  user: User;
}

export async function getPortalContext(currentPath: string): Promise<PortalContext> {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  );
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  return { supabase, user: data.user };
}

export type PortalTable = "projects" | "invoices" | "support_tickets" | "client_files";

export async function listOwnRows(
  { supabase, user }: PortalContext,
  table: PortalTable,
  limit?: number,
): Promise<Row[]> {
  let query = supabase
    .from(table)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.warn(`[client-portal] ${table} unavailable:`, error.message);
    return [];
  }
  return data ?? [];
}

export async function getOwnRow(
  { supabase, user }: PortalContext,
  table: PortalTable,
  id: string,
): Promise<Row | null> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.warn(`[client-portal] ${table} lookup failed:`, error.message);
    return null;
  }
  return data;
}
