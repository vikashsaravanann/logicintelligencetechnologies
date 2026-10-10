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
  description: `Meet ${FOUNDER.name}, ${FOUNDER.title} at ${FOUNDER.company}. AI systems engineer, full-stack developer, and architect of Logic Voice, LIT Healthcare, and Voice Shield.`,
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
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
  },
  {
    icon: Code2,
    title: "FULL-STACK ARCHITECTURE",
    body: "Next.js App Router, React 19, TypeScript, Python FastAPI, and Supabase systems with Row-Level Security, shipping as hardened production applications.",
    accent: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
  },
  {
    icon: Bot,
    title: "AUTONOMOUS RPA",
    body: "Playwright and headless browser orchestration for structured dynamic workflows — automated form execution, screening pipelines, and deterministic data extraction.",
    accent: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  },
  {
    icon: Workflow,
    title: "SYSTEMS ARCHITECTURE",
    body: "Strict schema validation with Zod, state-machine-driven flows, offline-first asynchronous queues, and modular service boundaries designed for long-term ownership.",
    accent: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
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
    badge: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
  },
  {
    t: "CONSTRAINED DETERMINISTIC AI",
    d: "Models answer strictly from verified ground-truth repositories. Invented numbers, hallucinated policies, and unvalidated outputs are treated as fatal defects.",
    badge: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
  },
  {
    t: "END-TO-END ARCHITECTURE OWNERSHIP",
    d: "Scoping, systems design, and delivery remain with the same engineering leadership. No handoffs to outsourced junior layers or disconnected third parties.",
    badge: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
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
    <div className="min-h-screen bg-white text-[var(--lit-ink)] selection:bg-[#E7F3FF] selection:text-[#1565C0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-gradient-to-b from-[#F0F7FF] via-[#FAFBFF] to-[#FFFFFF] pt-28 pb-16 sm:pt-36 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <BackButton fallbackHref="/about" label="Back to Company" parentLabel="Company" inline forceFallback />
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#BFDBFE] bg-[#E7F3FF] text-[#1565C0] font-mono text-[11px] font-semibold uppercase tracking-[0.16em] mb-5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1FA9A2]" />
                <span>Founder &amp; Chief Executive Officer</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-4 text-[var(--lit-ink)]">
                {FOUNDER.name}
              </h1>

              <p className="text-xl sm:text-2xl font-serif italic text-[var(--lit-blue)] mb-4">
                AI Systems Engineer &amp; Full-Stack Architect
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-[var(--lit-text-muted)] mb-6">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#1FA9A2]" />
                  {FOUNDER.location}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-4 h-4 text-[#1FA9A2]" />
                  B.Tech AI &amp; Data Science (2025–2029)
                </span>
              </div>

              <p className="text-base text-[var(--lit-text-muted)] leading-relaxed max-w-xl mb-8">
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
                  className="lit-btn bg-white border border-[#DFE7EF] text-[var(--lit-ink)] hover:border-[#BFDBFE] hover:bg-[#F7F9FC] lit-btn-md shadow-2xs"
                >
                  <Calendar className="w-4 h-4 mr-2 text-[var(--lit-blue)]" />
                  Book Technical Consultation
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={FOUNDER.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-[#DFE7EF] bg-white text-xs font-mono uppercase tracking-wider text-slate-700 hover:text-[var(--lit-blue)] hover:border-[#BFDBFE] shadow-2xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1FA9A2]" /> LinkedIn
                </a>
                <a
                  href={FOUNDER.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-[#DFE7EF] bg-white text-xs font-mono uppercase tracking-wider text-slate-700 hover:text-[var(--lit-blue)] hover:border-[#BFDBFE] shadow-2xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1FA9A2]" /> GitHub
                </a>
                <a
                  href={FOUNDER.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-[#DFE7EF] bg-white text-xs font-mono uppercase tracking-wider text-slate-700 hover:text-[var(--lit-blue)] hover:border-[#BFDBFE] shadow-2xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1FA9A2]" /> Instagram
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-[#DFE7EF] bg-white text-xs font-mono uppercase tracking-wider text-slate-700 hover:text-[var(--lit-blue)] hover:border-[#BFDBFE] shadow-2xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#1FA9A2]" /> Email
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[4/5] max-h-[580px] w-full mx-auto rounded-3xl overflow-hidden border border-[#DFE7EF] bg-[#F7F9FC] shadow-xl group">
                <Image
                  src="/images/founder/founder-about-main.jpg"
                  alt={`${FOUNDER.name} — Founder of ${FOUNDER.company}`}
                  fill
                  priority
                  className="object-cover object-top sm:object-center transition-transform duration-700 ease-out group-hover:scale-102"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#DFE7EF] shadow-lg">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-blue)] mb-1">
                      Logic Intelligence Technologies
                    </p>
                    <p className="text-sm font-display text-[var(--lit-ink)] font-bold">
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
      <section className="py-20 md:py-24 border-b border-[#DFE7EF] bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1565C0] bg-[#E7F3FF] border border-[#BFDBFE] mb-3">
              Production Portfolios
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[var(--lit-ink)] mb-4">
              Flagship Platforms &amp; Architectures
            </h2>
            <p className="text-[var(--lit-text-muted)] text-base">
              Core systems and software platforms engineered, designed, and deployed under direct leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {FOUNDER.projects.map((proj) => (
              <div
                key={proj.name}
                className="rounded-2xl border border-[#DFE7EF] bg-white p-7 flex flex-col justify-between hover:border-[#1FA9A2]/40 hover:shadow-lg transition-all duration-300 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#BFDBFE] flex items-center justify-center text-[var(--lit-blue)]">
                      <Layers className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                      Production System
                    </span>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-[var(--lit-ink)] mb-3 tracking-tight">
                    {proj.name}
                  </h3>
                  <p className="text-sm text-[var(--lit-text-muted)] leading-relaxed mb-6">
                    {proj.description}
                  </p>

                  <div className="mb-6">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--lit-blue)] mb-2 font-bold">
                      Technical Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700 bg-[#F7F9FC] border border-[#DFE7EF]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#DFE7EF]">
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--lit-blue)] hover:text-[#1FA9A2] hover:underline"
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
      <section className="py-20 md:py-24 border-b border-[#DFE7EF] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] mb-3">
              Verified Credentials
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-[var(--lit-ink)] mb-4">
              Accredited Certifications &amp; Diplomas
            </h2>
            <p className="text-[var(--lit-text-muted)] text-base">
              Verified technical credentials across data analytics, Python, machine learning, and systems engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOUNDER.credentials.map((cred, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#DFE7EF] bg-white p-5 flex flex-col justify-between hover:border-[#1FA9A2]/40 hover:shadow-md transition-all duration-300 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-[#E7F3FF] border border-[#BFDBFE] flex items-center justify-center text-[var(--lit-blue)]">
                      <FileCheck className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      {cred.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-display font-bold text-[var(--lit-ink)] mb-1.5 line-clamp-2">
                    {cred.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--lit-blue)] font-medium">
                    {cred.issuingOrganization}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DFE7EF] flex items-center gap-1.5 text-[11px] font-mono text-[#059669] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" /> Verified Credential
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portrait Gallery */}
      <section className="py-20 md:py-24 border-b border-[#DFE7EF] bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#7C3AED] bg-[#F1ECFF] border border-[#DDD6FE] mb-2">
                Visual Archives
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--lit-ink)]">
                Leadership in Motion
              </h2>
            </div>
            <p className="text-sm text-[var(--lit-text-muted)] max-w-md">
              The individual who scopes the architecture is the individual who oversees the code. Photography of {FOUNDER.name}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gallery.map((g) => (
              <figure
                key={g.src}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#DFE7EF] bg-white shadow-sm"
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-white">
                    {g.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Biography & Academic Background */}
      <section className="py-20 md:py-24 border-b border-[#DFE7EF] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 p-7 rounded-2xl border border-[#DFE7EF] bg-[#F7F9FC] shadow-xs">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1565C0] bg-[#E7F3FF] border border-[#BFDBFE] mb-3">
              Curriculum Vitae
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 text-[var(--lit-ink)]">
              Academic &amp; Role
            </h2>
            <ul className="space-y-4 text-xs font-mono text-[var(--lit-text-muted)]">
              <li className="flex gap-3 items-start">
                <Award className="w-4 h-4 text-[var(--lit-blue)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--lit-ink)] block font-sans text-sm font-bold">Founder &amp; CEO</strong>
                  <span>{FOUNDER.company}</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <GraduationCap className="w-4 h-4 text-[var(--lit-blue)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--lit-ink)] block font-sans text-sm font-bold">Undergraduate Degree</strong>
                  <span>{FOUNDER.education.degree}</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[var(--lit-blue)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--lit-ink)] block font-sans text-sm font-bold">Institution Campus</strong>
                  <span>{FOUNDER.education.institution}, {FOUNDER.education.location}</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <Calendar className="w-4 h-4 text-[var(--lit-blue)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--lit-ink)] block font-sans text-sm font-bold">Degree Timeline</strong>
                  <span>{FOUNDER.education.timeline}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-8 space-y-5 text-[var(--lit-text-muted)] leading-relaxed text-base">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] mb-3">
              Engineering Philosophy
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-[var(--lit-ink)]">
              Architecting Production Software
            </h2>
            {FOUNDER.longBio.split("\n\n").map((para, i) => (
              <p key={i} className="text-slate-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Disciplines */}
      <section className="py-20 md:py-24 border-b border-[#DFE7EF] bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1565C0] bg-[#E7F3FF] border border-[#BFDBFE] mb-3">
              Core Pillars
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--lit-ink)] mb-4">
              How He Architects
            </h2>
            <p className="text-[var(--lit-text-muted)] text-base">
              Systematic engineering principles applied across all platform deployments.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {expertise.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#DFE7EF] bg-white p-7 hover:border-[#1FA9A2]/40 hover:shadow-md transition-all duration-300 shadow-xs"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${item.accent}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-display font-bold tracking-tight text-[var(--lit-ink)] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--lit-text-muted)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="py-20 md:py-24 border-b border-[#DFE7EF] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#7C3AED] bg-[#F1ECFF] border border-[#DDD6FE] mb-3">
              Operating Code
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--lit-ink)] mb-4">
              Guiding Engineering Rules
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {principles.map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-[#DFE7EF] bg-white p-7 hover:border-[#1FA9A2]/40 hover:shadow-md transition-all duration-300 shadow-2xs"
              >
                <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider mb-4 border ${p.badge}`}>
                  {p.t}
                </span>
                <p className="text-sm text-[var(--lit-text-muted)] leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation & Project Brief CTA (Canonical Deep Navy Canvas) */}
      <section className="py-20 md:py-28 bg-[#F7F9FC]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-8 sm:p-14 rounded-3xl border border-[#0B2545] bg-[var(--lit-navy)] text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,169,162,0.2),transparent_55%)] pointer-events-none" />

            <span className="relative inline-block px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-[#45D9D2] bg-[#45D9D2]/10 border border-[#45D9D2]/25 mb-3">
              Direct Engagement
            </span>

            <h2 className="relative font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
              Build Directly With Leadership
            </h2>

            <p className="relative text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto text-base">
              Scoping, systems architecture, and engineering delivery from the same desk. Submit your project requirements or reserve a technical consultation.
            </p>

            <div className="relative flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="lit-btn lit-btn-primary lit-btn-lg justify-center"
              >
                Submit Project Brief <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/book-consultation"
                className="lit-btn bg-white/10 hover:bg-white/20 text-white border border-white/20 lit-btn-lg justify-center"
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

