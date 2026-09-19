import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { aiWebsiteAgentsProductNode } from '@/lib/seo/schema';
import { ArrowRight, Bot, Zap, Globe, Database, Sparkles, Code2, LineChart, MessageSquare } from 'lucide-react';
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: 'AI Website Agents | Logic Intelligence Technologies',
  description: 'Turn website visitors into conversations, qualified leads and customers with our AI Website Agents.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-website-agents',
  }
};

export default function AIWebsiteAgentsPage() {
  return (
    <main className="relative min-h-screen bg-[#050A15] text-slate-100 overflow-hidden font-sans">
      <BackToHome />
      {/* Dynamic Background Effect specific to AI Website Agents (Cyan/Blue Theme) */}
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
        
        {/* HERO SECTION */}
        <section className="text-center space-y-8 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Website Conversion</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-500 max-w-4xl mx-auto leading-tight">
            Turn passive traffic into active pipeline.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI Website Agents designed to answer visitor questions using approved business knowledge, qualify leads in real-time, capture enquiries, and support seamless human handoff.
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

        {/* METRICS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: "3x", label: "Average Lead Capture Rate Increase", icon: LineChart },
            { value: "24/7", label: "Autonomous Support & Engagement", icon: Zap },
            { value: "<1s", label: "Response Latency Global Average", icon: Bot }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center backdrop-blur-xl hover:bg-white/[0.04] transition-colors">
              <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-4 opacity-80" />
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* CORE CAPABILITIES */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Engineered for Enterprise Conversion</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Not just a chatbot. A fully integrated conversational conversion engine trained specifically on your business data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Retrieval-Augmented Generation",
                desc: "Ingests your PDFs, website pages, and internal docs. Answers strictly using approved company knowledge.",
                icon: Database
              },
              {
                title: "Real-Time Lead Qualification",
                desc: "Dynamically asks qualifying questions (budget, timeline, industry) before handing off to human sales reps.",
                icon: MessageSquare
              },
              {
                title: "Omnichannel CRM Sync",
                desc: "Automatically pushes chat transcripts and captured lead profiles directly into your existing CRM pipeline.",
                icon: Code2
              },
              {
                title: "Multilingual Support",
                desc: "Instantly understands and replies in over 50 languages, expanding your market reach globally without translation overhead.",
                icon: Globe
              },
              {
                title: "Seamless Human Handoff",
                desc: "Detects frustration, high-intent, or complex queries and seamlessly routes the chat to live support agents.",
                icon: Bot
              },
              {
                title: "Actionable Analytics",
                desc: "Tracks drop-off points, common questions, and conversation metrics to continuously refine your marketing strategy.",
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

        {/* HOW IT WORKS */}
        <section className="space-y-16 py-12 border-t border-white/5">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">How it Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From raw data to a fully autonomous sales agent in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-y-1/2 z-0" />
            
            {[
              {
                step: "01",
                title: "Connect Knowledge",
                desc: "Securely upload your PDFs, internal wikis, or just provide your website URL. The AI instantly ingests and vectorizes your company knowledge."
              },
              {
                step: "02",
                title: "Configure & Train",
                desc: "Define the agent's personality, set strict conversational boundaries, and integrate with your CRM to handle lead routing."
              },
              {
                step: "03",
                title: "Deploy & Convert",
                desc: "Embed a simple JavaScript snippet on your site. The agent immediately begins engaging visitors, qualifying leads, and booking meetings 24/7."
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

        {/* USE CASES */}
        <section className="space-y-16 py-12 border-t border-white/5">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Built for Every Industry</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Tailored conversational experiences that drive results across verticals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all">
              <h3 className="text-xl font-bold text-white mb-4">E-Commerce & Retail</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Automated product recommendations</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Real-time order tracking support</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Abandoned cart recovery chats</li>
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all">
              <h3 className="text-xl font-bold text-white mb-4">B2B SaaS & Tech</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Instant technical support (L1)</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Automated demo scheduling</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Pricing and feature tier explanation</li>
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all">
              <h3 className="text-xl font-bold text-white mb-4">Real Estate & Services</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Property detail inquiries 24/7</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Pre-qualifying buyer intent</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-500" /> Agent handoff for high-value leads</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-12 py-12 border-t border-white/5 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">Will the AI hallucinate or invent answers?</h4>
              <p className="text-slate-400">No. Our Retrieval-Augmented Generation (RAG) architecture restricts the AI to only answer using the exact documents and URLs you provide. If it doesn't know the answer, it escalates to a human.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">How long does it take to implement?</h4>
              <p className="text-slate-400">Basic deployment takes less than 5 minutes—just upload your data and copy-paste the snippet. Enterprise custom integrations typically take 1-2 weeks depending on CRM complexity.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-2">Can it hand off to a real person?</h4>
              <p className="text-slate-400">Absolutely. You can set rules (e.g., if a user asks for 'pricing' or 'human') where the AI instantly alerts your sales team via Slack/Teams and seamlessly hands over the chat.</p>
            </div>
          </div>
        </section>
        <section className="relative rounded-[3rem] overflow-hidden border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md p-10 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto">
              Ready to automate your digital front door?
            </h2>
            <p className="text-lg text-cyan-200/70 max-w-2xl mx-auto">
              Our AI Website Agents can be deployed via a simple JavaScript snippet. Enterprise plans include white-glove onboarding and custom model fine-tuning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Button asChild size="lg" className="bg-white text-cyan-950 hover:bg-cyan-50 px-8 py-6 rounded-full text-lg">
                <Link href="/contact">Request Enterprise Demo</Link>
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
