import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { requireCapabilityApi } from '@/lib/auth/session';
import { recordAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const ALLOWED_IDENTITY_FIELDS = [
  'company_name',
  'registered_address',
  'gstin',
  'pan',
  'contact_name',
  'contact_email',
  'contact_phone',
  'billing_address',
] as const;

export type AllowedIdentityField = (typeof ALLOWED_IDENTITY_FIELDS)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { engagementId, targetField, proposedValue, changeReason, requestedBy } = body;

    if (!proposedValue || !changeReason || !requestedBy || !engagementId) {
      return NextResponse.json(
        { success: false, error: 'Missing required correction fields (engagementId, proposedValue, changeReason, requestedBy).' },
        { status: 400 }
      );
    }

    const field = (targetField || 'company_name') as AllowedIdentityField;
    if (!ALLOWED_IDENTITY_FIELDS.includes(field)) {
      return NextResponse.json(
        { success: false, error: `Invalid targetField '${targetField}'. Must be one of: ${ALLOWED_IDENTITY_FIELDS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!isAdminClientConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable. Request cannot be recorded.' },
        { status: 503 }
      );
    }

    // Verify engagement exists before allowing correction proposal
    const { data: engData, error: engErr } = await supabaseAdmin
      .from('client_engagements')
      .select('id, company_name, contact_email')
      .eq('id', engagementId)
      .maybeSingle();

    if (engErr || !engData) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found or unauthorized.' },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('client_identity_change_requests')
      .insert({
        engagement_id: engagementId,
        target_field: field,
        proposed_value: proposedValue.trim(),
        change_reason: changeReason.trim(),
        requested_by: requestedBy.trim(),
        status: 'pending',
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[identity-correction] DB insert error:', error);
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to submit identity correction proposal.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireCapabilityApi(req, 'engagement.identity_change.approve');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const { requestId, status, notes } = body;

    if (!requestId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid requestId or status. Status must be approved or rejected.' },
        { status: 400 }
      );
    }

    if (!isAdminClientConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    const { data: requestRecord, error: fetchErr } = await supabaseAdmin
      .from('client_identity_change_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchErr || !requestRecord) {
      return NextResponse.json(
        { success: false, error: 'Identity correction request not found.' },
        { status: 404 }
      );
    }

    const targetField = requestRecord.target_field as AllowedIdentityField;
    if (!ALLOWED_IDENTITY_FIELDS.includes(targetField)) {
      return NextResponse.json(
        { success: false, error: `Unauthorized target field: ${targetField}` },
        { status: 400 }
      );
    }

    // If approved, update target field in client_engagements safely
    if (status === 'approved' && requestRecord.engagement_id) {
      const topLevelColumns = ['company_name', 'contact_name', 'contact_email', 'contact_phone'];
      if (topLevelColumns.includes(targetField)) {
        const { error: engUpdateErr } = await supabaseAdmin
          .from('client_engagements')
          .update({
            [targetField]: requestRecord.proposed_value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestRecord.engagement_id);

        if (engUpdateErr) {
          return NextResponse.json(
            { success: false, error: `Failed to update engagement: ${engUpdateErr.message}` },
            { status: 500 }
          );
        }
      } else {
        // Update inside JSON metadata
        const { data: currentEng } = await supabaseAdmin
          .from('client_engagements')
          .select('metadata')
          .eq('id', requestRecord.engagement_id)
          .single();

        const currentMetadata = (currentEng?.metadata as Record<string, any>) || {};
        const updatedMetadata = {
          ...currentMetadata,
          [targetField]: requestRecord.proposed_value,
        };

        const { error: engMetaErr } = await supabaseAdmin
          .from('client_engagements')
          .update({
            metadata: updatedMetadata,
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestRecord.engagement_id);

        if (engMetaErr) {
          return NextResponse.json(
            { success: false, error: `Failed to update engagement metadata: ${engMetaErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Update status of the change request
    const reviewerIdentifier = auth.session.email || auth.session.userId;
    const { error: updateErr } = await supabaseAdmin
      .from('client_identity_change_requests')
      .update({
        status,
        reviewed_by: reviewerIdentifier,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', requestId);

    if (updateErr) {
      console.error('[identity-correction] PATCH update error:', updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // Record admin audit log
    await recordAdminAction({
      actor: { userId: auth.session.userId, email: auth.session.email, role: auth.session.role },
      action: status === 'approved' ? 'clients.identity.approve' : 'clients.identity.reject',
      capability: 'clients.write',
      target: { type: 'client_identity_change_request', id: requestId },
      outcome: 'succeeded',
      metadata: {
        engagementId: requestRecord.engagement_id,
        targetField: requestRecord.target_field,
        proposedValue: requestRecord.proposed_value,
        status,
      },
      request: req,
    });

    return NextResponse.json({ success: true, requestId, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
