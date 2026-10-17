import { NextRequest, NextResponse } from 'next/server';
import { getClientActiveSubscription } from '@/lib/subscriptions/service';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');

    if (!engagementId) {
      return NextResponse.json({ error: 'Missing engagementId parameter' }, { status: 400 });
    }

    const subscription = await getClientActiveSubscription(engagementId);

    // Also fetch recent orders for this engagement
    const { data: recentOrders } = await supabaseAdmin
      .from('maintenance_orders')
      .select('*')
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      subscription,
      recentOrders: recentOrders || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
