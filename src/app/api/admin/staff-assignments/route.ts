import { NextResponse } from 'next/server';
import { requireCapabilityApi, getStaffSession } from '@/lib/auth/session';
import {
  createStaffClientAssignment,
  listStaffClientAssignments,
  type AssignmentRole,
} from '@/lib/support/staff-support';

export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') ?? undefined;
  const engagementId = searchParams.get('engagementId') ?? undefined;

  // Super Admin can list all assignments; staff can list only their own active assignments
  if (session.role === 'super_admin') {
    const staffUserId = searchParams.get('staffUserId') ?? undefined;
    const assignments = await listStaffClientAssignments({
      staffUserId,
      clientId,
      engagementId,
    });
    return NextResponse.json({ ok: true, assignments });
  }

  const assignments = await listStaffClientAssignments({
    staffUserId: session.userId,
    clientId,
    engagementId,
    onlyActive: true,
  });
  return NextResponse.json({ ok: true, assignments });
}

export async function POST(request: Request) {
  const auth = await requireCapabilityApi(request, 'support.assignment.manage');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      staffUserId,
      staffEmail,
      clientId,
      engagementId,
      assignmentRole,
      canViewTechnicalStages,
      canPrepareTechnicalQuotation,
      canPrepareInvoiceRequest,
      assignmentReason,
      expiresAt,
    } = body as {
      staffUserId?: string;
      staffEmail?: string;
      clientId?: string;
      engagementId?: string;
      assignmentRole?: AssignmentRole;
      canViewTechnicalStages?: boolean;
      canPrepareTechnicalQuotation?: boolean;
      canPrepareInvoiceRequest?: boolean;
      assignmentReason?: string;
      expiresAt?: string | null;
    };

    if (!staffUserId || !assignmentRole || !assignmentReason) {
      return NextResponse.json(
        {
          ok: false,
          error: 'staffUserId, assignmentRole, and assignmentReason are required.',
        },
        { status: 400 }
      );
    }

    const assignment = await createStaffClientAssignment({
      actorUserId: auth.session.userId,
      actorEmail: auth.session.email,
      actorRole: auth.session.role,
      staffUserId,
      staffEmail,
      clientId,
      engagementId,
      assignmentRole,
      canViewTechnicalStages,
      canPrepareTechnicalQuotation,
      canPrepareInvoiceRequest,
      assignmentReason,
      expiresAt,
    });

    return NextResponse.json({ ok: true, assignment }, { status: 201 });
  } catch (err) {
    let message = err instanceof Error ? err.message : 'Failed to create staff assignment.';
    if (/engagement_id_fkey|foreign key/i.test(message)) {
      message =
        'The selected project is not a valid client engagement. Create a real engagement before assigning staff.';
    }
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
