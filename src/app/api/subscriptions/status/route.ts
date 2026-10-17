import { NextRequest, NextResponse } from 'next/server';
import { getClientActiveSubscription } from '@/lib/subscriptions/service';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getStaffSession } from '@/lib/auth/session';
import { getVerifiedClientUser } from '@/lib/auth/client-auth';
import { assertClientEngagementAccess } from '@/lib/auth/client-identity';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');

    if (!engagementId) {
      return NextResponse.json({ error: 'Missing engagementId parameter' }, { status: 400 });
    }

    // AUTH07 / AUTH08: Require authenticated caller session
    const staff = await getStaffSession();
    const verifiedClient = !staff ? await getVerifiedClientUser() : null;

    if (!staff && !verifiedClient) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access subscription status' },
        { status: 401 }
      );
    }

    // Verify authorized access to this engagement
    if (verifiedClient) {
      const hasAccess = await assertClientEngagementAccess(verifiedClient.user.id, engagementId);
      if (!hasAccess) {
        // Fallback check contact_email on client_engagements
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

    const subscription = await getClientActiveSubscription(engagementId);

    // AUTH07: Safe explicit shape for recent orders; strip secure_token, verified_by, internal audit notes
    const { data: recentOrders } = await supabaseAdmin
      .from('maintenance_orders')
      .select('id, order_ref, plan_id, plan_name, billing_cycle, subtotal_paise, gst_paise, total_payable_paise, status, created_at, expires_at')
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false })
      .limit(5);

    const safeOrders = (recentOrders || []).map((o) => ({
      id: o.id,
      orderRef: o.order_ref,
      planId: o.plan_id,
      planName: o.plan_name,
      billingCycle: o.billing_cycle,
      subtotalPaise: o.subtotal_paise,
      gstPaise: o.gst_paise,
      totalPayablePaise: o.total_payable_paise,
      status: o.status,
      createdAt: o.created_at,
      expiresAt: o.expires_at,
    }));

    return NextResponse.json({
      success: true,
      subscription,
      recentOrders: safeOrders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
