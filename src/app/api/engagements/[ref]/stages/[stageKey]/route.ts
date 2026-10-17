import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
  submitStageAction,
} from '@/lib/engagements/db';
import { StageKey, ORDERED_STAGE_KEYS } from '@/lib/engagements/types';
import { getStaffSession, requireCapabilityApi } from '@/lib/auth/session';
import { getVerifiedClientUser } from '@/lib/auth/client-auth';
import { assertClientEngagementAccess } from '@/lib/auth/client-identity';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasCapability } from '@/config/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
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

    const engagement = await getEngagementByRef(ref);
    if (!engagement) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found or unauthorized.' },
        { status: 404 }
      );
    }

    // Verify caller authorization: superadmin, assigned staff, verified client owner, or authorized bearer token
    let isAuthorized = false;
    const staff = await getStaffSession();
    if (staff) {
      if (staff.role === 'super_admin') {
        isAuthorized = true;
      } else {
        const { data: assignment } = await supabaseAdmin
          .from('staff_client_assignments')
          .select('id, status, expires_at, can_view_technical_stages')
          .eq('staff_user_id', staff.userId)
          .eq('engagement_id', engagement.id)
          .eq('status', 'active')
          .maybeSingle();

        if (assignment && (!assignment.expires_at || new Date(assignment.expires_at).getTime() > Date.now())) {
          isAuthorized = true;
        }
      }
    } else {
      const client = await getVerifiedClientUser();
      if (client) {
        const hasAccess = await assertClientEngagementAccess(client.user.id, engagement.id);
        if (hasAccess || (engagement.contact_email && engagement.contact_email.toLowerCase() === client.email)) {
          isAuthorized = true;
        }
      } else {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace(/^Bearer\s+/i, '') || new URL(req.url).searchParams.get('token');
        if (token && (engagement.metadata?.secure_token === token || (engagement as any).secure_token === token)) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication or valid bearer token required to view stage details.' },
        { status: 401 }
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

    const engagement = await getEngagementByRef(ref);
    if (!engagement) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found or unauthorized.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, payload, actorRole } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Stage action name is required.' },
        { status: 400 }
      );
    }

    // Resolve authenticated caller strictly server-side
    const staff = await getStaffSession();
    const verifiedClient = !staff ? await getVerifiedClientUser() : null;

    if (!staff && !verifiedClient) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to submit stage actions.' },
        { status: 401 }
      );
    }

    let verifiedActorRole: 'client' | 'admin' = 'client';
    let verifiedActorId: string = '';
    const sanitizedPayload = { ...(payload || {}) };

    if (verifiedClient) {
      const hasAccess =
        (await assertClientEngagementAccess(verifiedClient.user.id, engagement.id)) ||
        (engagement.contact_email && engagement.contact_email.toLowerCase() === verifiedClient.email);

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You do not have ownership access to this engagement.' },
          { status: 403 }
        );
      }

      // Reject administrative actions invoked by clients
      const adminActions = [
        'admin_approve_stage',
        'admin_override_status',
        'admin_unlock_stage',
        'approve_stage',
        'verify_bank_credit',
      ];
      if (adminActions.includes(action)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Client session cannot execute administrative actions.' },
          { status: 403 }
        );
      }

      // Disallow arbitrary payload.status state jumps attempted by clients
      delete sanitizedPayload.status;

      verifiedActorRole = 'client';
      verifiedActorId = verifiedClient.email;
    } else if (staff) {
      // Check staff assignment to engagement
      if (staff.role !== 'super_admin') {
        const { data: assignment } = await supabaseAdmin
          .from('staff_client_assignments')
          .select('id, status, expires_at, can_view_technical_stages')
          .eq('staff_user_id', staff.userId)
          .eq('engagement_id', engagement.id)
          .eq('status', 'active')
          .maybeSingle();

        if (!assignment || (assignment.expires_at && new Date(assignment.expires_at).getTime() <= Date.now())) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Staff member is not assigned to this engagement or assignment has expired.' },
            { status: 403 }
          );
        }
      }

      // Policy 2: Staff cannot impersonate a client or submit client-only signatures/acceptance actions as 'client'
      const clientOnlyActions = [
        'client_accept',
        'client_sign_contract',
        'client_accept_quote',
        'confirm_handover_acceptance',
        'submit_billing_details',
        'report_payment_utr',
      ];
      if (actorRole === 'client' || clientOnlyActions.includes(action)) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Client impersonation is strictly forbidden by LIT corporate security policy. Staff cannot submit stage actions as a client.',
          },
          { status: 403 }
        );
      }

      const adminStageOverrideActions = [
        'admin_approve_stage',
        'admin_override_status',
        'admin_unlock_stage',
        'approve_stage',
        'verify_bank_credit',
      ];
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

      // Invariant: Payment stages cannot be verified via generic stage action
      if (stageKey === 'initial-invoice' || stageKey === 'final-payment') {
        if (
          action === 'verify_bank_credit' ||
          action === 'admin_approve_stage' ||
          action === 'approve_stage' ||
          ['paid', 'verified', 'approved'].includes(sanitizedPayload.status)
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Payment stages (${stageKey}) cannot be marked verified via generic stage action. Reconcile bank credit via /api/admin/payments/reconcile.`,
            },
            { status: 400 }
          );
        }
      }

      verifiedActorRole = 'admin';
      verifiedActorId = staff.email || staff.userId;
    }

    const result = await submitStageAction({
      engagementRef: ref,
      stageKey,
      action,
      payload: sanitizedPayload,
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
