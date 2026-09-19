import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { aiVoiceAgentsProductNode } from '@/lib/seo/schema';
import { ArrowRight, PhoneCall, Mic, CalendarCheck, ShieldCheck, Zap, Workflow, Server, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Voice Agents | Logic Intelligence Technologies',
  description: 'AI-powered voice agents designed for business calls, enquiry handling, lead qualification, appointment workflows, structured extraction and human escalation.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-voice-agents',
  }
};

export default function AIVoiceAgentsPage() {
  return (
    <main className="relative min-h-screen bg-[#0A0515] text-slate-100 overflow-hidden font-sans">
      {/* Dynamic Background Effect specific to AI Voice Agents (Fuchsia/Purple Theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[50%] bg-fuchsia-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-[20%] w-[50%] h-[40%] bg-pink-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [aiVoiceAgentsProductNode()],
          }),
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-8 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium tracking-wide uppercase">
            <Mic className="w-4 h-4" />
            <span>Enterprise Voice Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-fuchsia-100 to-fuchsia-500 max-w-4xl mx-auto leading-tight">
            Your autonomous AI front desk for business calls.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI-powered voice agents designed for handling inbound enquiries, qualifying leads over the phone, managing appointment workflows, extracting structured call data, and escalating to human agents.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button asChild size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all shadow-[0_0_40px_-10px_rgba(192,38,211,0.5)] hover:shadow-[0_0_60px_-10px_rgba(192,38,211,0.7)]">
              <Link href="/pricing">
                View Pricing & Plans <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all">
              <Link href="/contact">
                Talk to an Expert
              </Link>
            </Button>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: "∞", label: "Concurrent Call Capacity", icon: Workflow },
            { value: "<800ms", label: "Voice-to-Voice Latency", icon: Zap },
            { value: "100%", label: "Call Data Extraction", icon: Activity }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center backdrop-blur-xl hover:bg-white/[0.04] transition-colors">
              <stat.icon className="w-8 h-8 text-fuchsia-400 mx-auto mb-4 opacity-80" />
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* CORE CAPABILITIES */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Capabilities beyond standard IVR</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Replace rigid menu trees with natural, conversational intelligence that handles complex workflows over telephony networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Inbound Call Routing",
                desc: "Replaces traditional IVR. The agent understands natural language intent and routes calls or handles them autonomously.",
                icon: PhoneCall
              },
              {
                title: "Live Appointment Workflows",
                desc: "Integrates with Google Calendar to check live availability and schedule bookings directly while on the phone with the customer.",
                icon: CalendarCheck
              },
              {
                title: "Structured Data Extraction",
                desc: "Listens to the caller, extracts key entities (names, addresses, IDs), and formats them into JSON for your CRM.",
                icon: Server
              },
              {
                title: "SIP Trunking Integration",
                desc: "Connects seamlessly to Twilio, Vonage, or your existing PBX infrastructure via SIP/WebSocket streaming.",
                icon: Workflow
              },
              {
                title: "Human Escalation Protocol",
                desc: "If the caller requests a human or the intent is beyond scope, the AI automatically transfers the active call to a human agent.",
                icon: ShieldCheck
              },
              {
                title: "Ultra-Low Latency Inference",
                desc: "Powered by Deepgram STT and specialized LLMs to achieve sub-second conversational latency, preventing awkward pauses.",
                icon: Zap
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 hover:border-fuchsia-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative rounded-[3rem] overflow-hidden border border-fuchsia-500/20 bg-fuchsia-950/20 backdrop-blur-md p-10 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/40 via-transparent to-transparent" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto">
              Deploy your first AI Voice Agent.
            </h2>
            <p className="text-lg text-fuchsia-200/70 max-w-2xl mx-auto">
              From $149/mo + setup. Stop missing calls and start automating your front desk telephony with intelligent conversational AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Button asChild size="lg" className="bg-white text-fuchsia-950 hover:bg-fuchsia-50 px-8 py-6 rounded-full text-lg">
                <Link href="/contact">Request Voice Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg">
                <Link href="/pricing">Compare Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
