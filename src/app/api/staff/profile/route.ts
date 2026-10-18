import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/session";
import {
  filterAllowlistedProfilePatch,
  getStaffProfileBundle,
  updateLegalName,
  upsertProfileDetails,
} from "@/lib/staff/profile";

export const runtime = "nodejs";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const bundle = await getStaffProfileBundle(session.userId);
  return NextResponse.json({ ok: true, ...bundle, role: session.role });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getStaffSession();
    if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { patch, forbiddenHit } = filterAllowlistedProfilePatch(body);

    if (forbiddenHit.length > 0) {
      return NextResponse.json(
        {
          error: "Company-controlled fields cannot be modified from My Profile.",
          forbiddenFields: forbiddenHit,
        },
        { status: 403 }
      );
    }

    if (typeof body.full_name === "string") {
      const nameRes = await updateLegalName(session.userId, body.full_name);
      if (!nameRes.ok) return NextResponse.json({ error: nameRes.error }, { status: 400 });
    }

    const detailRes = await upsertProfileDetails(session.userId, patch);
    if (!detailRes.ok) return NextResponse.json({ error: detailRes.error }, { status: 500 });

    const bundle = await getStaffProfileBundle(session.userId);
    return NextResponse.json({ ok: true, message: "Your profile information has been saved successfully.", ...bundle });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UPDATE_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
