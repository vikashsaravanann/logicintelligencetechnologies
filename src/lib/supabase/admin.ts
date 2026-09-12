import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isAdminClientConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseServiceRoleKey) &&
    !supabaseUrl.includes("placeholder") &&
    supabaseServiceRoleKey !== "placeholder" &&
    supabaseServiceRoleKey !== "placeholder_key"
  );
}

export function createAdminClient() {
  if (!isAdminClientConfigured()) {
    console.warn("[supabase-admin] Service-role client is not configured. Writes will not persist.");
  }
  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseServiceRoleKey || "placeholder_key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const supabaseAdmin = createAdminClient();
