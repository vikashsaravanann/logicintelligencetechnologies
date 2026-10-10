import { Metadata } from 'next';
import Link from 'next/link';
import { aiVoiceAgentsProductNode } from '@/lib/seo/schema';
import { ArrowRight, PhoneCall, Mic, CalendarCheck, ShieldCheck, Zap, Workflow, Server, Activity, HelpCircle } from 'lucide-react';
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: 'AI Voice Agents | Autonomous Inbound Telephony | Logic Intelligence Technologies',
  description: 'AI Voice Agents by Logic Intelligence Technologies — conversational phone workflows, appointment scheduling, structured extraction, and deterministic human escalation.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-voice-agents',
  }
};

export default function AIVoiceAgentsPage() {
  return (
    <div className="relative min-h-screen bg-[#07090D] text-slate-100 overflow-x-hidden selection:bg-primary selection:text-slate-950 pt-32 pb-24">
      <BackToHome href="/products" label="Back to Products" />
      
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(69,217,210,0.1),_transparent_70%)] blur-[120px]" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [aiVoiceAgentsProductNode()],
          }),
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-32">
        
        {/* Hero */}
        <section className="text-center space-y-8 pt-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10131A] border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase">
            <Mic className="w-4 h-4" />
            <span>Autonomous Telephony Intelligence</span>
          </div>
          
          <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold tracking-tight text-white uppercase leading-[1.05]">
            Autonomous AI Front Desk for <span className="bg-gradient-to-r from-primary via-[#6DE6E0] to-[#1565C0] bg-clip-text text-transparent">Business Calls</span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Engineered voice agents designed for handling inbound enquiries, qualifying callers, managing live appointment calendars, extracting structured CRM entities, and bridging to human operators.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-all"
            >
              <span>View Plans &amp; Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/15 bg-[#10131A] hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Consult an Architect</span>
            </Link>
          </div>
        </section>

        {/* Highlights Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Key Highlights">
          {[
            { value: "Sub-150ms", label: "Speech pipeline latency targets", icon: Zap },
            { value: "Deterministic", label: "Strict calendar & CRM extraction", icon: Workflow },
            { value: "Safe Escalation", label: "Automated PSTN/SIP human handoff", icon: Activity }
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
              Capabilities Beyond Legacy IVR Menus
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-light">
              Replace rigid dial-pad trees with natural spoken dialogue that handles complex inquiries and executes business logic over telephony networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Inbound Call Routing",
                desc: "Replaces traditional IVR. The agent understands natural language intent and routes calls or resolves customer queries autonomously.",
                icon: PhoneCall
              },
              {
                title: "Live Calendar Synchronization",
                desc: "Integrates with Google Calendar and Outlook to check real-time availability and confirm bookings while on the phone with the customer.",
                icon: CalendarCheck
              },
              {
                title: "Structured Entity Extraction",
                desc: "Extracts validated customer entities (names, order IDs, phone numbers, addresses) and writes directly to connected databases via REST webhooks.",
                icon: Server
              },
              {
                title: "Carrier & SIP Trunking",
                desc: "Connects to telephony providers such as Twilio, Telnyx, or your existing on-premise PBX infrastructure via SIP/WebSocket streaming.",
                icon: Workflow
              },
              {
                title: "Deterministic Escalation",
                desc: "If the caller requests a representative or intent complexity exceeds guardrails, the call bridges immediately to your on-call human staff.",
                icon: ShieldCheck
              },
              {
                title: "Provider-Abstracted Inference",
                desc: "Speech-to-text, LLM reasoning, and text-to-speech providers are abstracted to optimize latency, cost, and acoustic quality under your chosen stack.",
                icon: Zap
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

        {/* 3-Step Deployment Workflow */}
        <section className="space-y-12 py-12 border-t border-white/10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Deployment Architecture
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-light">
              Structured rollout from conversation mapping to live telephony integration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Define Business Workflows",
                desc: "Map conversation boundaries, intake questionnaires, validation rules, and connect calendar or CRM webhooks."
              },
              {
                step: "02",
                title: "Voice Model & Acoustic Tuning",
                desc: "Select neural TTS voices aligned to your brand across supported languages with pronunciation dictionaries."
              },
              {
                step: "03",
                title: "Telephony Routing & Activation",
                desc: "Connect your business number via SIP trunking or PSTN forwarding. Deploy with live testing and monitoring."
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

        {/* Industry Verticals */}
        <section className="space-y-12 py-12 border-t border-white/10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Proven Across High-Volume Telephony
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-light">
              Engineered for operations where missed calls lead to customer churn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">Clinics &amp; Healthcare</h3>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Patient appointment scheduling &amp; reschedules</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Pre-appointment SMS/voice confirmation</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Clinic location, timings, and prep instructions</li>
              </ul>
            </div>
            
            <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">Logistics &amp; Fleet</h3>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Automated parcel tracking and status lookup</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Driver dispatch notifications &amp; ETA queries</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Rescheduling failed or missed deliveries</li>
              </ul>
            </div>

            <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 space-y-4">
              <h3 className="text-lg font-bold text-white">Hospitality &amp; Bookings</h3>
              <ul className="space-y-3 text-xs text-slate-300 font-light">
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Table and room reservation inquiries</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Operating hours, menus, and amenities FAQ</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" /> Peak-hour call overflow resolution</li>
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
            <p className="text-xs font-mono text-slate-500 uppercase">Acoustic &amp; Architectural Transparency</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-white">Can callers identify that they are speaking with an AI?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Voice realism and latency depend on the configured STT, LLM, and TTS providers. We follow strict AI ethics guidelines and mandate clear disclosure that callers are interacting with an AI system.
              </p>
            </div>
            
            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-white">How many concurrent telephone calls can the system handle?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Concurrency is governed by your telephony provider SIP trunk capacity, server infrastructure, and plan limits — never marketed as arbitrary infinite capacity.
              </p>
            </div>

            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-white">How does human escalation function mid-call?</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                When a caller requests a representative or triggers safety boundaries, the telephony engine performs a blind or warm transfer to your designated fallback telephone line.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative rounded-3xl overflow-hidden border border-primary/30 bg-[#10131A] p-8 md:p-16 text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
              Deploy Your First AI Voice Agent
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
              From $149/mo + setup under commercial packaging. Modernize your front desk telephony with conversational intelligence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#6DE6E0] transition-colors"
              >
                <span>Request Voice Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-[#151922] text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                <span>Compare Pricing Tiers</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
