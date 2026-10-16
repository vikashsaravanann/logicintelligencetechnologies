import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  addStaffSupportNote,
  assertNeverClientImpersonation,
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

  const result = await addStaffSupportNote({
    staffUserId: auth.session.userId,
    staffEmail: auth.session.email,
    staffRole: auth.session.role,
    clientId,
    stageKey: body.stageKey ?? null,
    note: typeof body.note === 'string' ? body.note : '',
    route: `/api/admin/staff-support/clients/${clientId}/notes`,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, note: result.note }, { status: 201 });
}
