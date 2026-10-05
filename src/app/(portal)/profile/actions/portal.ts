"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { Database } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function getUserPortalData() {
  const cookieStore = await cookies();
  const supabase = createServerActionClient<Database>(
    { cookies: () => cookieStore as any },
    {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous || !user.email_confirmed_at) return null;

  const [
    { data: projects },
    { data: invoices },
    { data: supportTickets },
    { data: clientFiles },
    { data: onboarding },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("client_files").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("onboarding_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return {
    projects: projects || [],
    invoices: invoices || [],
    supportTickets: supportTickets || [],
    clientFiles: clientFiles || [],
    onboarding: onboarding || [],
    user,
  };
}

export async function createSupportTicket(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerActionClient<Database>(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous || !user.email_confirmed_at) return { success: false, error: "Not authenticated" };

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (typeof subject !== "string" || typeof message !== "string" || !subject.trim() || !message.trim() || subject.length > 200 || message.length > 10000) return { success: false, error: "Invalid ticket fields" };

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject,
      message,
      status: "Open"
    } as any);

    if (error) throw error;
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Failed to create ticket" };
  }
}

export async function submitOnboardingForm(answers: any) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerActionClient<Database>(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous || !user.email_confirmed_at) return { success: false, error: "Not authenticated" };
    if (!answers || typeof answers !== "object" || Array.isArray(answers) || Buffer.byteLength(JSON.stringify(answers)) > 32768) return { success: false, error: "Invalid onboarding answers" };

    const { error } = await supabase.from("onboarding_submissions").insert({
      user_id: user.id,
      answers_json: answers,
      status: "Submitted"
    } as any);

    if (error) throw error;
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Failed to submit form" };
  }
}

export async function saveClientFileMetadata(fileName: string, filePath: string, size: number) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerActionClient<Database>(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous || !user.email_confirmed_at) return { success: false, error: "Not authenticated" };
    if (typeof fileName !== "string" || !fileName || fileName.length > 255 ||
        typeof filePath !== "string" || !filePath.startsWith(`${user.id}/`) ||
        filePath.split("/").includes("..") || !Number.isInteger(size) || size < 1 || size > 10 * 1024 * 1024) {
      return { success: false, error: "Invalid file metadata" };
    }

    const { error } = await supabase.from("client_files").insert({
      user_id: user.id,
      file_name: fileName,
      file_path: filePath,
      size
    } as any);

    if (error) throw error;
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Failed to save file metadata" };
  }
}
