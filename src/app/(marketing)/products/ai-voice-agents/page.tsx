import { Metadata } from 'next';
import Link from 'next/link';
import { aiVoiceAgentsProductNode, breadcrumb } from '@/lib/seo/schema';
import {
  ArrowRight,
  PhoneCall,
  Mic,
  CalendarCheck,
  ShieldCheck,
  Zap,
  Workflow,
  Server,
  Activity,
  CheckCircle2,
  HelpCircle,
  Building2,
  Truck,
  Hotel,
} from 'lucide-react';
import BackButton from '@/components/navigation/back-button';

export const metadata: Metadata = {
  title: 'AI Voice Agents | Autonomous Inbound Telephony | Logic Intelligence Technologies',
  description:
    'AI Voice Agents by Logic Intelligence Technologies — conversational phone workflows, appointment scheduling, structured extraction, and deterministic human escalation.',
  alternates: {
    canonical: 'https://www.logicintelligencetechnologies.in/products/ai-voice-agents',
  },
};

export default function AIVoiceAgentsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              aiVoiceAgentsProductNode(),
              breadcrumb([
                { name: 'Home', path: '/' },
                { name: 'Products', path: '/products' },
                { name: 'AI Voice Agents', path: '/products/ai-voice-agents' },
              ]),
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <BackButton fallbackHref="/products" label="Back to Products" inline />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {/* Hero Section */}
        <section aria-label="AI Voice Agents Hero" className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FA9A2]/10 border border-[#1FA9A2]/25 shadow-2xs">
            <Mic className="w-3.5 h-3.5 text-[#1FA9A2]" aria-hidden />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0E7A74]">
              Autonomous Telephony Intelligence · Voice-First AI
            </span>
          </div>

          <h1 className="text-[clamp(2.25rem,5.2vw,4.5rem)] font-bold tracking-tight text-[var(--lit-navy,#0B2545)] uppercase leading-[1.08]">
            Autonomous AI Front Desk for{' '}
            <span className="block text-[var(--lit-blue,#1565C0)] font-serif italic font-normal normal-case">
              Business Calls
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[var(--lit-text-muted,#52677C)] max-w-3xl mx-auto leading-relaxed font-normal">
            Engineered voice agents designed for handling inbound enquiries, qualifying callers,
            managing live appointment calendars, extracting structured CRM entities, and bridging
            seamlessly to human operators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/pricing"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#1565C0] text-white font-semibold text-sm transition-all shadow-xs"
            >
              <span>View Plans &amp; Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-[var(--lit-navy,#0B2545)] font-semibold text-sm transition-all shadow-xs"
            >
              <span>Consult an Architect</span>
            </Link>
          </div>
        </section>

        {/* Highlights Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Key Highlights">
          {[
            {
              value: 'Sub-150ms',
              label: 'Speech pipeline latency targets',
              icon: Zap,
              color: 'text-[#1565C0]',
              bg: 'bg-[#E7F3FF]',
            },
            {
              value: 'Deterministic',
              label: 'Strict calendar & CRM extraction',
              icon: Workflow,
              color: 'text-[#0E7A74]',
              bg: 'bg-[#1FA9A2]/10',
            },
            {
              value: 'Safe Escalation',
              label: 'Automated PSTN/SIP human handoff',
              icon: Activity,
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
              Telephony Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Capabilities Beyond{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Legacy IVR Menus
              </span>
            </h2>
            <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Replace rigid dial-pad trees with natural spoken dialogue that handles complex inquiries
              and executes business logic over telephony networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Inbound Call Routing',
                desc: 'Replaces traditional IVR. The agent understands natural language intent and routes calls or resolves customer queries autonomously.',
                icon: PhoneCall,
                bg: 'bg-[#E7F3FF]',
                color: 'text-[#1565C0]',
              },
              {
                title: 'Live Calendar Synchronization',
                desc: 'Integrates with Google Calendar and Outlook to check real-time availability and confirm bookings while on the phone with the customer.',
                icon: CalendarCheck,
                bg: 'bg-[#ECFDF5]',
                color: 'text-[#059669]',
              },
              {
                title: 'Structured Entity Extraction',
                desc: 'Extracts validated customer entities (names, order IDs, phone numbers, addresses) and writes directly to connected databases via REST webhooks.',
                icon: Server,
                bg: 'bg-[#F1ECFF]',
                color: 'text-[#7C3AED]',
              },
              {
                title: 'Carrier & SIP Trunking',
                desc: 'Connects to telephony providers such as Twilio, Telnyx, or your existing on-premise PBX infrastructure via SIP/WebSocket streaming.',
                icon: Workflow,
                bg: 'bg-[#FFF4D9]',
                color: 'text-[#B45309]',
              },
              {
                title: 'Deterministic Escalation',
                desc: 'If the caller requests a representative or intent complexity exceeds guardrails, the call bridges immediately to your on-call human staff.',
                icon: ShieldCheck,
                bg: 'bg-[#FCEAF3]',
                color: 'text-[#BE185D]',
              },
              {
                title: 'Provider-Abstracted Inference',
                desc: 'Speech-to-text, LLM reasoning, and text-to-speech providers are abstracted to optimize latency, cost, and acoustic quality under your chosen stack.',
                icon: Zap,
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

        {/* 3-Step Deployment Workflow */}
        <section className="space-y-10 sm:space-y-12 py-10 sm:py-16 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider">
              Step-by-Step Rollout
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Deployment{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Architecture
              </span>
            </h2>
            <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Structured rollout from conversation boundary mapping to live carrier telephony integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Define Business Workflows',
                desc: 'Map conversation boundaries, intake questionnaires, validation rules, and connect calendar or CRM webhooks.',
              },
              {
                step: '02',
                title: 'Voice Model & Acoustic Tuning',
                desc: 'Select neural TTS voices aligned to your brand across supported languages with custom pronunciation dictionaries.',
              },
              {
                step: '03',
                title: 'Telephony Routing & Activation',
                desc: 'Connect your business number via SIP trunking or PSTN forwarding. Deploy with simulated load testing and active logging.',
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

        {/* Industry Verticals */}
        <section className="space-y-10 sm:space-y-12 py-10 sm:py-16 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold uppercase tracking-wider">
              Proven Applications
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Engineered for{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                High-Volume Telephony
              </span>
            </h2>
            <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Designed for mission-critical operations where missed or queued calls lead to customer churn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Clinics &amp; Healthcare</h3>
              <ul className="space-y-3 text-xs text-[var(--lit-ink,#121826)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Patient appointment scheduling &amp; reschedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Pre-appointment SMS/voice confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>Clinic location, timings, and prep instructions</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] flex items-center justify-center text-[#1565C0]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Logistics &amp; Fleet</h3>
              <ul className="space-y-3 text-xs text-[var(--lit-ink,#121826)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>Automated parcel tracking and status lookup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>Driver dispatch notifications &amp; ETA queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>Rescheduling failed or missed deliveries</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-7 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F1ECFF] flex items-center justify-center text-[#7C3AED]">
                <Hotel className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Hospitality &amp; Bookings</h3>
              <ul className="space-y-3 text-xs text-[var(--lit-ink,#121826)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Table and room reservation inquiries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Operating hours, menus, and amenities FAQ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                  <span>Peak-hour call overflow resolution</span>
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
              Transparency
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Frequently Asked{' '}
              <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
                Questions
              </span>
            </h2>
            <p className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase">
              Acoustic &amp; Architectural Specifications
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 space-y-2 shadow-xs">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                Can callers identify that they are speaking with an AI?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Voice realism and latency depend on the configured STT, LLM, and TTS providers. We follow strict AI ethics guidelines and mandate clear disclosure that callers are interacting with an AI system.
              </p>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 space-y-2 shadow-xs">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                How many concurrent telephone calls can the system handle?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Concurrency is governed by your telephony provider SIP trunk capacity, server infrastructure, and plan limits — never marketed as arbitrary infinite capacity.
              </p>
            </div>

            <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-6 space-y-2 shadow-xs">
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                How does human escalation function mid-call?
              </h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                When a caller requests a representative or triggers safety boundaries, the telephony engine performs a blind or warm transfer to your designated fallback telephone line.
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
                Ready to Deploy?
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Deploy Your First{' '}
              <span className="font-serif italic font-normal text-[#45D9D2]">
                AI Voice Agent
              </span>
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              From $149/mo + setup under commercial packaging. Modernize your front desk telephony with conversational intelligence.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#1FA9A2] to-[#45D9D2] text-[var(--lit-navy,#0B2545)] font-bold text-sm hover:brightness-105 shadow-md transition-all"
              >
                <span>Request Voice Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <span>Compare Pricing Tiers</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
