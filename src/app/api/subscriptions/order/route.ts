import { NextRequest, NextResponse } from 'next/server';
import { createOrGetMaintenanceOrder } from '@/lib/subscriptions/service';
import { PlanIdentifier, MAINTENANCE_PLANS } from '@/config/maintenance-plans';
import { getVerifiedClientUser } from '@/lib/auth/client-auth';

export async function POST(req: NextRequest) {
  try {
    const verifiedClient = await getVerifiedClientUser();
    const body = await req.json();
    const { engagementId, planId, consentConfirmed } = body;

    if (!engagementId) {
      return NextResponse.json({ error: 'Missing engagementId' }, { status: 400 });
    }

    if (!planId || !MAINTENANCE_PLANS[planId as PlanIdentifier]) {
      return NextResponse.json({ error: `Invalid planId: ${planId}` }, { status: 400 });
    }

    const clientId = verifiedClient ? verifiedClient.user.id : body.clientId || 'anonymous-client';

    const result = await createOrGetMaintenanceOrder({
      clientId,
      engagementId,
      planId: planId as PlanIdentifier,
      consentConfirmed: Boolean(consentConfirmed),
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      pricing: result.pricing,
      upiUri: result.upiUri,
      isExisting: result.isExisting,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
