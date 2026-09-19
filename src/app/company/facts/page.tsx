import React from 'react';

export default function CompanyFactsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Public Company Fact Sheet</h1>
      <ul className="list-disc list-inside space-y-4">
        <li><strong>Company Name:</strong> Logic Intelligence Technologies</li>
        <li><strong>Location:</strong> Coimbatore</li>
        <li><strong>Founder:</strong> Vikash Saravanan</li>
      </ul>
    </div>
  );
}
