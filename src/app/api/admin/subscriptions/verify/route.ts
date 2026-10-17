import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { verifyMaintenanceOrderAndActivate } from "@/lib/subscriptions/service";

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

export async function POST(req: NextRequest) {
  const caller = await getSuperAdminCaller();
  if (!caller) {
    return NextResponse.json(
      { error: "FORBIDDEN: Verified Super Admin access required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { orderId, bankReconciliationRef, notes } = body;

    if (!orderId || !bankReconciliationRef) {
      return NextResponse.json(
        { error: "Missing required parameters: orderId and bankReconciliationRef are mandatory." },
        { status: 400 }
      );
    }

    const result = await verifyMaintenanceOrderAndActivate({
      orderId,
      adminUserId: caller.userId,
      bankReconciliationRef,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Order verified and subscription activated successfully.",
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
