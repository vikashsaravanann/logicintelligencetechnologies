/**
 * Staff Profile Service
 *
 * Manages employee personal profile details:
 * - 4:5 Portrait photo and avatar storage
 * - Bio, skills, work location, and emergency contacts
 * - Read-only official fields resolution (Employee Code, Department, Role)
 * - Notification preferences
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface StaffProfileData {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  employeeCode: string | null;
  department: string | null;
  jobTitle: string | null;
  employmentType: string | null;
  avatarUrl: string | null;
  portraitUrl: string | null; // 4:5 portrait photo
  bio: string | null;
  skills: string[];
  workLocation: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  timezone: string;
  notificationPreferences: {
    email: boolean;
    in_app: boolean;
    digest: "realtime" | "daily" | "weekly";
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStaffProfileInput {
  bio?: string;
  skills?: string[];
  workLocation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  timezone?: string;
  avatarUrl?: string;
  portraitUrl?: string;
  notificationPreferences?: {
    email?: boolean;
    in_app?: boolean;
    digest?: "realtime" | "daily" | "weekly";
  };
}

/**
 * Gets a staff member's complete profile.
 */
export async function getStaffProfile(userId: string): Promise<StaffProfileData> {
  // 1. Fetch user profile from public.profiles
  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (profErr || !profile) {
    throw new Error("NOT_FOUND: User profile not found.");
  }

  // 2. Fetch employee metadata from public.staff_employees
  const { data: employee } = await supabaseAdmin
    .from("staff_employees")
    .select("employee_code, department, job_title, employment_type")
    .eq("auth_user_id", userId)
    .maybeSingle();

  // 3. Fetch personal details from public.staff_profile_details
  const { data: details } = await supabaseAdmin
    .from("staff_profile_details")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    userId: profile.id,
    fullName: profile.full_name || "LIT Team Member",
    email: profile.email || "",
    role: profile.role || "staff",
    employeeCode: employee?.employee_code || null,
    department: employee?.department || null,
    jobTitle: employee?.job_title || null,
    employmentType: employee?.employment_type || "full_time",
    avatarUrl: details?.avatar_url || null,
    portraitUrl: details?.portrait_url || null,
    bio: details?.bio || null,
    skills: details?.skills || [],
    workLocation: details?.work_location || null,
    emergencyContactName: details?.emergency_contact_name || null,
    emergencyContactPhone: details?.emergency_contact_phone || null,
    timezone: details?.timezone || "Asia/Kolkata",
    notificationPreferences: details?.notification_preferences || {
      email: true,
      in_app: true,
      digest: "realtime",
    },
    createdAt: details?.created_at || new Date().toISOString(),
    updatedAt: details?.updated_at || new Date().toISOString(),
  };
}

/**
 * Updates staff profile details (editable fields only).
 */
export async function updateStaffProfile(
  targetUserId: string,
  callerUserId: string,
  isSuperAdmin: boolean,
  input: UpdateStaffProfileInput
): Promise<StaffProfileData> {
  if (targetUserId !== callerUserId && !isSuperAdmin) {
    throw new Error("FORBIDDEN: You cannot edit another employee's profile.");
  }

  // Upsert into staff_profile_details
  const updates: Record<string, any> = {
    user_id: targetUserId,
    updated_at: new Date().toISOString(),
  };

  if (input.bio !== undefined) updates.bio = input.bio.trim();
  if (input.skills !== undefined) updates.skills = input.skills.filter(Boolean);
  if (input.workLocation !== undefined) updates.work_location = input.workLocation.trim();
  if (input.emergencyContactName !== undefined) updates.emergency_contact_name = input.emergencyContactName.trim();
  if (input.emergencyContactPhone !== undefined) updates.emergency_contact_phone = input.emergencyContactPhone.trim();
  if (input.timezone !== undefined) updates.timezone = input.timezone.trim() || "Asia/Kolkata";
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;
  if (input.portraitUrl !== undefined) updates.portrait_url = input.portraitUrl;
  if (input.notificationPreferences !== undefined) {
    updates.notification_preferences = input.notificationPreferences;
  }

  const { error } = await supabaseAdmin
    .from("staff_profile_details")
    .upsert(updates, { onConflict: "user_id" });

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return getStaffProfile(targetUserId);
}
