import { Metadata } from 'next';
import Link from 'next/link';
import { aiWebsiteAgentsProductNode } from '@/lib/seo/schema';
import { ArrowRight, Bot, Zap, Globe, Database, Sparkles, Code2, LineChart, MessageSquare, CheckCircle2 } from 'lucide-react';
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: 'AI Website Agents | Conversational Pipeline Automation | Logic Intelligence Technologies',
  description: 'AI Website Agents by Logic Intelligence Technologies — grounded in approved business knowledge, lead qualification, structured conversion, and live human escalation.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-website-agents',
  }
};

export default function AIWebsiteAgentsPage() {
  return (
    <div className="relative min-h-screen bg-[#07090D] text-slate-100 overflow-x-hidden selection:bg-primary selection:text-slate-950 pt-32 pb-24">
      <BackToHome href="/products" label="Back to Products" />

      {/* Atmospheric lighting */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(69,217,210,0.1),_transparent_70%)] blur-[120px]" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [aiWebsiteAgentsProductNode()],
          }),
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-32">
        
        {/* Hero */}
        <section className="text-center space-y-8 pt-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10131A] border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Web Conversion</span>
          </div>
          
          <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold tracking-tight text-white uppercase leading-[1.05]">
            Turn Passive Traffic Into <span className="bg-gradient-to-r from-primary via-[#6DE6E0] to-[#1565C0] bg-clip-text text-transparent">Qualified Pipeline</span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            AI Agent engineered to answer visitor inquiries using verified company knowledge, qualify buyer intent in real-time, capture CRM leads, and orchestrate smooth human handoff.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-all"
            >
              <span>View Pricing &amp; Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ai"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/15 bg-[#10131A] hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Try Live AI Assistant Demo</span>
            </Link>
          </div>
        </section>

        {/* Highlights Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Key Highlights">
          {[
            { value: "Grounded RAG", label: "Approved enterprise documentation boundaries", icon: Database },
            { value: "24/7 Always-On", label: "Instant response without human fatigue", icon: Zap },
            { value: "CRM Ingestion", label: "Direct sync to Supabase, HubSpot, or webhooks", icon: MessageSquare }
          ].map((stat, i) => (
            <div key={i} className="bg-[#10131A] border border-white/10 rounded-3xl p-8 text-center hover:border-primary/40 transition-colors">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 font-mono">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Capabilities Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Engineered for Business Conversion
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-light">
              Far beyond a generic customer support chatbot. A precision conversion engine configured strictly on approved business assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Retrieval-Augmented Knowledge",
                desc: "Ingests approved PDFs, website pages, and documentation. Answers visitor questions strictly within defined parameters without hallucination.",
                icon: Database
              },
              {
                title: "Real-Time Intent Qualification",
                desc: "Asks structured qualifying questions (budget, project timeline, technical requirements) prior to routing to your sales desk.",
                icon: MessageSquare
              },
              {
                title: "CRM & Database Sync",
                desc: "Pushes conversational summaries, captured contact fields, and intent scoring directly into your connected CRM via secure endpoints.",
                icon: Code2
              },
              {
                title: "Multi-Language Dialogue",
                desc: "Understands and responds in multiple languages dynamically based on visitor language preference and browser locale.",
                icon: Globe
              },
              {
                title: "Deterministic Human Handoff",
                desc: "Detects enterprise-tier opportunities or complex technical issues and routes the visitor to human agents with full conversation context.",
                icon: Bot
              },
              {
                title: "Auditable Conversion Analytics",
                desc: "Analyzes visitor drop-off, common objections, and high-frequency inquiries to systematically improve website conversion rates.",
                icon: LineChart
              }
            ].map((feature, i) => (
              <div key={i} className="bg-[#10131A] border border-white/10 rounded-3xl p-8 hover:border-primary/40 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-[#151922] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-primary/40 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3-Step Setup */}
        <section className="space-y-12 py-12 border-t border-white/10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Three Steps from Knowledge to Live Deployment
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-light">
              Deployable via modern Next.js script tag or embeddable modal widget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Ingest Verified Knowledge",
                desc: "Provide authorized website URLs, service briefs, or documentation PDFs. Knowledge is indexed for contextual vector retrieval."
              },
              {
                step: "02",
                title: "Configure Conversation Boundaries",
                desc: "Define agent persona, qualification rules, and webhook targets. Boundaries ensure the assistant never invents contractual commitments."
              },
              {
                step: "03",
                title: "Embed & Accelerate Leads",
                desc: "Embed via a lightweight script or host directly on your domain. Engage prospects, capture qualified leads, and accelerate pipeline."
              }
            ].map((item, i) => (
              <div key={i} className="bg-[#10131A] border border-white/10 rounded-3xl p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-xl font-bold font-mono text-primary">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Business Verticals */}
        <section className="space-y-12 py-12 border-t border-white/10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Configured Across Industry Verticals
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-light">
              Tailored conversion journeys for high-intent visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">B2B SaaS &amp; Technology</h3>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Tier 1 product and API documentation answers</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Enterprise demo scheduling &amp; lead qualification</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Transparent pricing breakdown from approved sheets</li>
              </ul>
            </div>

            <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">Professional &amp; Legal Services</h3>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Practice area explanation and eligibility intake</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Initial case conflict and jurisdiction checks</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Direct consultation booking with partner calendars</li>
              </ul>
            </div>

            <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">E-Commerce &amp; High-Value Retail</h3>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Product specification and compatibility guidance</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Shipping policy, warranty, and return procedures</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Bulk order quotes and corporate sales intake</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-8 py-12 border-t border-white/10 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs font-mono text-slate-500 uppercase">Knowledge Retrieval &amp; Accuracy</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Will the AI agent invent unauthorized facts or pricing?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                No. Strict RAG guardrails limit response generation solely to verified enterprise documentation. If a query falls outside approved sources, the system politely declines or escalates to human sales.
              </p>
            </div>

            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-white">How fast is the initial implementation timeline?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Standard deployments take less than 48 hours once company documents are provided. Custom CRM two-way synchronization and bespoke workflows are delivered within standard enterprise sprints.
              </p>
            </div>

            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Can visitors hand off to live human team members?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Yes. When human handoff is enabled, high-intent prospects or unresolved inquiries trigger instant Slack, email, or CRM notifications with full conversation transcripts.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative rounded-3xl overflow-hidden border border-primary/30 bg-[#10131A] p-8 md:p-16 text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
              Deploy Your Autonomous AI Website Agent
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
              Embed via snippet or explore the live interactive assistant at /ai. Packages include onboarding and knowledge configuration.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-colors"
              >
                <span>Request Custom Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-[#151922] text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                <span>Compare Package Pricing</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
