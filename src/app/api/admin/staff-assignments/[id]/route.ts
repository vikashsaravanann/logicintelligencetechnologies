import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  updateStaffClientAssignment,
  type AssignmentStatus,
} from '@/lib/support/staff-support';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'support.assignment.manage');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      status,
      expiresAt,
      canViewTechnicalStages,
      canPrepareTechnicalQuotation,
      canPrepareInvoiceRequest,
    } = body as {
      status?: AssignmentStatus;
      expiresAt?: string | null;
      canViewTechnicalStages?: boolean;
      canPrepareTechnicalQuotation?: boolean;
      canPrepareInvoiceRequest?: boolean;
    };

    const assignment = await updateStaffClientAssignment({
      actorUserId: auth.session.userId,
      actorEmail: auth.session.email,
      actorRole: auth.session.role,
      assignmentId: id,
      status,
      expiresAt,
      canViewTechnicalStages,
      canPrepareTechnicalQuotation,
      canPrepareInvoiceRequest,
    });

    return NextResponse.json({ ok: true, assignment });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update staff assignment.';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
