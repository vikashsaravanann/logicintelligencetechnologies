import { NextRequest, NextResponse } from 'next/server';
import { createClientCorrectionRequest } from '@/lib/subscriptions/service';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getVerifiedClientUser } from '@/lib/auth/client-auth';
import { getStaffSession } from '@/lib/auth/session';
import { assertClientEngagementAccess, resolveClientIdentity } from '@/lib/auth/client-identity';

export async function POST(req: NextRequest) {
  try {
    // AUTH08: Reject unauthenticated requests strictly; derive identity server-side
    const staff = await getStaffSession();
    const verifiedClient = !staff ? await getVerifiedClientUser() : null;

    if (!staff && !verifiedClient) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to submit correction requests' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      engagementId,
      stageNumber,
      documentRef,
      affectedField,
      previousValue,
      requestedValue,
      explanation,
      supportingEvidenceUrl,
    } = body;

    if (!engagementId || !affectedField || !requestedValue || !explanation) {
      return NextResponse.json(
        { error: 'Missing required parameters: engagementId, affectedField, requestedValue, and explanation are required.' },
        { status: 400 }
      );
    }

    // Verify engagement ownership relationship
    let resolvedClientId: string;

    if (verifiedClient) {
      const clientContext = await resolveClientIdentity(verifiedClient.user.id);
      const hasAccess =
        (await assertClientEngagementAccess(verifiedClient.user.id, engagementId)) ||
        clientContext.engagementIds.includes(engagementId);

      if (!hasAccess) {
        const { data: eng } = await supabaseAdmin
          .from('client_engagements')
          .select('contact_email, client_id')
          .eq('id', engagementId)
          .maybeSingle();

        const emailMatch = eng?.contact_email && eng.contact_email.toLowerCase() === verifiedClient.email;
        const orgMatch = clientContext.clientId && eng?.client_id === clientContext.clientId;

        if (!emailMatch && !orgMatch) {
          return NextResponse.json(
            { error: 'Forbidden: You do not have ownership access to this engagement' },
            { status: 403 }
          );
        }
      }

      resolvedClientId = clientContext.clientId || verifiedClient.user.id;
    } else if (staff) {
      if (staff.role !== 'super_admin') {
        const { data: assignment } = await supabaseAdmin
          .from('staff_client_assignments')
          .select('id, status, expires_at')
          .eq('staff_user_id', staff.userId)
          .eq('engagement_id', engagementId)
          .eq('status', 'active')
          .maybeSingle();

        if (!assignment || (assignment.expires_at && new Date(assignment.expires_at).getTime() <= Date.now())) {
          return NextResponse.json(
            { error: 'Forbidden: Staff member is not assigned to this engagement' },
            { status: 403 }
          );
        }
      }

      resolvedClientId = staff.userId;
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const correction = await createClientCorrectionRequest({
      clientId: resolvedClientId,
      engagementId,
      stageNumber,
      documentRef,
      affectedField,
      previousValue,
      requestedValue,
      explanation,
      supportingEvidenceUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Correction request submitted for formal review.',
      correction,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // AUTH07 / AUTH08: Require authenticated caller session
    const staff = await getStaffSession();
    const verifiedClient = !staff ? await getVerifiedClientUser() : null;

    if (!staff && !verifiedClient) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view correction requests' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');

    // AUTH07: Enforce explicit engagement scoping; never expose cross-tenant corrections
    if (!engagementId || !engagementId.trim()) {
      return NextResponse.json(
        { error: 'Missing required engagementId parameter: correction queries must be engagement-scoped' },
        { status: 400 }
      );
    }

    // Verify authorized access to this engagement
    if (verifiedClient) {
      const hasAccess = await assertClientEngagementAccess(verifiedClient.user.id, engagementId);
      if (!hasAccess) {
        const { data: eng } = await supabaseAdmin
          .from('client_engagements')
          .select('contact_email')
          .eq('id', engagementId)
          .maybeSingle();

        if (!eng || eng.contact_email?.toLowerCase() !== verifiedClient.email) {
          return NextResponse.json(
            { error: 'Forbidden: You do not have ownership access to this engagement' },
            { status: 403 }
          );
        }
      }
    } else if (staff && staff.role !== 'super_admin') {
      const { data: assignment } = await supabaseAdmin
        .from('staff_client_assignments')
        .select('id, status, expires_at')
        .eq('staff_user_id', staff.userId)
        .eq('engagement_id', engagementId)
        .eq('status', 'active')
        .maybeSingle();

      if (!assignment || (assignment.expires_at && new Date(assignment.expires_at).getTime() <= Date.now())) {
        return NextResponse.json(
          { error: 'Forbidden: Staff member is not assigned to this engagement' },
          { status: 403 }
        );
      }
    }

    const { data: corrections, error } = await supabaseAdmin
      .from('client_correction_requests')
      .select('id, engagement_id, stage_number, document_ref, affected_field, previous_value, requested_value, status, created_at, reviewed_at')
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      corrections: corrections || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
