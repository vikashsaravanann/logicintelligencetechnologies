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
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Logic Intelligence Technologies",
  description:
    "Logic Intelligence Technologies is an AI technology company based in Coimbatore, Tamil Nadu, India, developing intelligent AI products and automation solutions including Logic Voice, LIT Healthcare, and OmniPublisher AI.",
};

const values = [
  { title: "Transparent Pricing", desc: "Clear scope, fixed deliverables, and upfront cost before engineering begins — zero hidden invoices mid-project.", icon: Coins },
  { title: "Free Prototype Demo First", desc: "Review a functioning prototype demonstration of your product architecture before committing budget.", icon: PlayCircle },
  { title: "Applied AI Systems", desc: "Founded by an AI & Data Science engineer — we engineer AI models and agents only when they solve genuine operational friction.", icon: Sparkles },
  { title: "Direct Engineering Partnership", desc: "You collaborate directly with the systems architects who write the code — from discovery through production deployment.", icon: Handshake },
  { title: "Hardened Production Quality", desc: "Strict schema validation, row-level database security, zero-trust secrets handling, and automated test coverage.", icon: ShieldCheck },
  { title: "Startup Velocity, Enterprise Rigor", desc: "Rapid deployment cycles without sacrificing accessibility, performance, or long-term maintainability.", icon: Rocket },
];

const focusAreas = [
  { icon: Code2, title: "Full-Stack Web Architecture", body: "Next.js App Router, React 19, TypeScript, and hardened backends — high-performance platforms built to scale reliably." },
  { icon: Sparkles, title: "Practical AI & Voice Systems", body: "Constrained retrieval pipelines, voice-first intelligent interfaces, and synthetic voice defense systems engineered for business reliability." },
  { icon: Target, title: "Deterministic Milestone Delivery", body: "Fixed-scope packages and custom Statements of Work with explicit deliverables, ensuring transparency on every release." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent text-white pt-28 sm:pt-32">
      <BackToHome />
      <section className="relative py-16 sm:py-24 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/backdrops/about-hero.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 text-[#45D9D2] font-mono font-bold tracking-widest uppercase text-xs sm:text-sm mb-6 px-4 py-2 rounded-full border border-[#45D9D2]/25 bg-[#10131A]/90 backdrop-blur-md">
            <span className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5" />
              Logic Intelligence Technologies
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="text-zinc-300 normal-case font-medium">Where logic meets innovation.</span>
          </div>
          <h1 className="uppercase text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-[1.08] tracking-tight">
            An AI Technology Company Built To Ship
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
              Deterministic Systems For Modern Enterprise.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#B5BECC] max-w-3xl mx-auto leading-relaxed">
            {FOUNDER.companyOverview}
          </p>
        </div>
      </section>

      {/* Facts Strip */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Established", value: "2026" },
            { label: "Enterprise Entity", value: COMPANY.entityLabel },
            { label: "Headquarters", value: "Coimbatore, TN" },
            { label: "Core Competency", value: "AI · Web · Products" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[#10131A] p-5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors hover:border-[#45D9D2]/30">
              <p className="text-lg sm:text-xl font-display font-bold text-white uppercase tracking-wide">{item.value}</p>
              <p className="text-[10px] sm:text-xs font-mono text-[#45D9D2] uppercase tracking-widest mt-1.5 font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Spotlight Card */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-[#45D9D2]/25 bg-[#10131A] p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="grid lg:grid-cols-[minmax(240px,340px)_1fr] gap-10 lg:gap-14 items-center">
            <div className="flex flex-col items-center lg:items-stretch gap-5">
              <div className="w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border border-[#45D9D2]/30 bg-[#07090D] shadow-[0_10px_40px_rgba(69,217,210,0.15)] relative">
                <img
                  src="/images/founder/founder-about-card.jpg"
                  alt={`${COMPANY.founder.name} — ${COMPANY.founder.title}`}
                  className="w-full h-full min-h-[360px] object-cover object-[center_18%] block"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">{FOUNDER.name}</h2>
                <p className="text-[#45D9D2] font-mono font-bold text-xs uppercase tracking-widest mt-1">{FOUNDER.title}</p>
                <p className="text-[#B5BECC] text-xs mt-2 flex items-center justify-center lg:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#45D9D2]" />
                  {COMPANY.address}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <a href={FOUNDER.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1.5 px-4 rounded-xl border border-white/10 bg-[#151922] text-xs font-mono text-zinc-300 hover:text-[#45D9D2] hover:border-[#45D9D2]/30 transition-all">
                  <ExternalLink className="w-3 h-3" /> LinkedIn
                </a>
                <a href={`mailto:${COMPANY.email}`} className="inline-flex min-h-[40px] items-center gap-1.5 px-4 rounded-xl border border-white/10 bg-[#151922] text-xs font-mono text-zinc-300 hover:text-[#45D9D2] hover:border-[#45D9D2]/30 transition-all">
                  <Mail className="w-3 h-3" /> Email
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-[#45D9D2] bg-[#45D9D2]/10 border border-[#45D9D2]/20">
                Founder Profile
              </span>
              <div className="space-y-4 text-sm sm:text-base text-[#B5BECC] leading-relaxed">
                <p>{FOUNDER.shortBio}</p>
              </div>
              <div className="pt-2">
                <Link href="/about/founder" className="lit-btn lit-btn-primary lit-btn-md">
                  View Executive Biography &amp; Credentials <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="lit-eyebrow mb-3 block">Specialized Disciplines</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3 uppercase tracking-tight">
            What We Build
          </h2>
          <p className="text-[#B5BECC] max-w-2xl mx-auto text-sm sm:text-base">
            Product-minded systems engineering across cloud architecture, intelligent voice platforms, and enterprise automation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {focusAreas.map((item) => (
            <div key={item.title} className="p-7 rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] hover:border-[#45D9D2]/30 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="w-12 h-12 rounded-xl bg-[#151922] border border-white/10 flex items-center justify-center text-[#45D9D2] mb-5">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#B5BECC] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Operating Principles */}
      <section className="py-12 sm:py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="lit-eyebrow mb-3 block">Engineering Code</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3 uppercase tracking-tight">
            What We Stand For
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v) => (
            <div key={v.title} className="p-6 border border-white/10 bg-[#10131A] rounded-2xl hover:bg-[#151922] hover:border-[#45D9D2]/30 transition-all duration-300 flex gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="w-10 h-10 rounded-xl bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center text-[#45D9D2] shrink-0">
                <v.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-display font-bold text-white mb-1.5">{v.title}</h4>
                <p className="text-[#B5BECC] text-xs sm:text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto text-center mb-16">
        <div className="p-8 sm:p-12 rounded-3xl border border-[#45D9D2]/25 bg-[#10131A] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Ready to Engineer Your Platform?
          </h2>
          <p className="text-[#B5BECC] mb-8 text-sm sm:text-base max-w-xl mx-auto">
            Request a free prototype demonstration and review a tangible direction for your platform before financial commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/free-demo" className="lit-btn lit-btn-primary lit-btn-lg w-full sm:w-auto justify-center">
              Request Free Demo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <a href={`tel:${COMPANY.phone}`} className="lit-btn lit-btn--secondary lit-btn-lg w-full sm:w-auto justify-center">
              <Phone className="w-4 h-4 mr-2" /> {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>

      <FloatingElements />
    </div>
  );
}
