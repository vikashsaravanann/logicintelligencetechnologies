import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { aiWebsiteAgentsProductNode } from '@/lib/seo/schema';
import { ArrowRight, Bot, Zap, Globe, Database, Sparkles, Code2, LineChart, MessageSquare } from 'lucide-react';
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: 'AI Agent | Logic Intelligence Technologies',
  description: 'AI Agent by Logic Intelligence Technologies — business knowledge, conversations, lead qualification and human handoff. Interactive experience at /ai.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-website-agents',
  }
};

export default function AIWebsiteAgentsPage() {
  return (
    <main className="relative min-h-screen bg-[#050A15] text-slate-100 overflow-hidden font-sans">
      <BackToHome />
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [aiWebsiteAgentsProductNode()],
          }),
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        <section className="text-center space-y-8 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Agent</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-500 max-w-4xl mx-auto leading-tight">
            Turn passive traffic into active pipeline.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI Agent designed to answer visitor questions using approved business knowledge, qualify leads in real-time, capture enquiries, and support seamless human handoff.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)]">
              <Link href="/pricing">
                View Pricing & Plans <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all">
              <Link href="/ai">
                Try the Live AI Assistant Demo
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: "RAG", label: "Approved business knowledge — not model training", icon: Database },
            { value: "24/7", label: "Conversations when configured for always-on", icon: Zap },
            { value: "/ai", label: "Live AI Assistant experience", icon: MessageSquare }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center backdrop-blur-xl hover:bg-white/[0.04] transition-colors">
              <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-4 opacity-80" />
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </section>

        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Engineered for business conversion</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Not just a chatbot. A conversion-oriented agent configured on approved business knowledge (RAG — not unrestricted model training).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Retrieval-Augmented Generation",
                desc: "Ingests approved PDFs, website pages, and docs. Answers using company knowledge within configured boundaries.",
                icon: Database
              },
              {
                title: "Real-Time Lead Qualification",
                desc: "Asks qualifying questions (budget, timeline, industry) before handing off to human sales where configured.",
                icon: MessageSquare
              },
              {
                title: "CRM Sync",
                desc: "Pushes chat transcripts and captured lead profiles into supported CRM pipelines where integrated.",
                icon: Code2
              },
              {
                title: "Multilingual Support",
                desc: "Multilingual support where the configured model and deployment support it — coverage is configuration-dependent.",
                icon: Globe
              },
              {
                title: "Seamless Human Handoff",
                desc: "Detects high-intent or complex queries and routes to live support agents when handoff is enabled.",
                icon: Bot
              },
              {
                title: "Actionable Analytics",
                desc: "Tracks common questions and conversation metrics to refine knowledge and workflows over time.",
                icon: LineChart
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-16 py-12 border-t border-white/5">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">How it Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From approved knowledge to a live agent in three steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-y-1/2 z-0" />
            {[
              {
                step: "01",
                title: "Connect Knowledge",
                desc: "Provide approved website URLs, PDFs, or documents. Content is indexed for retrieval within your configuration."
              },
              {
                step: "02",
                title: "Configure",
                desc: "Define personality, boundaries, and CRM/handoff rules. Knowledge is configured from approved content — not custom fine-tuning by default."
              },
              {
                step: "03",
                title: "Deploy & Convert",
                desc: "Embed the agent snippet or host the assistant experience. Engage visitors, qualify leads, and escalate when needed."
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-[#050A15] border border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-all text-center group">
                <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-cyan-400 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-16 py-12 border-t border-white/5">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Built for real businesses</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Conversational experiences across common verticals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all">
              <h3 className="text-xl font-bold text-white mb-4">E-Commerce & Retail</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Product and policy questions from approved knowledge</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Enquiry capture and handoff</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Lead qualification workflows</li>
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all">
              <h3 className="text-xl font-bold text-white mb-4">B2B SaaS & Tech</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> L1 product Q&A from docs</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Demo and sales routing</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Pricing tier explanation from approved content</li>
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all">
              <h3 className="text-xl font-bold text-white mb-4">Services & Local Business</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Service and availability questions</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Pre-qualifying buyer intent</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Agent handoff for high-value leads</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-12 py-12 border-t border-white/5 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">Will the AI invent answers?</h4>
              <p className="text-slate-400">RAG configuration restricts answers to approved knowledge where implemented. Unknown questions should escalate or refuse rather than invent critical business facts.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">How long does implementation take?</h4>
              <p className="text-slate-400">Basic configuration can be fast once knowledge is prepared. Custom CRM and enterprise integrations are scoped per project.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">Can it hand off to a real person?</h4>
              <p className="text-slate-400">Yes, when handoff is configured — rules can route high-intent or complex queries to your team.</p>
            </div>
          </div>
        </section>

        <section className="relative rounded-[3rem] overflow-hidden border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md p-10 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto">
              Ready to deploy AI Agent?
            </h2>
            <p className="text-lg text-cyan-200/70 max-w-2xl mx-auto">
              Deploy via snippet or use the live assistant experience at /ai. Enterprise plans include onboarding and configuration within package scope.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Button asChild size="lg" className="bg-white text-cyan-950 hover:bg-cyan-50 px-8 py-6 rounded-full text-lg">
                <Link href="/contact">Request Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg">
                <Link href="/pricing">Compare Editions</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
