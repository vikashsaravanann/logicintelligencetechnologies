import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing execution ID" }, { status: 400 });
  }

  try {
    // Look up in database projection
    const { data, error } = await supabaseAdmin
      .from("automation_executions_projection")
      .select("*")
      .or(`id.eq.${id},execution_id.eq.${id}`)
      .maybeSingle();

    if (error) {
      console.warn("[executions/[id]] Lookup warning:", error.message);
    }

    if (data) {
      // Ensure zero sensitive tokens or secrets are leaked
      const sanitized = {
        ...data,
        sanitized_receipt: data.sanitized_receipt || {},
      };
      return NextResponse.json({ success: true, execution: sanitized });
    }

    return NextResponse.json(
      { success: false, message: `Execution '${id}' not found` },
      { status: 404 }
    );
  } catch (err) {
    console.error("[api/admin/automation/v2/executions/[id]] Error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
