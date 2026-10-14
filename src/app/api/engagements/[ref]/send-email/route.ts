import { NextRequest, NextResponse } from 'next/server';
import { sendEngagementInvitationEmail } from '@/lib/engagements/invitations';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ref: string }> | { ref: string } }
) {
  try {
    const params = await context.params;
    const ref = params?.ref;

    if (!ref) {
      return NextResponse.json(
        { ok: false, message: 'Engagement reference is required.' },
        { status: 400 }
      );
    }

    let customMessage: string | undefined;
    try {
      const body = await req.json();
      if (body?.customMessage && typeof body.customMessage === 'string') {
        customMessage = body.customMessage.trim();
      }
    } catch {
      // Body may be empty if no custom note provided
    }

    const result = await sendEngagementInvitationEmail(ref, customMessage);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
    });
  } catch (err: unknown) {
    console.error('[API /api/engagements/[ref]/send-email] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to dispatch email';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
