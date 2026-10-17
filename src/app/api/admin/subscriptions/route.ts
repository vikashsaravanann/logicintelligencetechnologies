import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getSuperAdminCaller() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.is_anonymous || !user.email_confirmed_at) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super_admin") {
    return null;
  }

  return { userId: user.id, email: user.email ?? "", role: profile.role };
}

export async function GET(req: NextRequest) {
  const caller = await getSuperAdminCaller();
  if (!caller) {
    return NextResponse.json(
      { error: "FORBIDDEN: Verified Super Admin access required." },
      { status: 403 }
    );
  }

  try {
    const { data: orders } = await supabaseAdmin
      .from("maintenance_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: subscriptions } = await supabaseAdmin
      .from("maintenance_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: refundQueue } = await supabaseAdmin
      .from("maintenance_subscriptions")
      .select("*")
      .eq("plan_id", "FREE_TRIAL")
      .in("refund_status", ["pending", "processing", "manual_review_required"])
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      orders: orders || [],
      subscriptions: subscriptions || [],
      refundQueue: refundQueue || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
