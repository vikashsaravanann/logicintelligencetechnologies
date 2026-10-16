import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import { calculateEngagementFinancials, ScopeQuotationItem } from '@/lib/engagements/financials';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      subtotal,
      customScopeItems,
      notes,
    } = body;

    if (!engagementRef) {
      return NextResponse.json(
        { success: false, error: 'engagementRef is required' },
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

    const numericSubtotal = typeof subtotal === 'number' ? subtotal : parseFloat(String(subtotal).replace(/[^0-9.]/g, '')) || 50;
    const financials = calculateEngagementFinancials(numericSubtotal, {
      customScopeItems: customScopeItems as ScopeQuotationItem[] | undefined,
    });

    const updatedMetadata = {
      ...(engagement.metadata || {}),
      contract_subtotal: financials.subtotal,
      contract_value: financials.totalFormatted,
      budget_range: financials.totalFormatted,
      gst_amount: financials.gstFormatted,
      deposit_amount: financials.depositFormatted,
      settlement_amount: financials.settlementFormatted,
      commercial_items: financials.scopeItems,
      pricing_updated_at: new Date().toISOString(),
      pricing_notes: notes || 'Updated by Super Admin',
    };

    if (isAdminClientConfigured()) {
      // 1. Update client_engagements record
      await supabaseAdmin
        .from('client_engagements')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', engagement.id);

      // 2. Update proposal stage snapshot
      const stages = await getEngagementStages(engagement.id);
      const proposalStage = stages.find((s) => s.stage_key === 'proposal');
      if (proposalStage) {
        const updatedSnapshot = {
          ...(proposalStage.snapshot || {}),
          subtotal: financials.subtotalFormatted,
          gst: financials.gstFormatted,
          totalPayable: financials.totalFormatted,
          deposit: financials.depositFormatted,
          settlement: financials.settlementFormatted,
          commercialItems: financials.scopeItems,
          last_updated_at: new Date().toISOString(),
        };

        await supabaseAdmin
          .from('engagement_stages')
          .update({
            snapshot: updatedSnapshot,
            updated_at: new Date().toISOString(),
          })
          .eq('id', proposalStage.id);
      }
    }

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
