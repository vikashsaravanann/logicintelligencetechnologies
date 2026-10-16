import { NextRequest, NextResponse } from 'next/server';
import { createEngagement, listAllEngagements } from '@/lib/engagements/db';
import { COMPANY } from '@/config/company';
import { isRouteCallerSuperAdmin } from '@/lib/auth/is-super-admin';
import { requireCapabilityApi } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isSuperAdmin = await isRouteCallerSuperAdmin();
    if (!isSuperAdmin) {
      const auth = await requireCapabilityApi(req, 'clients.read');
      if (!auth.ok) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin access required.' },
          { status: 403 }
        );
      }
    }

    const engagements = await listAllEngagements();
    return NextResponse.json({ success: true, engagements });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch engagements';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isSuperAdmin = await isRouteCallerSuperAdmin();
    if (!isSuperAdmin) {
      const auth = await requireCapabilityApi(req, 'clients.write');
      if (!auth.ok) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin privileges required to issue client engagements.' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      projectTitle,
      budgetRange,
      notes,
      sendEmailImmediately,
      customMessage,
    } = body;

    if (!companyName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Organization / Company Name is required.' },
        { status: 400 }
      );
    }

    if (!contactName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Primary contact name is required.' },
        { status: 400 }
      );
    }

    if (!contactEmail?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Contact email address is required.' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const result = await createEngagement({
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone?.trim() || null,
      projectTitle: projectTitle?.trim() || 'Enterprise Digital Platform & Cloud Architecture',
      budgetRange: budgetRange?.trim() || null,
      notes: notes?.trim() || null,
      sendEmailImmediately: sendEmailImmediately !== false,
      customMessage: customMessage?.trim() || null,
    });

    if (!result.success || !result.engagement) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create engagement' },
        { status: 500 }
      );
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, '');
    const portalUrl = `${siteUrl}/engagement/${result.engagement.engagement_ref}`;
    const workspaceUrl = `${siteUrl}/client/login?ref=${result.engagement.engagement_ref}`;

    return NextResponse.json(
      {
        success: true,
        engagement: result.engagement,
        portalUrl,
        workspaceUrl,
        emailDispatched: result.emailDispatched,
        emailMessage: result.emailMessage,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[API /api/engagements POST] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
