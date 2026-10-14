import { NextRequest, NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/enterprise-checklist/invitations";
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_PHASES } from "@/data/enterpriseDeploymentChecklist";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: Props
) {
  try {
    const { token } = await params;
    const result = await getInvitationByToken(token);

    if (result.state === "invalid" || !result.invitation) {
      return NextResponse.json(
        { ok: false, state: "invalid", error: "Checklist invitation not found or link is invalid." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      state: result.state,
      invitation: result.invitation,
      response: result.response,
      checkpoints: ENTERPRISE_CHECKPOINTS,
      phases: ENTERPRISE_PHASES,
    });
  } catch (error: any) {
    console.error("[EnterpriseChecklist API] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred while loading the checklist." },
      { status: 500 }
    );
  }
}
