import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security | Logic Intelligence Technologies',
  description: 'Security policies and practices at Logic Intelligence Technologies',
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Security Practices</h1>
      <ul className="list-disc list-inside space-y-4 text-lg">
        <li>We prioritize the security and confidentiality of client data.</li>
        <li>All data is encrypted in transit and at rest using industry-standard protocols.</li>
        <li>Regular security audits and vulnerability assessments are conducted.</li>
        <li>Access to production systems is strictly controlled and monitored.</li>
        <li>We maintain a coordinated vulnerability disclosure program.</li>
        <li>Please contact admin@logicintelligencetechnologies.in for security inquiries.</li>
      </ul>
    </div>
  );
}
