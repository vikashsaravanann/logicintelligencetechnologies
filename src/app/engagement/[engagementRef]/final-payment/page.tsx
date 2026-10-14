import React from 'react';
import { notFound } from 'next/navigation';
import {
  getEngagementByRef,
  getStageByKey,
  getEngagementDocumentLinks,
} from '@/lib/engagements/db';
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
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
        document={docs[0]}
      />
    </div>
  );
}
