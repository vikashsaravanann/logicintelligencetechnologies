import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildUpiUri, generateUpiQrDataUrl, LIT_PAYEE_CONFIG } from '@/lib/payments/upi';
import { isCurrentUserSuperAdmin } from '@/lib/auth/is-super-admin';
import { calculateEngagementFinancials } from '@/lib/engagements/financials';
import StageHeader from '../components/StageHeader';
import LockedStageCard from '../components/LockedStageCard';
import InitialInvoiceStageClient from './InitialInvoiceStageClient';

interface InitialInvoicePageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function InitialInvoiceStagePage({ params }: InitialInvoicePageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const isSuperAdmin = await isCurrentUserSuperAdmin();
  const stage = await getStageByKey(engagement.id, 'initial-invoice');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="initial-invoice" status="locked" isSuperAdmin={isSuperAdmin} />
        <LockedStageCard engagementRef={engagementRef} stageKey="initial-invoice" />
      </div>
    );
  }

  // Look up dedicated secureToken if available
  let secureToken: string | null = (stage?.snapshot?.secure_token as string) || null;
  if (!secureToken && engagement.proposal_id) {
    try {
      const { data: proposal } = await supabaseAdmin
        .from('proposals')
        .select('secure_token')
        .eq('id', engagement.proposal_id)
        .maybeSingle();
      if (proposal?.secure_token) {
        secureToken = proposal.secure_token;
      }
    } catch {
      // ignore
    }
  }

  const candidateSubtotal =
    stage?.snapshot?.subtotal ||
    (engagement.metadata as Record<string, any>)?.contract_subtotal ||
    (engagement.metadata as Record<string, any>)?.subtotal ||
    (engagement.metadata as Record<string, any>)?.contract_value ||
    (engagement.metadata as Record<string, any>)?.budget_range ||
    50;
  const financials = calculateEngagementFinancials(candidateSubtotal);

  const transactionRef = `LIT-PAY-${engagement.engagement_ref}-INIT`;
  const upiDeepLink = buildUpiUri({
    pa: LIT_PAYEE_CONFIG.upiId,
    pn: LIT_PAYEE_CONFIG.accountHolder,
    am: financials.depositAmount,
    cu: 'INR',
    tr: transactionRef,
    tn: `Initial Deposit 50% ${engagement.engagement_ref}`,
  });

  const qrDataUrl = await generateUpiQrDataUrl(upiDeepLink);

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="initial-invoice"
        status={stage?.status || 'available'}
        isSuperAdmin={isSuperAdmin}
      />

      <InitialInvoiceStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        contactName={engagement.contact_name}
        contactEmail={engagement.contact_email}
        qrDataUrl={qrDataUrl}
        upiDeepLink={upiDeepLink}
        transactionRef={transactionRef}
        secureToken={secureToken || undefined}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
        metadata={engagement.metadata as Record<string, unknown>}
      />
    </div>
  );
}
