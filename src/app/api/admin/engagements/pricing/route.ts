import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import {
  calculateEngagementFinancials,
  validateExplicitSubtotalAmount,
  ScopeQuotationItem,
} from '@/lib/engagements/financials';
import { requireCapabilityApi } from '@/lib/auth/session';
import { recordAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireCapabilityApi(req, 'engagement.pricing.manage');
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      subtotal,
      gstApplicable,
      discountAmount,
      customScopeItems,
      notes,
    } = body;

    if (!engagementRef || typeof engagementRef !== 'string') {
      return NextResponse.json(
        { success: false, error: 'engagementRef is required' },
        { status: 400 }
      );
    }

    const subtotalValidation = validateExplicitSubtotalAmount(subtotal);
    if (!subtotalValidation.ok) {
      return NextResponse.json(
        { success: false, error: subtotalValidation.error },
        { status: 400 }
      );
    }

    const engagement = await getEngagementByRef(engagementRef);
    if (!engagement) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    const financials = calculateEngagementFinancials(subtotalValidation.subtotal, {
      gstApplicable: typeof gstApplicable === 'boolean' ? gstApplicable : undefined,
      discountAmount: typeof discountAmount === 'number' ? discountAmount : 0,
      customScopeItems: customScopeItems as ScopeQuotationItem[] | undefined,
    });

    const now = new Date().toISOString();
    const updatedMetadata = {
      ...(engagement.metadata || {}),
      contract_subtotal: financials.subtotal,
      discount_amount: financials.discountAmount,
      gst_applicable: financials.gstApplicable,
      contract_value: financials.totalFormatted,
      budget_range: financials.totalFormatted,
      gst_amount: financials.gstFormatted,
      deposit_amount: financials.depositFormatted,
      settlement_amount: financials.settlementFormatted,
      commercial_items: financials.scopeItems,
      pricing_updated_at: now,
      pricing_updated_by: auth.session.userId,
      pricing_notes: notes || 'Updated by Super Admin',
    };

    if (isAdminClientConfigured()) {
      const { error: engErr } = await supabaseAdmin
        .from('client_engagements')
        .update({
          metadata: updatedMetadata,
          updated_at: now,
        })
        .eq('id', engagement.id);

      if (engErr) {
        return NextResponse.json(
          { success: false, error: `Failed to persist engagement pricing: ${engErr.message}` },
          { status: 500 }
        );
      }

      const stages = await getEngagementStages(engagement.id);
      const proposalStage = stages.find((s) => s.stage_key === 'proposal');
      if (proposalStage) {
        const updatedSnapshot = {
          ...(proposalStage.snapshot || {}),
          subtotal: financials.subtotalFormatted,
          discountAmount: financials.discountAmount,
          gstApplicable: financials.gstApplicable,
          gst: financials.gstFormatted,
          totalPayable: financials.totalFormatted,
          deposit: financials.depositFormatted,
          settlement: financials.settlementFormatted,
          commercialItems: financials.scopeItems,
          last_updated_at: now,
        };

        const { error: stageErr } = await supabaseAdmin
          .from('engagement_stages')
          .update({
            snapshot: updatedSnapshot,
            updated_at: now,
          })
          .eq('id', proposalStage.id);

        if (stageErr) {
          return NextResponse.json(
            { success: false, error: `Failed to persist proposal stage pricing: ${stageErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    await recordAdminAction({
      actor: {
        userId: auth.session.userId,
        email: auth.session.email,
        role: auth.session.role,
      },
      action: 'engagement.pricing.update',
      capability: 'engagement.pricing.manage',
      outcome: 'succeeded',
      target: {
        type: 'client_engagement',
        id: engagement.id,
      },
      metadata: {
        engagementRef,
        subtotal: financials.subtotal,
        gstAmount: financials.gstAmount,
        totalAmount: financials.totalAmount,
        depositAmount: financials.depositAmount,
        settlementAmount: financials.settlementAmount,
      },
    });

    return NextResponse.json({
      success: true,
      financials,
      message: `Commercial quotation updated successfully: Subtotal ${financials.subtotalFormatted} + GST ${financials.gstFormatted} = Total ${financials.totalFormatted}`,
    });
  } catch (err: unknown) {
    console.error('[API POST /api/admin/engagements/pricing] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to update quotation pricing';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

