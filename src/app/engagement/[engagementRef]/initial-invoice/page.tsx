import React from 'react';
import { notFound } from 'next/navigation';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import { buildUpiUri, generateUpiQrDataUrl, LIT_PAYEE_CONFIG } from '@/lib/payments/upi';
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

  const stage = await getStageByKey(engagement.id, 'initial-invoice');
  if (stage?.status === 'locked') {
    return (
      <div className="space-y-6">
        <StageHeader engagementRef={engagementRef} stageKey="initial-invoice" status="locked" />
        <LockedStageCard engagementRef={engagementRef} stageKey="initial-invoice" />
      </div>
    );
  }

  const transactionRef = `LIT-PAY-${engagement.engagement_ref}-INIT`;
  const upiDeepLink = buildUpiUri({
    pa: LIT_PAYEE_CONFIG.upiId,
    pn: LIT_PAYEE_CONFIG.accountHolder,
    am: 1062000.0,
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
      />

      <InitialInvoiceStageClient
        engagementRef={engagementRef}
        companyName={engagement.company_name}
        contactName={engagement.contact_name}
        contactEmail={engagement.contact_email}
        qrDataUrl={qrDataUrl}
        upiDeepLink={upiDeepLink}
        transactionRef={transactionRef}
        initialStatus={stage?.status}
        initialData={stage?.snapshot}
      />
    </div>
  );
}
