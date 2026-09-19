import { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { COMPANY } from '@/config/company';
import { aiVoiceAgentsProductNode } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'AI Voice Agents | Logic Intelligence Technologies',
  description: 'Your AI-powered front desk for calls, enquiries and appointments.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-voice-agents',
  }
};

export default function AIVoiceAgentsPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [aiVoiceAgentsProductNode()],
          }),
        }}
      />
      <div className="container py-24">
        <SectionHeader
          title="AI Voice Agents"
          subtitle="Your AI-powered front desk for calls, enquiries and appointments."
          align="center"
        />

        <div className="max-w-4xl mx-auto mt-12 text-center text-zinc-300">
          <p className="mb-8 text-lg">
            Never miss a call again. Our AI Voice Agents provide human-like voice interactions, handling inbound calls, answering FAQs, and even scheduling appointments directly into your calendar, 24/7.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-glass p-6 rounded-2xl border border-white/10 text-left">
              <h3 className="text-xl font-bold mb-4 text-white">Human-like Voice</h3>
              <p>Advanced speech synthesis ensures your callers feel like they are talking to a real person.</p>
            </div>
            <div className="bg-glass p-6 rounded-2xl border border-white/10 text-left">
              <h3 className="text-xl font-bold mb-4 text-white">Appointment Scheduling</h3>
              <p>Integrates with your calendar to book appointments autonomously during the call.</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild variant="default">
              <Link href="/pricing">View Pricing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Request Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
