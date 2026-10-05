import { Metadata } from "next";
import Link from "next/link";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
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
  ArrowRight,
} from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

export const metadata: Metadata = {
  title: "About Us | Logic Intelligence Technologies",
  description:
    "Logic Intelligence Technologies is an AI technology company based in Coimbatore, Tamil Nadu, India, developing intelligent AI products and automation solutions including Logic Voice and VoiceShield.",
};

const values = [
  { title: "Transparent pricing", desc: "Clear scope and cost before work begins — no surprise invoices mid-project.", icon: Coins },
  { title: "Free demo first", desc: "See a working direction for your product before you commit budget.", icon: PlayCircle },
  { title: "AI-native product thinking", desc: "Founded by an AI & Data Science specialist — we integrate AI only when it solves a real workflow.", icon: Sparkles },
  { title: "Direct partnership", desc: "You work with the people building the product — from discovery through launch and support.", icon: Handshake },
  { title: "Built for production", desc: "Clean architecture, documented handoff, and hosting practices that keep systems stable after go-live.", icon: ShieldCheck },
  { title: "Startup speed, serious quality", desc: "We move fast without cutting corners on security, accessibility, or maintainability.", icon: Rocket },
];

const focusAreas = [
  { icon: Code2, title: "Full-stack web products", body: "Next.js, React, TypeScript, and solid backends — sites and apps that are fast, secure, and easy to extend." },
  { icon: Sparkles, title: "Practical AI systems", body: "RAG assistants, automation, and model workflows designed for business use — not demos that never ship." },
  { icon: Target, title: "Fixed-scope delivery", body: "Packages and custom SOWs with milestones, so you always know what is in scope and what ships next." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-transparent text-white pt-28 sm:pt-32">
      <BackToHome />
      <section className="relative py-14 sm:py-20 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&h=900&q=80" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10">
            <Rocket className="w-3.5 h-3.5" />
            Coimbatore technology startup
          </span>
          <h1 className="uppercase text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            A startup built to ship
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              real software for real businesses.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            {FOUNDER.companyOverview}
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Founded", value: "2026" },
            { label: "Type", value: COMPANY.entityLabel },
            { label: "HQ", value: "Coimbatore, TN" },
            { label: "Focus", value: "Web · AI · Product" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
              <p className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide">{item.value}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mt-1 font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-6 sm:p-10 md:p-12">
          <div className="grid lg:grid-cols-[minmax(220px,340px)_1fr] gap-10 lg:gap-14 items-start">
            <div className="flex flex-col items-center lg:items-stretch gap-5">
              <div className="w-full max-w-[340px] aspect-[3/4] rounded-3xl overflow-hidden border-2 border-primary/30 bg-[#070b16] ">
                <img
                  src="/images/founder/founder-about-card.jpg"
                  alt={`${COMPANY.founder.name} — ${COMPANY.founder.title}`}
                  className="w-full h-full min-h-[380px] object-cover object-[center_18%] block"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{FOUNDER.name}</h2>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">{FOUNDER.title}</p>
                <p className="text-zinc-500 text-xs mt-2 flex items-center justify-center lg:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {COMPANY.address}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <a href={FOUNDER.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/30 transition-all">
                  <ExternalLink className="w-3 h-3" /> LinkedIn
                </a>
                <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 hover:text-primary hover:border-primary/30 transition-all">
                  <Mail className="w-3 h-3" /> Email
                </a>
              </div>
            </div>
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20">Founder</span>
              <div className="space-y-4 text-sm sm:text-[15px] text-zinc-400 leading-relaxed">
                <p>{FOUNDER.shortBio}</p>
              </div>
              <Link href="/about/founder" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                Read full profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">What we build</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            Product-minded engineering across web, commerce, and applied AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {focusAreas.map((item) => (
            <div key={item.title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <item.icon className="w-7 h-7 text-primary mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">What we stand for</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v) => (
            <div key={v.title} className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl hover:bg-white/5 transition-colors flex gap-4">
              <v.icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-white mb-1">{v.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 px-6 lg:px-8 max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Want to build with us?</h2>
        <p className="text-zinc-400 mb-8 text-sm sm:text-base">Book a free demo and see a clear path for your product before you invest.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/free-demo" className="inline-flex px-8 py-4 rounded-xl text-sm font-bold text-black bg-primary hover:brightness-110 transition-all">
            Book free demo
          </Link>
          <a href={`tel:${COMPANY.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/5 transition-colors">
            <Phone className="w-4 h-4" /> {COMPANY.phone}
          </a>
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
