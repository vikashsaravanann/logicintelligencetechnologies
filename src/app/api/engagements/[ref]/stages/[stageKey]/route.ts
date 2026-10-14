import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
  submitStageAction,
} from '@/lib/engagements/db';
import { StageKey, ORDERED_STAGE_KEYS } from '@/lib/engagements/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ ref: string; stageKey: string }> | { ref: string; stageKey: string } }
) {
  try {
    const params = await context.params;
    const ref = params?.ref;
    const stageKey = params?.stageKey as StageKey;

    if (!ref || !stageKey) {
      return NextResponse.json(
        { success: false, error: 'Engagement reference and stage key are required.' },
        { status: 400 }
      );
    }

    if (!ORDERED_STAGE_KEYS.includes(stageKey)) {
      return NextResponse.json(
        { success: false, error: `Invalid stage key: ${stageKey}` },
        { status: 400 }
      );
    }

    const engagement = await getEngagementByRef(ref);
    if (!engagement) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found or unauthorized.' },
        { status: 404 }
      );
    }

    const stage = await getStageByKey(engagement.id, stageKey);
    const docs = await getEngagementDocumentLinks(engagement.id, stageKey);

    return NextResponse.json({
      success: true,
      stage,
      docs,
      engagementRef: engagement.engagement_ref,
      companyName: engagement.company_name,
    });
  } catch (err: unknown) {
    console.error('[API GET /api/engagements/[ref]/stages/[stageKey]] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch stage details';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ref: string; stageKey: string }> | { ref: string; stageKey: string } }
) {
  try {
    const params = await context.params;
    const ref = params?.ref;
    const stageKey = params?.stageKey as StageKey;

    if (!ref || !stageKey) {
      return NextResponse.json(
        { success: false, error: 'Engagement reference and stage key are required.' },
        { status: 400 }
      );
    }

    if (!ORDERED_STAGE_KEYS.includes(stageKey)) {
      return NextResponse.json(
        { success: false, error: `Invalid stage key: ${stageKey}` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, payload, actorRole, actorId } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Stage action name is required.' },
        { status: 400 }
      );
    }

    const result = await submitStageAction({
      engagementRef: ref,
      stageKey,
      action,
      payload: payload || {},
      actorRole: actorRole || 'client',
      actorId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          stageKey,
          status: result.status,
          error: result.error || 'Stage action could not be executed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('[API POST /api/engagements/[ref]/stages/[stageKey]] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error while executing stage action';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
