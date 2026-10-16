import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  assertNeverClientImpersonation,
  getRedactedStaffSupportContext,
} from '@/lib/support/staff-support';

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireCapabilityApi(request, 'support.assigned_client.read');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const { searchParams } = new URL(request.url);
  const impersonate = searchParams.get('impersonate') ?? searchParams.get('asClient');

  const impersonationCheck = assertNeverClientImpersonation({
    actorUserId: auth.session.userId,
    actorRole: auth.session.role,
    requestedActorRole: searchParams.get('actorRole'),
    impersonateClientId: impersonate,
  });
  if (!impersonationCheck.ok) {
    return NextResponse.json(
      { ok: false, error: impersonationCheck.message },
      { status: impersonationCheck.status }
    );
  }

  const result = await getRedactedStaffSupportContext({
    staffUserId: auth.session.userId,
    staffEmail: auth.session.email,
    staffRole: auth.session.role,
    clientId,
    engagementId: searchParams.get('engagementId'),
    reason: searchParams.get('reason'),
    route: `/api/admin/staff-support/clients/${clientId}`,
    ipAddress: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, supportContext: result.data });
}
