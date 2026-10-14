import { NextRequest, NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/enterprise-checklist/invitations";
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_PHASES } from "@/data/enterpriseDeploymentChecklist";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { token } = await params;
    const result = await getInvitationByToken(token);

    if (result.state === "invalid" || !result.invitation) {
      return NextResponse.json({ error: "Invalid invitation link." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      state: result.state,
      invitation: result.invitation,
      response: result.response,
      phases: ENTERPRISE_PHASES,
      checkpoints: ENTERPRISE_CHECKPOINTS,
    });
  } catch (err) {
    console.error("[Checklist API] Error fetching invitation:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
