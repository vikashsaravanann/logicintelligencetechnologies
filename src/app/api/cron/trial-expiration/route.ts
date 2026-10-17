import { NextRequest, NextResponse } from 'next/server';
import { checkAndExpireStandardTrials } from '@/lib/subscriptions/service';

export const revalidate = 0;

/**
 * Background / Cron endpoint for automatic Standard Free Trial expiration
 * Invoked periodically (e.g. daily or hourly) by Vercel Cron or Cloud Scheduler.
 * Secured via CRON_SECRET or authorization header when set in production.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized: Invalid cron authorization token.' }, { status: 401 });
    }

    const result = await checkAndExpireStandardTrials();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredCount: result.expiredCount,
      expiredIds: result.expiredIds,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
