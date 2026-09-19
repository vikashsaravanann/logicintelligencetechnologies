import { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';
import SectionHeader from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { COMPANY } from '@/config/company';
import { aiWebsiteAgentsProductNode } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'AI Website Agents | Logic Intelligence Technologies',
  description: 'Turn website visitors into conversations, qualified leads and customers with our AI Website Agents.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-website-agents',
  }
};

export default function AIWebsiteAgentsPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [aiWebsiteAgentsProductNode()],
          }),
        }}
      />
      <div className="container py-24">
        <SectionHeader
          title="AI Website Agents"
          subtitle="Turn website visitors into conversations, qualified leads and customers."
          align="center"
        />

        <div className="max-w-4xl mx-auto mt-12 text-center text-zinc-300">
          <p className="mb-8 text-lg">
            Our AI Website Agents go beyond simple chatbots. They intelligently interact with your visitors, understand their needs, qualify leads in real-time, and guide them towards conversion, all while seamlessly matching your brand's voice.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-glass p-6 rounded-2xl border border-white/10 text-left">
              <h3 className="text-xl font-bold mb-4 text-white">Intelligent Interactions</h3>
              <p>Natural language processing allows the agent to answer complex questions and guide users.</p>
            </div>
            <div className="bg-glass p-6 rounded-2xl border border-white/10 text-left">
              <h3 className="text-xl font-bold mb-4 text-white">Lead Qualification</h3>
              <p>Automatically gather visitor information and qualify them based on custom criteria.</p>
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
