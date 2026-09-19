import React from 'react';
import BackToHome from "@/components/ui/back-to-home";

export default function ProductFactsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <BackToHome />
      <h1 className="text-4xl font-bold mb-8">Public Product Fact Sheet</h1>
      <ul className="list-disc list-inside space-y-4">
        <li><strong>VoiceShield:</strong> VoiceShield is a product by Logic Intelligence Technologies, not a company.</li>
      </ul>
    </div>
  );
}
