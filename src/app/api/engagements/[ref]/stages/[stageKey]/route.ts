import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
  submitStageAction,
} from '@/lib/engagements/db';
import { StageKey, ORDERED_STAGE_KEYS } from '@/lib/engagements/types';
import { getStaffSession, requireCapabilityApi } from '@/lib/auth/session';
import { hasCapability } from '@/config/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const { action, payload, actorId, actorRole } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Stage action name is required.' },
        { status: 400 }
      );
    }

    // Server-derived actor role: check staff session.
    // Policy 2: Staff cannot impersonate a client or submit client-only signatures/utr/acceptance actions as 'client'.
    const staff = await getStaffSession();
    if (staff) {
      if (actorRole === 'client') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Client impersonation is strictly forbidden by LIT corporate security policy. Staff cannot submit stage actions as a client.',
          },
          { status: 403 }
        );
      }
      const adminStageOverrideActions = ['admin_approve_stage', 'admin_override_status', 'admin_unlock_stage'];
      if (
        adminStageOverrideActions.includes(action) &&
        !hasCapability(staff.role, 'engagement.stage.approve')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Only Super Admin may approve or override engagement stages.',
          },
          { status: 403 }
        );
      }
    }

    const isStaff = Boolean(staff && hasCapability(staff.role, 'clients.write'));
    const verifiedActorRole = isStaff ? 'admin' : 'client';
    const verifiedActorId = isStaff
      ? (staff?.email || staff?.userId)
      : (actorId ? String(actorId) : undefined);

    const result = await submitStageAction({
      engagementRef: ref,
      stageKey,
      action,
      payload: payload || {},
      actorRole: verifiedActorRole,
      actorId: verifiedActorId,
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ ref: string; stageKey: string }> | { ref: string; stageKey: string } }
) {
  try {
    // Policy 1 & 2: Stage approval and status overrides strictly require 'engagement.stage.approve' (Super Admin only)
    const auth = await requireCapabilityApi(req, 'engagement.stage.approve');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

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
    const { status, action = 'admin_override_status', notes, unlockNext = true } = body;

    if (!status && !action) {
      return NextResponse.json(
        { success: false, error: 'Either status or action must be provided.' },
        { status: 400 }
      );
    }

    // Invariant: Payment stages cannot be verified via generic override
    if (stageKey === 'initial-invoice' || stageKey === 'final-payment') {
      const targetStatus = status || (action === 'admin_approve_stage' ? 'verified' : null);
      if (['paid', 'verified', 'approved'].includes(targetStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Payment stages (${stageKey}) cannot be marked verified via generic status override. Reconcile bank credit via /api/admin/payments/reconcile.`,
          },
          { status: 400 }
        );
      }
    }

    const verifiedActorId = auth.session.email || auth.session.userId || 'admin';

    const result = await submitStageAction({
      engagementRef: ref,
      stageKey,
      action,
      payload: { status, notes, unlockNext },
      actorRole: 'admin',
      actorId: verifiedActorId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          stageKey,
          status: result.status,
          error: result.error || 'Failed to update stage status',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('[API PATCH /api/engagements/[ref]/stages/[stageKey]] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error while updating stage';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
