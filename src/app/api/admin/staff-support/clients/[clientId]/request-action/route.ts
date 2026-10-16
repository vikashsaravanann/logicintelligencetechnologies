import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  assertNeverClientImpersonation,
  createStaffSupportActionRequest,
} from '@/lib/support/staff-support';

export async function POST(
  request: Request,
  context: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireCapabilityApi(request, 'support.assigned_client.assist');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const body = await request.json().catch(() => ({}));

  const impersonationCheck = assertNeverClientImpersonation({
    actorUserId: auth.session.userId,
    actorRole: auth.session.role,
    requestedActorRole: body.actorRole ?? null,
    impersonateClientId: body.impersonateClientId ?? null,
  });
  if (!impersonationCheck.ok) {
    return NextResponse.json(
      { ok: false, error: impersonationCheck.message },
      { status: impersonationCheck.status }
    );
  }

  const allowedTypes = [
    'stage_review',
    'identity_correction_escalation',
    'technical_clarification',
    'commercial_escalation',
  ] as const;

  const requestType = allowedTypes.includes(body.requestType)
    ? body.requestType
    : 'technical_clarification';

  const result = await createStaffSupportActionRequest({
    staffUserId: auth.session.userId,
    staffEmail: auth.session.email,
    staffRole: auth.session.role,
    clientId,
    requestType,
    stageKey: body.stageKey ?? null,
    summary: typeof body.summary === 'string' ? body.summary : '',
    route: `/api/admin/staff-support/clients/${clientId}/request-action`,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, request: result.request }, { status: 201 });
}
