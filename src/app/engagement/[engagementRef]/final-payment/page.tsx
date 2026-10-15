import React from 'react';
import { notFound } from 'next/navigation';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
} from '@/lib/engagements/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildUpiUri, generateUpiQrDataUrl, LIT_PAYEE_CONFIG } from '@/lib/payments/upi';
import StageHeader from '../components/StageHeader';
import LockedStageCard from '../components/LockedStageCard';
import FinalPaymentStageClient from './FinalPaymentStageClient';

interface FinalPaymentPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function FinalPaymentStagePage({ params }: FinalPaymentPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  if (!engagement) notFound();

  const stage = await getStageByKey(engagement.id, 'final-payment');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="final-payment" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="final-payment" />
      </div>
    );
  }

  // Look up dedicated secureToken if available
  let secureToken: string | null = (stage?.snapshot?.secure_token as string) || null;
  if (!secureToken && engagement.proposal_id) {
    try {
      const { data: pr } = await supabaseAdmin
        .from('engagement_payment_requests')
        .select('secure_token')
        .eq('proposal_id', engagement.proposal_id)
        .eq('stage_number', 11)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (pr?.secure_token) {
        secureToken = pr.secure_token;
      }
    } catch {
      // ignore
    }
  }

  const transactionRef = `LIT-PAY-${engagement.engagement_ref}-FINAL`;
  const upiDeepLink = buildUpiUri({
    pa: LIT_PAYEE_CONFIG.upiId,
    pn: LIT_PAYEE_CONFIG.accountHolder,
    am: 1062000.0,
    cu: 'INR',
    tr: transactionRef,
    tn: `Final Settlement 50% ${engagement.engagement_ref}`,
  });

  const qrDataUrl = await generateUpiQrDataUrl(upiDeepLink);
  const docs = await getEngagementDocumentLinks(engagement.id, 'final-payment');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="final-payment"
        status={stage?.status || 'available'}
      />

      <FinalPaymentStageClient
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
        document={docs[0]}
      />
    </div>
  );
}
