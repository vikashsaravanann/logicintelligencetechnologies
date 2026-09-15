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
  } from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { SITE, breadcrumb, founderNode, organizationNode } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: `${FOUNDER.name} — ${FOUNDER.title} | ${FOUNDER.company}`,
  description: `Meet ${FOUNDER.name}, ${FOUNDER.title} at ${FOUNDER.company}. AI systems, full-stack engineering, and autonomous workflows from Coimbatore.`,
  alternates: { canonical: "/about/founder" },
  openGraph: {
    title: `${FOUNDER.name} — ${FOUNDER.title}`,
    description: FOUNDER.shortBio,
    url: `${SITE}/about/founder`,
    type: "profile",
    images: [
      {
        url: "/images/founder/vikash-studio-portrait.jpg",
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
    images: ["/images/founder/vikash-studio-portrait.jpg"],
  },
};

const expertise = [
  {
    icon: Cpu,
    title: "AI & DATA SYSTEMS",
    body: "RAG pipelines, constrained knowledge bases, and deterministic orchestration around LLM APIs — built so prices and policies stay accurate.",
  },
  {
    icon: Code2,
    title: "FULL-STACK PRODUCT",
    body: "Next.js, React, TypeScript, FastAPI, and Supabase systems that ship as production applications, not demos.",
  },
  {
    icon: Bot,
    title: "AUTOMATION",
    body: "Playwright and headless workflows for structured digital work — form execution, screening flows, and repeatable ops.",
  },
  {
    icon: Workflow,
    title: "SYSTEMS ARCHITECTURE",
    body: "Schema validation, state machines, RLS, and maintainable service boundaries designed for long-term ownership.",
  },
];

const gallery = [
  {
    src: "/images/founder/vikash-studio-portrait.jpg",
    alt: `${FOUNDER.name} — studio portrait`,
    caption: "Studio",
  },
  {
    src: "/images/founder/vikash-dessert-portrait.jpg",
    alt: `${FOUNDER.name} — portrait`,
    caption: "Portrait",
  },
  {
    src: "/images/founder/vikash-lion-lounge.jpg",
    alt: `${FOUNDER.name} — Coimbatore`,
    caption: "Coimbatore",
  },
  {
    src: "/images/founder/vikash-pine-forest.jpg",
    alt: `${FOUNDER.name} — outdoors`,
    caption: "Outdoors",
  },
];

const principles = [
  {
    t: "SHIP BEFORE SLIDES",
    d: "A working prototype beats a polished deck. Clients see direction before they pay.",
  },
  {
    t: "CONSTRAINED AI",
    d: "Models answer from verified company facts. Invented prices and policies are treated as defects.",
  },
  {
    t: "OWNERSHIP",
    d: "Architecture, delivery, and follow-through stay with the same team that scoped the work.",
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
          url: `${SITE}/images/founder/vikash-studio-portrait.jpg`,
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
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-[640px] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[420px] rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="mb-8">
            <BackButton fallbackHref="/about" label="Back to Company" parentLabel="Company" inline forceFallback />
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
                FOUNDER
              </p>
              <h1 className="uppercase text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-4">
                {FOUNDER.name}
              </h1>
              <p className="text-lg sm:text-xl text-zinc-300 font-medium mb-3">
                {FOUNDER.title}
              </p>
              <p className="text-sm text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {FOUNDER.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  B.Tech AI &amp; Data Science
                </span>
              </p>
              <p className="text-base text-zinc-300 leading-relaxed max-w-xl mb-8">
                {FOUNDER.executiveOverview} He builds production software and AI systems for
                businesses that need clarity on scope, pricing, and delivery — not theatre.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors"
                >
                  Start a project <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-sm font-bold uppercase tracking-wide hover:bg-white/10 transition-colors"
                >
                  Book consultation
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={FOUNDER.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a
                  href={FOUNDER.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href={FOUNDER.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Instagram
                </a>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold uppercase tracking-wide text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] max-h-[560px] w-full mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,191,255,0.12)]">
                <Image
                  src="/images/founder/vikash-studio-portrait.jpg"
                  alt={`${FOUNDER.name} — Founder of ${FOUNDER.company}`}
                  fill
                  priority
                  className="object-cover object-[center_20%]"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                    Logic Intelligence Technologies
                  </p>
                  <p className="text-sm text-white/90 font-medium">
                    Founder &amp; Lead Systems Engineer · Coimbatore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-2">
                PORTRAITS
              </p>
              <h2 className="uppercase text-2xl sm:text-3xl font-black tracking-tight">
                Beyond the desk
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              The same person who writes the architecture also owns delivery. These are recent
              photographs of {FOUNDER.name}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {gallery.map((g) => (
              <figure
                key={g.src}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]"
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
                    {g.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-2">
              PROFILE
            </p>
            <h2 className="uppercase text-2xl sm:text-3xl font-black tracking-tight mb-4">
              Who he is
            </h2>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                Founder of {FOUNDER.company}
              </li>
              <li className="flex gap-2">
                <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {FOUNDER.education.degree}
              </li>
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {FOUNDER.education.institution}
              </li>
            </ul>
          </div>
          <div className="lg:col-span-8 space-y-5 text-zinc-300 leading-relaxed text-[15px] sm:text-base">
            <p>{FOUNDER.shortBio}</p>
            <p>
              Logic Intelligence Technologies is run as a focused digital engineering studio:
              fixed-scope packages where they fit, custom architecture where they do not, and a free
              demo path so buyers can see direction before payment. The work spans marketing sites,
              operational software, and AI assistants grounded in company knowledge rather than open
              internet guesses.
            </p>
            <p>
              Outside client delivery, Vikash experiments with autonomous workflow engines and
              evaluation discipline — golden-set checks for pricing answers, retrieval quality, and
              the gap between a demo chatbot and something sales can trust.
            </p>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-16 md:py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-2">
            CAPABILITIES
          </p>
          <h2 className="uppercase text-2xl sm:text-3xl font-black tracking-tight mb-10">
            Where the work lands
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {expertise.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-primary/30 hover:bg-white/[0.05] transition-colors"
              >
                <item.icon className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-2">
            OPERATING STYLE
          </p>
          <h2 className="uppercase text-2xl sm:text-3xl font-black tracking-tight mb-10">
            How decisions get made
          </h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {principles.map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
              >
                <h3 className="text-sm font-black uppercase tracking-wide text-white mb-3">
                  {p.t}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="uppercase text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Build with the same person who scopes the work
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Share the problem, the constraints, and the timeline. You will get a clear plan — and
            when it fits, a free demo direction — before any payment.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/free-demo"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-black text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors"
            >
              Request free demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-sm font-bold uppercase tracking-wide hover:bg-white/5 transition-colors"
            >
              About the company
            </Link>
            <a
              href={FOUNDER.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-sm font-bold uppercase tracking-wide hover:bg-white/5 transition-colors"
            >
              LinkedIn <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
