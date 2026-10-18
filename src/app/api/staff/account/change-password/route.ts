import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import React from "react";
import StaffPasswordChangedEmail from "@/emails/staff-password-changed-email";

export const runtime = "nodejs";

function isStrongPassword(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (pw.length > 128) return "Password is too long.";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
    );

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user || user.is_anonymous) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Please verify your email before changing your password." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    const policyErr = isStrongPassword(newPassword);
    if (policyErr) {
      return NextResponse.json({ error: policyErr }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Password confirmation does not match." }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current password." },
        { status: 400 }
      );
    }

    // Confirm staff employee identity
    const { data: emp } = await supabaseAdmin
      .from("staff_employees")
      .select("full_name, employee_code, email_normalized, employment_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!emp) {
      return NextResponse.json({ error: "Staff employee record not found." }, { status: 403 });
    }
    if (emp.employment_status === "suspended" || emp.employment_status === "offboarded") {
      return NextResponse.json({ error: "Account is not eligible to change credentials." }, { status: 403 });
    }

    // Reauthenticate with current password via a short-lived client (does not replace session cookies)
    const verifyClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { error: reauthErr } = await verifyClient.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });
    if (reauthErr) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    // Update password on the authenticated session user
    const { error: updErr } = await supabase.auth.updateUser({ password: newPassword });
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    const eventId = crypto.randomUUID();
    const changedAt = new Date().toISOString();
    const eventReference = `SEC-${eventId.slice(0, 8).toUpperCase()}`;

    // Workspace event (no secrets)
    const { data: ws } = await supabaseAdmin
      .from("staff_workspaces")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (ws?.id) {
      await supabaseAdmin.from("staff_workspace_events").insert({
        workspace_id: ws.id,
        actor_auth_id: user.id,
        target_user_id: user.id,
        event_key: "staff.password.changed",
        details: {
          event_reference: eventReference,
          event_id: eventId,
          outcome: "succeeded",
        },
      });
    }

    // Queue confirmation email — failure does not roll back password change
    let emailQueued = false;
    try {
      const emailResult = await sendEmail({
        to: emp.email_normalized || user.email!,
        subject: "Security Alert — Your LIT Staff Account Password Was Changed",
        from: "operations",
        category: "operational",
        templateKey: "staff-password-changed",
        eventType: "staff.password.changed",
        idempotencyKey: `staff-password-changed-${eventId}`,
        react: React.createElement(StaffPasswordChangedEmail, {
          recipientName: emp.full_name,
          recipientEmail: emp.email_normalized || user.email!,
          employeeCode: emp.employee_code,
          changedAt,
          eventReference,
          supportUrl: "https://www.logicintelligencetechnologies.in/login?next=/staff/dashboard",
        }),
      });
      emailQueued = Boolean(emailResult?.success);
    } catch (emailErr: any) {
      console.error("[change-password] confirmation email failed:", emailErr?.message);
    }

    return NextResponse.json({
      success: true,
      eventReference,
      emailQueued,
      message: emailQueued
        ? "Password updated successfully. Your security notification has been queued."
        : "Password updated successfully. Confirmation email could not be queued; contact support if you did not request this change.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CHANGE_PASSWORD_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
