import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { aiWebsiteAgentsProductNode } from '@/lib/seo/schema';
import { ArrowRight, Bot, Zap, Globe, Database, Sparkles, Code2, LineChart, MessageSquare } from 'lucide-react';

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

        {/* INTEGRATIONS & ARCHITECTURE */}
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
