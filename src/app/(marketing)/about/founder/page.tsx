import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  GraduationCap,
  MapPin,
  Code2,
  Cpu,
  Workflow,
  Bot,
  ArrowRight,
  Mail,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  FileCheck,
} from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { SITE, breadcrumb, founderNode, organizationNode } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: `${FOUNDER.name} — ${FOUNDER.title} | ${FOUNDER.company}`,
  description: `Meet ${FOUNDER.name}, ${FOUNDER.title} at ${FOUNDER.company}. AI systems engineer, full-stack developer, and architect of Logic Voice, LIT Healthcare, and OmniPublisher AI.`,
  alternates: { canonical: "/about/founder" },
  openGraph: {
    title: `${FOUNDER.name} — ${FOUNDER.title}`,
    description: FOUNDER.shortBio,
    url: `${SITE}/about/founder`,
    type: "profile",
    images: [
      {
        url: "/images/founder/founder-about-main.jpg",
        width: 1200,
        height: 1200,
        alt: `${FOUNDER.name}, ${FOUNDER.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${FOUNDER.name} | Founder of ${FOUNDER.company}`,
    description: FOUNDER.shortBio,
    images: ["/images/founder/founder-about-main.jpg"],
  },
};

const expertise = [
  {
    icon: Cpu,
    title: "AI & DATA SYSTEMS",
    body: "RAG pipelines, constrained retrieval systems, and deterministic orchestration around LLM APIs — engineered so policies, facts, and calculations remain mathematically precise.",
  },
  {
    icon: Code2,
    title: "FULL-STACK ARCHITECTURE",
    body: "Next.js App Router, React 19, TypeScript, Python FastAPI, and Supabase systems with Row-Level Security, shipping as hardened production applications.",
  },
  {
    icon: Bot,
    title: "AUTONOMOUS RPA",
    body: "Playwright and headless browser orchestration for structured dynamic workflows — automated form execution, screening pipelines, and deterministic data extraction.",
  },
  {
    icon: Workflow,
    title: "SYSTEMS ARCHITECTURE",
    body: "Strict schema validation with Zod, state-machine-driven flows, offline-first asynchronous queues, and modular service boundaries designed for long-term ownership.",
  },
];

const gallery = [
  {
    src: "/images/founder/founder-about-main.jpg",
    alt: `${FOUNDER.name} — studio portrait`,
    caption: "Executive Studio",
  },
  {
    src: "/images/founder/founder-about-card.jpg",
    alt: `${FOUNDER.name} — portrait`,
    caption: "Systems Engineer",
  },
  {
    src: "/images/founder/vikash-lion-lounge.jpg",
    alt: `${FOUNDER.name} — Coimbatore`,
    caption: "Coimbatore, India",
  },
  {
    src: "/images/founder/vikash-banner.jpg",
    alt: `${FOUNDER.name} — profile`,
    caption: "Leadership & Vision",
  },
];

const principles = [
  {
    t: "PROTOTYPES OVER SLIDES",
    d: "A working interactive prototype beats a fifty-slide sales presentation. Prospective clients review genuine engineering direction prior to financial commitment.",
  },
  {
    t: "CONSTRAINED DETERMINISTIC AI",
    d: "Models answer strictly from verified ground-truth repositories. Invented numbers, hallucinated policies, and unvalidated outputs are treated as fatal defects.",
  },
  {
    t: "END-TO-END ARCHITECTURE OWNERSHIP",
    d: "Scoping, systems design, and delivery remain with the same engineering leadership. No handoffs to outsourced junior layers or disconnected third parties.",
  },
];

export default function FounderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      founderNode(),
      {
        "@type": "WebPage",
        "@id": `${SITE}/about/founder#webpage`,
        url: `${SITE}/about/founder`,
        name: `${FOUNDER.name} — ${FOUNDER.title}`,
        description: FOUNDER.shortBio,
        isPartOf: { "@id": `${SITE}/#website` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE}/images/founder/founder-about-main.jpg`,
        },
        breadcrumb: breadcrumb([
          { name: "Home", path: "/" },
          { name: "Company", path: "/about" },
          { name: "Founder", path: "/about/founder" },
        ]),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08] pb-16 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[640px] rounded-full bg-[#45D9D2]/10 blur-[130px]" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[420px] rounded-full bg-[#1565C0]/15 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-10">
          <div className="mb-8">
            <BackButton fallbackHref="/about" label="Back to Company" parentLabel="Company" inline forceFallback />
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#45D9D2]/30 bg-[#10131A] text-[#45D9D2] font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                FOUNDER &amp; CHIEF EXECUTIVE OFFICER
              </div>

              <h1 className="uppercase font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.04] mb-4 text-white">
                {FOUNDER.name}
              </h1>

              <p className="text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2] font-medium mb-4">
                AI Systems Engineer &amp; Full-Stack Architect
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-[#B5BECC] mb-6">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#45D9D2]" />
                  {FOUNDER.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#45D9D2]" />
                  B.Tech AI &amp; Data Science (2025–2029)
                </span>
              </div>

              <p className="text-base text-zinc-300 leading-relaxed max-w-xl mb-8">
                {FOUNDER.executiveOverview} He architects production software, intelligent voice systems, and enterprise healthcare platforms for organizations that require mathematical precision, strict security, and clear execution.
              </p>

              <div className="flex flex-wrap gap-3.5 mb-8">
                <Link
                  href="/contact"
                  className="lit-btn lit-btn-primary lit-btn-md"
                >
                  Start a Project Brief <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="lit-btn lit-btn--secondary lit-btn-md"
                >
                  <Calendar className="w-4 h-4 mr-2 text-[#45D9D2]" />
                  Book Technical Consultation
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={FOUNDER.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-white/10 bg-[#10131A] text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#45D9D2] hover:border-[#45D9D2]/30 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a
                  href={FOUNDER.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-white/10 bg-[#10131A] text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#45D9D2] hover:border-[#45D9D2]/30 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href={FOUNDER.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-white/10 bg-[#10131A] text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#45D9D2] hover:border-[#45D9D2]/30 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Instagram
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-white/10 bg-[#10131A] text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#45D9D2] hover:border-[#45D9D2]/30 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[4/5] max-h-[580px] w-full mx-auto rounded-3xl overflow-hidden border border-[#45D9D2]/30 bg-[#10131A] shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                <Image
                  src="/images/founder/founder-about-main.jpg"
                  alt={`${FOUNDER.name} — Founder of ${FOUNDER.company}`}
                  fill
                  priority
                  className="object-cover object-top sm:object-center"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="p-4 rounded-2xl bg-[#10131A]/90 backdrop-blur-md border border-white/10 shadow-lg">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#45D9D2] mb-1">
                      Logic Intelligence Technologies
                    </p>
                    <p className="text-sm font-display text-white font-bold">
                      Founder &amp; Lead Systems Engineer · Coimbatore, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Architectures Engineered by Founder */}
      <section className="py-20 md:py-24 border-b border-white/[0.08] bg-[#07090D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="lit-eyebrow mb-3 block">Production Portfolios</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white mb-4">
              Flagship Platforms &amp; Architectures
            </h2>
            <p className="text-[#B5BECC] text-base">
              Core systems and software platforms engineered, designed, and deployed under direct leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {FOUNDER.projects.map((proj) => (
              <div
                key={proj.name}
                className="rounded-2xl border border-white/10 bg-[#10131A] p-7 flex flex-col justify-between hover:border-[#45D9D2]/30 hover:bg-[#151922] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-10 h-10 rounded-xl bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center text-[#45D9D2]">
                      <Layers className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#45D9D2] bg-[#45D9D2]/10 px-2.5 py-1 rounded-full border border-[#45D9D2]/20">
                      Production System
                    </span>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">
                    {proj.name}
                  </h3>
                  <p className="text-sm text-[#B5BECC] leading-relaxed mb-6">
                    {proj.description}
                  </p>

                  <div className="mb-6">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#45D9D2] mb-2 font-bold">
                      Technical Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-300 bg-[#07090D] border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#45D9D2] hover:underline"
                  >
                    View System Specs <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Certifications & Credentials Gallery */}
      <section className="py-20 md:py-24 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="lit-eyebrow mb-3 block">Verified Credentials</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white mb-4">
              Accredited Certifications &amp; Diplomas
            </h2>
            <p className="text-[#B5BECC] text-base">
              Verified technical credentials across data analytics, Python, machine learning, and ethical hacking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOUNDER.credentials.map((cred, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#10131A] p-5 flex flex-col justify-between hover:border-[#45D9D2]/30 hover:bg-[#151922] transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center text-[#45D9D2]">
                      <FileCheck className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {cred.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-display font-bold text-white mb-1.5 line-clamp-2">
                    {cred.title}
                  </h3>
                  <p className="text-xs font-mono text-[#45D9D2]">
                    {cred.issuingOrganization}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Verified Credential
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portrait Gallery */}
      <section className="py-20 md:py-24 border-b border-white/[0.08] bg-[#07090D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="lit-eyebrow mb-2 block">Visual Archives</span>
              <h2 className="uppercase font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Leadership in Motion
              </h2>
            </div>
            <p className="text-sm text-[#B5BECC] max-w-md">
              The individual who scopes the architecture is the individual who oversees the code. Photography of {FOUNDER.name}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gallery.map((g) => (
              <figure
                key={g.src}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#10131A] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#07090D] via-[#07090D]/80 to-transparent">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#45D9D2]">
                    {g.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Biography & Academic Background */}
      <section className="py-20 md:py-24 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 p-7 rounded-2xl border border-white/10 bg-[#10131A] shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <span className="lit-eyebrow mb-3 block">Curriculum Vitae</span>
            <h2 className="uppercase font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-white">
              Academic &amp; Role
            </h2>
            <ul className="space-y-4 text-xs font-mono text-[#B5BECC]">
              <li className="flex gap-3 items-start">
                <Award className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">Founder &amp; CEO</strong>
                  <span>{FOUNDER.company}</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <GraduationCap className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">Undergraduate Degree</strong>
                  <span>{FOUNDER.education.degree}</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">Institution Campus</strong>
                  <span>{FOUNDER.education.institution}, {FOUNDER.education.location}</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <Calendar className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans text-sm">Degree Timeline</strong>
                  <span>{FOUNDER.education.timeline}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-8 space-y-5 text-[#B5BECC] leading-relaxed text-base">
            <span className="lit-eyebrow mb-3 block">Engineering Philosophy</span>
            <h2 className="uppercase font-display text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-white">
              Architecting Production Software
            </h2>
            {FOUNDER.longBio.split("\n\n").map((para, i) => (
              <p key={i} className="text-zinc-300 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Disciplines */}
      <section className="py-20 md:py-24 border-b border-white/[0.08] bg-[#07090D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="lit-eyebrow mb-3 block">Core Pillars</span>
            <h2 className="uppercase font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              How He Architects
            </h2>
            <p className="text-[#B5BECC] text-base">
              Systematic engineering principles applied across all platform deployments.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {expertise.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#10131A] p-7 hover:border-[#45D9D2]/30 hover:bg-[#151922] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#45D9D2]/10 border border-[#45D9D2]/20 flex items-center justify-center mb-5 text-[#45D9D2]">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-display font-bold uppercase tracking-wide text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[#B5BECC] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="py-20 md:py-24 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="lit-eyebrow mb-3 block">Operating Code</span>
            <h2 className="uppercase font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Guiding Engineering Rules
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {principles.map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-white/10 bg-[#10131A] p-7 hover:border-[#45D9D2]/30 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#45D9D2] mb-3">
                  {p.t}
                </h3>
                <p className="text-sm text-[#B5BECC] leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation & Project Brief CTA */}
      <section className="py-20 md:py-28 bg-[#07090D]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-8 sm:p-14 rounded-3xl border border-[#45D9D2]/30 bg-[#10131A] shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
            <span className="lit-eyebrow mb-3 block">Direct Engagement</span>
            <h2 className="uppercase font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Build Directly With Leadership
            </h2>
            <p className="text-[#B5BECC] mb-8 leading-relaxed max-w-xl mx-auto text-base">
              Scoping, systems architecture, and engineering delivery from the same desk. Submit your project requirements or reserve a technical consultation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="lit-btn lit-btn-primary lit-btn-lg justify-center"
              >
                Submit Project Brief <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/book-consultation"
                className="lit-btn lit-btn--secondary lit-btn-lg justify-center"
              >
                <Calendar className="w-4 h-4 mr-2 text-[#45D9D2]" />
                Book Technical Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
