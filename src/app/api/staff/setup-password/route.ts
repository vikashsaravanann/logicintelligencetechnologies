import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
        { error: "Please verify your email address before setting a personal password." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    if (password.length < 12) {
      return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Password confirmation does not match." }, { status: 400 });
    }

    const { data: ws } = await supabaseAdmin
      .from("staff_workspaces")
      .select("id, owner_user_id, status")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: "No staff workspace found for this account." }, { status: 404 });
    }

    const { error: updErr } = await supabase.auth.updateUser({ password });
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    // Transition workspace to active
    const { error: statusErr } = await supabaseAdmin
      .from("staff_workspaces")
      .update({
        status: "active",
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ws.id)
      .eq("owner_user_id", user.id);

    if (statusErr) {
      console.error("[setup-password] status update failed:", statusErr.message);
      return NextResponse.json({ error: "Password updated but workspace activation failed." }, { status: 500 });
    }

    await supabaseAdmin.from("staff_workspace_events").insert({
      workspace_id: ws.id,
      actor_auth_id: user.id,
      target_user_id: user.id,
      event_key: "workspace.password_setup_completed",
      details: { previous_status: ws.status },
    });


    // Confirmation email (failure does not roll back password setup)
    try {
      const { data: emp } = await supabaseAdmin
        .from("staff_employees")
        .select("full_name, employee_code, email_normalized")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (emp?.email_normalized || user.email) {
        const { sendEmail } = await import("@/lib/email/send-email");
        const React = (await import("react")).default;
        const StaffPasswordChangedEmail = (await import("@/emails/staff-password-changed-email")).default;
        const eventId = crypto.randomUUID();
        await sendEmail({
          to: emp?.email_normalized || user.email!,
          subject: "Security Alert — Your LIT Staff Account Password Was Changed",
          from: "operations",
          category: "operational",
          templateKey: "staff-password-changed",
          eventType: "staff.password.changed",
          idempotencyKey: `staff-password-setup-${ws.id}-${eventId}`,
          react: React.createElement(StaffPasswordChangedEmail, {
            recipientName: emp?.full_name || user.email,
            recipientEmail: emp?.email_normalized || user.email!,
            employeeCode: emp?.employee_code,
            changedAt: new Date().toISOString(),
            eventReference: `SEC-SETUP-${eventId.slice(0, 8).toUpperCase()}`,
          }),
        });
      }
    } catch (emailErr: any) {
      console.error("[setup-password] confirmation email failed:", emailErr?.message);
    }

    return NextResponse.json({ success: true, redirectTo: "/staff/dashboard" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "SETUP_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
