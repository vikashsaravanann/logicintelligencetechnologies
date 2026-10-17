import { NextRequest, NextResponse } from 'next/server';
import { createOrGetMaintenanceOrder } from '@/lib/subscriptions/service';
import { PlanIdentifier, MAINTENANCE_PLANS } from '@/config/maintenance-plans';
import { getVerifiedClientUser } from '@/lib/auth/client-auth';
import { getStaffSession } from '@/lib/auth/session';
import { assertClientEngagementAccess, resolveClientIdentity } from '@/lib/auth/client-identity';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    // AUTH08: Reject unauthenticated requests strictly; derive identity server-side
    const staff = await getStaffSession();
    const verifiedClient = !staff ? await getVerifiedClientUser() : null;

    if (!staff && !verifiedClient) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to create or retrieve maintenance orders' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { engagementId, planId, consentConfirmed } = body;

    if (!engagementId) {
      return NextResponse.json({ error: 'Missing engagementId' }, { status: 400 });
    }

    if (!planId || !MAINTENANCE_PLANS[planId as PlanIdentifier]) {
      return NextResponse.json({ error: `Invalid planId: ${planId}` }, { status: 400 });
    }

    // Verify engagement relationship
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

    const result = await createOrGetMaintenanceOrder({
      clientId: resolvedClientId,
      engagementId,
      planId: planId as PlanIdentifier,
      consentConfirmed: Boolean(consentConfirmed),
    });

    // AUTH07: Strip internal sensitive fields from returned order
    const safeOrder = result.order ? {
      id: result.order.id,
      orderRef: result.order.order_ref,
      planId: result.order.plan_id,
      planName: result.order.plan_name,
      billingCycle: result.order.billing_cycle,
      subtotalPaise: result.order.subtotal_paise,
      gstPaise: result.order.gst_paise,
      totalPayablePaise: result.order.total_payable_paise,
      status: result.order.status,
      expiresAt: result.order.expires_at,
      createdAt: result.order.created_at,
    } : null;

    return NextResponse.json({
      success: true,
      order: safeOrder,
      pricing: result.pricing,
      upiUri: result.upiUri,
      isExisting: result.isExisting,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
