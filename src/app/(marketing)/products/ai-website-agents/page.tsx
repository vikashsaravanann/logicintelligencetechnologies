import { Metadata } from 'next';
import Link from 'next/link';
import { aiWebsiteAgentsProductNode } from '@/lib/seo/schema';
import {
  ArrowRight,
  Bot,
  Zap,
  Globe,
  Database,
  Sparkles,
  Code2,
  LineChart,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Scale,
  ShoppingBag,
} from 'lucide-react';
import BackButton from '@/components/navigation/back-button';

export const metadata: Metadata = {
  title: 'AI Website Agents | Conversational Pipeline Automation | Logic Intelligence Technologies',
  description:
    'AI Website Agents by Logic Intelligence Technologies — grounded in approved business knowledge, lead qualification, structured conversion, and live human escalation.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-website-agents',
  },
};

export default function AIWebsiteAgentsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [aiWebsiteAgentsProductNode()],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <BackButton fallbackHref="/products" label="Back to Products" inline />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {/* Hero Section */}
        <section aria-label="AI Website Agents Hero" className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FA9A2]/10 border border-[#1FA9A2]/25 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1FA9A2]" aria-hidden />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
              Autonomous Web Conversion · Pipeline Intelligence
            </span>
          </div>

          <h1 className="text-[clamp(2.25rem,5.2vw,4.5rem)] font-bold tracking-tight text-[var(--lit-navy,#0B2545)] uppercase leading-[1.08]">
            Turn Passive Traffic Into{' '}
            <span className="block text-[var(--lit-blue,#1565C0)] font-serif italic font-normal normal-case">
              Qualified Pipeline
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[var(--lit-text-muted,#52677C)] max-w-3xl mx-auto leading-relaxed font-normal">
            AI Agent engineered to answer visitor inquiries using verified company knowledge, qualify
            buyer intent in real-time, capture CRM leads, and orchestrate smooth human handoff.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white font-semibold text-sm transition-all shadow-xs"
            >
              <span>View Pricing &amp; Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ai"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-[var(--lit-navy,#0B2545)] font-semibold text-sm transition-all shadow-xs"
            >
              <span>Try Live AI Assistant Demo</span>
            </Link>
          </div>
        </section>

        {/* Highlights Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Key Highlights">
          {[
            {
              value: 'Grounded RAG',
              label: 'Approved enterprise documentation boundaries',
              icon: Database,
              color: 'text-[#1565C0]',
              bg: 'bg-[#E7F3FF]',
            },
            {
              value: '24/7 Always-On',
              label: 'Instant response without human fatigue',
              icon: Zap,
              color: 'text-[#0E7A74]',
              bg: 'bg-[#1FA9A2]/10',
            },
            {
              value: 'CRM Ingestion',
              label: 'Direct sync to Supabase, HubSpot, or webhooks',
              icon: MessageSquare,
              color: 'text-[#7C3AED]',
              bg: 'bg-[#F1ECFF]',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-8 text-center shadow-xs hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] mb-1 font-mono">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Capabilities Grid */}
        <section className="space-y-10 sm:space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider">
              Autonomous Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Engineered for{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Business Conversion
              </span>
            </h2>
            <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Far beyond a generic customer support chatbot. A precision conversion engine configured
              strictly on approved business assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Retrieval-Augmented Knowledge',
                desc: 'Ingests approved PDFs, website pages, and documentation. Answers visitor questions strictly within defined parameters without hallucination.',
                icon: Database,
                bg: 'bg-[#E7F3FF]',
                color: 'text-[#1565C0]',
              },
              {
                title: 'Real-Time Intent Qualification',
                desc: 'Asks structured qualifying questions (budget, project timeline, technical requirements) prior to routing to your sales desk.',
                icon: MessageSquare,
                bg: 'bg-[#ECFDF5]',
                color: 'text-[#059669]',
              },
              {
                title: 'CRM & Database Sync',
                desc: 'Pushes conversational summaries, captured contact fields, and intent scoring directly into your connected CRM via secure endpoints.',
                icon: Code2,
                bg: 'bg-[#F1ECFF]',
                color: 'text-[#7C3AED]',
              },
              {
                title: 'Multi-Language Dialogue',
                desc: 'Understands and responds in multiple languages dynamically based on visitor language preference and browser locale.',
                icon: Globe,
                bg: 'bg-[#FFF4D9]',
                color: 'text-[#B45309]',
              },
              {
                title: 'Deterministic Human Handoff',
                desc: 'Detects enterprise-tier opportunities or complex technical issues and routes the visitor to human agents with full conversation context.',
                icon: Bot,
                bg: 'bg-[#FCEAF3]',
                color: 'text-[#BE185D]',
              },
              {
                title: 'Auditable Conversion Analytics',
                desc: 'Analyzes visitor drop-off, common objections, and high-frequency inquiries to systematically improve website conversion rates.',
                icon: LineChart,
                bg: 'bg-[#1FA9A2]/10',
                color: 'text-[#0E7A74]',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3-Step Setup */}
        <section className="space-y-10 sm:space-y-12 py-10 sm:py-16 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider">
              Deployment Path
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Three Steps from Knowledge to{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Live Deployment
              </span>
            </h2>
            <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Deployable via a lightweight modern script snippet, iframe embed, or embeddable modal widget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Ingest Verified Knowledge',
                desc: 'Provide authorized website URLs, service briefs, or documentation PDFs. Knowledge is indexed for contextual vector retrieval.',
              },
              {
                step: '02',
                title: 'Configure Conversation Boundaries',
                desc: 'Define agent persona, qualification rules, and webhook targets. Boundaries ensure the assistant never invents contractual commitments.',
              },
              {
                step: '03',
                title: 'Embed & Accelerate Leads',
                desc: 'Embed via a lightweight script or host directly on your domain. Engage prospects, capture qualified leads, and accelerate pipeline.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-8 text-center space-y-4 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E7F3FF] border border-[#1565C0]/20 flex items-center justify-center mx-auto text-xl font-bold font-mono text-[#1565C0]">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">{item.title}</h3>
                <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Business Verticals */}
        <section className="space-y-10 sm:space-y-12 py-10 sm:py-16 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider">
              Target Verticals
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Configured Across{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Industry Verticals
              </span>
            </h2>
            <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Tailored conversion journeys and specialized knowledge frameworks for high-intent visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] flex items-center justify-center text-[#1565C0]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">B2B SaaS &amp; Technology</h3>
              <ul className="space-y-3 text-xs text-[var(--lit-ink,#121826)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>Tier 1 product and API documentation answers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>Enterprise demo scheduling &amp; lead qualification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>Transparent pricing breakdown from approved sheets</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] flex items-center justify-center text-[#7C3AED]">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Professional &amp; Legal Services</h3>
              <ul className="space-y-3 text-xs text-[var(--lit-ink,#121826)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Practice area explanation and eligibility intake</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Initial case conflict and jurisdiction checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Direct consultation booking with partner calendars</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">E-Commerce &amp; High-Value Retail</h3>
              <ul className="space-y-3 text-xs text-[var(--lit-ink,#121826)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Product specification and compatibility guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Shipping policy, warranty, and return procedures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Bulk order quotes and corporate sales intake</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-8 py-10 sm:py-16 border-t border-[var(--lit-border-light,#DFE7EF)] max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden />
              Clarity &amp; Accuracy
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Frequently Asked{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Questions
              </span>
            </h2>
            <p className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase">
              Knowledge Retrieval &amp; Accuracy Standards
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 space-y-2 shadow-xs">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                Will the AI agent invent unauthorized facts or pricing?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                No. Strict RAG guardrails limit response generation solely to verified enterprise documentation. If a query falls outside approved sources, the system politely declines or escalates to human sales.
              </p>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 space-y-2 shadow-xs">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                How fast is the initial implementation timeline?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Standard deployments take less than 48 hours once company documents are provided. Custom CRM two-way synchronization and bespoke workflows are delivered within standard enterprise sprints.
              </p>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 space-y-2 shadow-xs">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                Can visitors hand off to live human team members?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Yes. When human handoff is enabled, high-intent prospects or unresolved inquiries trigger instant notifications with full conversation transcripts.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative rounded-3xl overflow-hidden bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-14 lg:p-16 text-center shadow-xl border border-white/10">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(69,217,210,0.18), transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#45D9D2]/30 bg-[#45D9D2]/10">
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
                Instant Live Deployment
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Deploy Your Autonomous{' '}
              <span className="font-serif italic font-normal text-[#45D9D2]">
                AI Website Agent
              </span>
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Embed via snippet or explore the live interactive assistant at /ai. Packages include onboarding and knowledge configuration.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#1FA9A2] to-[#45D9D2] text-[var(--lit-navy,#0B2545)] font-bold text-sm hover:brightness-105 shadow-md transition-all"
              >
                <span>Request Custom Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <span>Compare Package Pricing</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
