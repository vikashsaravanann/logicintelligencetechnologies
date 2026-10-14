import React from 'react';
import { getEngagementByRef, getStageByKey } from '@/lib/engagements/db';
import StageHeader from '../components/StageHeader';
import OnboardingStageClient from './OnboardingStageClient';

interface OnboardingPageProps {
  params: Promise<{ engagementRef: string }>;
}

export default async function OnboardingStagePage({ params }: OnboardingPageProps) {
  const { engagementRef } = await params;
  const engagement = await getEngagementByRef(engagementRef);
  const stage = await getStageByKey(engagement?.id || 'sample', 'onboarding');

  return (
    <div className="space-y-6">
      <StageHeader
        engagementRef={engagementRef}
        stageKey="onboarding"
        status={stage?.status || 'available'}
      />

      <OnboardingStageClient
        engagementRef={engagementRef}
        companyName={engagement?.company_name || 'Client Organization'}
        contactName={engagement?.contact_name || 'Authorized Lead'}
        contactEmail={engagement?.contact_email || 'client@example.com'}
      />
    </div>
  );
}
