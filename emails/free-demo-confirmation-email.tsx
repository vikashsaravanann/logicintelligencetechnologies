import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/email-layout';
import { EmailHeader } from './components/email-header';
import { EmailFooter } from './components/email-footer';

interface Props {
  fullName: string;
}

export default function FreeDemoConfirmationEmail({ fullName = 'Valued Client' }: Props) {
  return (
    <EmailLayout preview="We received your free demo request — Logic Intelligence Technologies" // "We received your demo request">
      <EmailHeader />
      <Section style={contentSection}>
        <Text style={heading}>Request Received</Text>
        <Text style={paragraph}>Hello {fullName},</Text>
        <Text style={paragraph}>
          Thank you for requesting a free demo. Our team has received your request and is currently reviewing the details.
        </Text>
        <Text style={paragraph}>
          Our process is designed to deliver excellence across three phases:
        </Text>
        <ul style={list}>
          <li style={listItem}><strong>Strategy:</strong> We analyze your requirements to outline a robust architectural plan.</li>
          <li style={listItem}><strong>Design:</strong> We create intuitive, modern prototypes tailored to your brand.</li>
          <li style={listItem}><strong>Build:</strong> We engineer scalable solutions utilizing the latest technologies.</li>
        </ul>
        <Text style={paragraph}>
          One of our experts will contact you shortly to schedule your demo and discuss the next steps. We look forward to collaborating with you.
        </Text>
        <Text style={signature}>
          Best regards,<br />
          The Logic Intelligence Technologies Team
        </Text>
      </Section>
      <EmailFooter />
    </EmailLayout>
  );
}

const contentSection = {
  padding: '40px 40px 32px 40px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 24px 0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const list = {
  margin: '0 0 24px 0',
  paddingLeft: '24px',
};

const listItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '8px',
};

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '24px 0 0 0',
};
