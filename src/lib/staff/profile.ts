import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ProfileDetails = {
  user_id: string;
  portrait_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: unknown;
  work_location: string | null;
  timezone: string | null;
  display_name: string | null;
  personal_email: string | null;
  mobile_e164: string | null;
  professional_headline: string | null;
  professional_summary: string | null;
  career_objective: string | null;
  professional_interests: string | null;
  work_arrangement: string | null;
  resume_section_prefs: Record<string, boolean> | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
};

/** Allowlisted self-service profile detail fields only */
export const PROFILE_DETAIL_ALLOWLIST = [
  "bio",
  "work_location",
  "timezone",
  "display_name",
  "personal_email",
  "mobile_e164",
  "professional_headline",
  "professional_summary",
  "career_objective",
  "professional_interests",
  "work_arrangement",
  "resume_section_prefs",
  "emergency_contact_name",
  "emergency_contact_phone",
  "emergency_contact_relationship",
] as const;

export type ProfileDetailKey = (typeof PROFILE_DETAIL_ALLOWLIST)[number];

export const FORBIDDEN_SELF_FIELDS = [
  "employee_code",
  "email_normalized",
  "department",
  "job_title",
  "role",
  "employment_status",
  "auth_user_id",
] as const;

export async function getStaffProfileBundle(userId: string) {
  const [{ data: emp }, { data: details }, { data: entries }] = await Promise.all([
    supabaseAdmin
      .from("staff_employees")
      .select(
        "auth_user_id, full_name, employee_code, email_normalized, department, job_title, employment_status, phone_e164"
      )
      .eq("auth_user_id", userId)
      .maybeSingle(),
    supabaseAdmin.from("staff_profile_details").select("*").eq("user_id", userId).maybeSingle(),
    supabaseAdmin
      .from("staff_profile_entries")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  return { employee: emp, details, entries: entries || [] };
}

export function filterAllowlistedProfilePatch(body: Record<string, unknown>) {
  const forbiddenHit = FORBIDDEN_SELF_FIELDS.filter((k) => k in body);
  const patch: Record<string, unknown> = {};
  for (const key of PROFILE_DETAIL_ALLOWLIST) {
    if (key in body) patch[key] = body[key];
  }
  return { patch, forbiddenHit };
}

export async function upsertProfileDetails(
  userId: string,
  patch: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  if (Object.keys(patch).length === 0) return { ok: true };

  const { data: existing } = await supabaseAdmin
    .from("staff_profile_details")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  const payload = {
    ...patch,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabaseAdmin
      .from("staff_profile_details")
      .update(payload)
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabaseAdmin.from("staff_profile_details").insert(payload);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function updateLegalName(userId: string, fullName: string) {
  const name = fullName.trim();
  if (name.length < 2 || name.length > 120) {
    return { ok: false as const, error: "Full legal name must be 2–120 characters." };
  }
  const { data: before } = await supabaseAdmin
    .from("staff_employees")
    .select("full_name")
    .eq("auth_user_id", userId)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("staff_employees")
    .update({ full_name: name, updated_at: new Date().toISOString() })
    .eq("auth_user_id", userId);
  if (error) return { ok: false as const, error: error.message };

  await supabaseAdmin.from("staff_profile_change_events").insert({
    user_id: userId,
    actor_user_id: userId,
    field_key: "full_name",
    old_value: before?.full_name || null,
    new_value: name,
  });

  return { ok: true as const };
}
