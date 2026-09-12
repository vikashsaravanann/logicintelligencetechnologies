import { Metadata } from "next";
import Link from "next/link";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { COMPANY } from "@/config/company";
import {
  ExternalLink,
  Mail,
  Phone,
  Coins,
  PlayCircle,
  Sparkles,
  Handshake,
  ShieldCheck,
  MapPin,
  Rocket,
  Code2,
  Target,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Technology Startup in Coimbatore",
  description:
    "Logic Intelligence Technologies is a Coimbatore-based technology startup building production web apps, e-commerce, and practical AI systems — transparent pricing, free demo before you pay.",
  openGraph: {
    title: "About Logic Intelligence Technologies — Coimbatore Tech Startup",
    description:
      "Meet the team behind Logic Intelligence Technologies. Founded by Vikash Saravanan, we build production web apps, e-commerce platforms, and AI systems for businesses across India.",
    images: [
      {
        url: "/assets/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies",
      },
    ],
  },
};

const values = [
  {
    title: "Transparent pricing",
    desc: "Clear scope and cost before work begins — no surprise invoices mid-project.",
    icon: Coins,
  },
  {
    title: "Free demo first",
    desc: "See a working direction for your product before you commit budget.",
    icon: PlayCircle,
  },
  {
    title: "AI-native product thinking",
    desc: "Founded by an AI & Data Science specialist — we integrate AI only when it solves a real workflow.",
    icon: Sparkles,
  },
  {
    title: "Direct partnership",
    desc: "You work with the people building the product — from discovery through launch and support.",
    icon: Handshake,
  },
  {
    title: "Built for production",
    desc: "Clean architecture, documented handoff, and hosting practices that keep systems stable after go-live.",
    icon: ShieldCheck,
  },
  {
    title: "Startup speed, serious quality",
    desc: "We move fast without cutting corners on security, accessibility, or maintainability.",
    icon: Rocket,
  },
];

const focusAreas = [
  {
    icon: Code2,
    title: "Full-stack web products",
    body: "Next.js, React, TypeScript, and solid backends — sites and apps that are fast, secure, and easy to extend.",
  },
  {
    icon: Sparkles,
    title: "Practical AI systems",
    body: "RAG assistants, automation, and model workflows designed for business use — not demos that never ship.",
  },
  {
    icon: Target,
    title: "Fixed-scope delivery",
    body: "Packages and custom SOWs with milestones, so you always know what is in scope and what ships next.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 sm:pt-32">
      <BackToHome />

      {/* Hero */}
      <section className="relative py-14 sm:py-20 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/backdrops/about-hero.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10">
          <Rocket className="w-3.5 h-3.5" />
          Coimbatore technology startup
        </span>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
          A startup built to ship
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            real software for real businesses.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          {COMPANY.displayName} is a technology startup based in Coimbatore,
          Tamil Nadu. We design and build production websites, e-commerce
          platforms, and AI-integrated systems for teams that want modern
          software without traditional agency overhead.
        </p>
        </div>
      </section>

      {/* Snapshot */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Founded", value: "2026" },
            { label: "Type", value: COMPANY.entityLabel },
            { label: "HQ", value: "Coimbatore, TN" },
            { label: "Focus", value: "Web · AI · Product" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center"
            >
              <p className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                {item.value}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mt-1 font-semibold">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-6 sm:p-10 md:p-12">
          <div className="grid lg:grid-cols-[minmax(220px,340px)_1fr] gap-10 lg:gap-14 items-start">
            <div className="flex flex-col items-center lg:items-stretch gap-5">
              <div className="w-full max-w-[340px] rounded-3xl overflow-hidden border-2 border-primary/30 bg-[#070b16] shadow-[0_0_40px_rgba(0,191,255,0.12)]">
                <img
                  src={COMPANY.founder.photoPath}
                  alt={`${COMPANY.founder.name} — ${COMPANY.founder.title}`}
                  className="w-full h-auto object-contain object-top block"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {COMPANY.founder.name}
                </h2>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
                  {COMPANY.founder.title} · {COMPANY.entityLabel}
                </p>
                <p className="text-zinc-500 text-xs mt-2 flex items-center justify-center lg:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {COMPANY.address}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <a
                  href={COMPANY.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> LinkedIn
                </a>
                <a
                  href={COMPANY.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 hover:text-[#e1306c] hover:border-[#e1306c]/30 transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> Instagram
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 hover:text-primary hover:border-primary/30 transition-all"
                >
                  <Mail className="w-3 h-3" /> Email
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20">
                Founder's note
              </span>
              <blockquote className="text-base sm:text-lg text-zinc-200 leading-relaxed border-l-2 border-primary/40 pl-4">
                I started Logic Intelligence Technologies to close the gap between
                classroom AI and software that businesses can actually run —
                priced in the open, demoed before payment, and built to last after
                launch.
              </blockquote>
              <div className="space-y-4 text-sm sm:text-[15px] text-zinc-400 leading-relaxed">
                <p>
                  I am a B.Tech student in Artificial Intelligence and Data Science
                  at Rathinam Technical Campus, Coimbatore, and a Microsoft Student
                  Campus Ambassador. Day to day I lead LIT as a technology startup:
                  full-stack product work (React, Next.js, FastAPI, Python) and
                  production AI — LoRA / QLoRA fine-tuning, local RAG pipelines,
                  and assistants that sit on real company data instead of generic
                  chat.
                </p>
                <p>
                  The studio exists for founders and operators who need dependable
                  engineering, not slide decks. Every engagement starts with a
                  written scope, an honest timeline, and a path to a working
                  product. Clients see direction in a free demo before they pay.
                </p>
                <p>
                  We ship Digital Launch, Business Pro, and Enterprise packs from
                  Coimbatore to teams across India — websites, commerce, internal
                  tools, and AI systems — with source-code ownership on full
                  payment and support that continues after go-live.
                </p>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  ["Education", "B.Tech AI & Data Science, Rathinam Technical Campus"],
                  ["Role", "Founder, Logic Intelligence Technologies"],
                  ["Campus", "Microsoft Student Campus Ambassador"],
                  ["Focus", "Full-stack products · RAG · LLM fine-tuning"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                      {k}
                    </dt>
                    <dd className="text-sm text-zinc-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Our story</h2>
          <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
            {COMPANY.displayName} began in Coimbatore as a focused technology startup —
            built to give growing businesses production-grade web and AI products without
            traditional agency overhead.
          </p>
        </div>

        <div className="space-y-14 sm:space-y-20">
          {/* Block 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 order-2 md:order-1">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Origin</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Started where engineering lives</h3>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                In 2026 we set up in Coimbatore — India&apos;s engineering city — to work
                alongside founders and operators who need software that ships. The brief was
                never to be the biggest agency; it was to be the most dependable product partner
                for clear scope, honest timelines, and measurable outcomes.
              </p>
              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                We remain an independent technology startup — lean, accountable, and close to
                the work — not a private limited corporate shell.
              </p>
            </div>
            <div className="relative h-[260px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/10 order-1 md:order-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85"
                alt="Modern studio workspace in Coimbatore"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-bold text-sm">Coimbatore HQ mindset</p>
                <p className="text-zinc-400 text-xs">Engineering-first product studio</p>
              </div>
            </div>
          </div>

          {/* Block 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative h-[260px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85"
                alt="Collaborative product team workshop"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-bold text-sm">Partnership over proposals</p>
                <p className="text-zinc-400 text-xs">Discovery → build → launch</p>
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">How we work</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Clarity before code</h3>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                Clients come to us after confusing quotes and template sites sold as custom work.
                Our process starts with discovery, a transparent package or SOW, and — when the
                scope fits — a free demo so you can see direction before you invest.
              </p>
              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                You work directly with the people building the product. That keeps feedback fast
                and decisions grounded in what will actually ship.
              </p>
            </div>
          </div>

          {/* Block 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 order-2 md:order-1">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">What we ship</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Web products &amp; practical AI</h3>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                From marketing sites and commerce to internal tools and AI assistants, we focus on
                systems that stay maintainable after launch — documented handoff, sensible hosting,
                and AI only when it improves a real workflow.
              </p>
              <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                Whether you need a Digital Launch Pack or a custom enterprise build, the standard
                is the same: professional delivery, honest communication, and software your team
                can run with confidence.
              </p>
            </div>
            <div className="relative h-[260px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/10 order-1 md:order-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=85"
                alt="Technology and AI product development"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-bold text-sm">Production-ready systems</p>
                <p className="text-zinc-400 text-xs">Web · AI · long-term support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">What we build</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Product-minded engineering across web, commerce, and applied AI —
            tailored to the stage your business is in.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {focusAreas.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <item.icon className="w-7 h-7 text-primary mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">Mission</h3>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Deliver modern, AI-aware digital products to businesses of every size
              — with transparent costs, clear timelines, and results you can measure
              after launch.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">Vision</h3>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Become the technology partner Coimbatore and India&apos;s growing
              businesses trust for software that ships — helping them compete with
              the same tools enterprises use, without enterprise friction.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
          What we stand for
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v) => (
            <div
              key={v.title}
              className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl hover:bg-white/5 transition-colors flex gap-4"
            >
              <v.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-white mb-1">{v.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 lg:px-8 max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Want to build with us?
        </h2>
        <p className="text-zinc-400 mb-8 text-sm sm:text-base">
          Book a free demo and see a clear path for your product before you invest.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/free-demo"
            className="inline-flex px-8 py-4 rounded-xl text-sm font-bold text-black bg-primary hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,191,255,0.25)]"
          >
            Book free demo
          </Link>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/5 transition-colors"
          >
            <Phone className="w-4 h-4" /> {COMPANY.phone}
          </a>
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
