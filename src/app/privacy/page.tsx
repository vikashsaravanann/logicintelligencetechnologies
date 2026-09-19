import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Logic Intelligence Technologies',
  description: 'Privacy policy for Logic Intelligence Technologies',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <ul className="list-disc list-inside space-y-4 text-lg">
        <li>We collect only the necessary information to provide and improve our services.</li>
        <li>Personal data is never sold or shared with unauthorized third parties.</li>
        <li>Users have full control over their data and can request deletion at any time.</li>
        <li>We comply with applicable data protection regulations.</li>
        <li>Data processing is transparent and clearly communicated to our clients.</li>
      </ul>
    </div>
  );
}
