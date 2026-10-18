import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import { buildResumeDto } from "@/lib/staff/resume-data";
import { generateStaffResumePdf, resumeFilename } from "@/lib/pdf/staff-resume-generator";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Ensure active staff workspace (or super_admin)
    if (session.role !== "super_admin") {
      const { data: ws } = await supabaseAdmin
        .from("staff_workspaces")
        .select("id, status")
        .eq("owner_user_id", session.userId)
        .maybeSingle();
      if (!ws || ws.status === "suspended" || ws.status === "revoked") {
        return NextResponse.json({ error: "NO_ACTIVE_WORKSPACE" }, { status: 403 });
      }
    }

    const dto = await buildResumeDto(session.userId);
    if (!dto.fullName || dto.fullName === "Staff Member") {
      // still allow export if they have any content
    }

    const bytes = await generateStaffResumePdf(dto);
    const filename = resumeFilename(dto.fullName);
    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "RESUME_GENERATION_FAILED";
    console.error("[staff/resume]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
