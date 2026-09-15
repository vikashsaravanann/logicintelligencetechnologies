import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink, GraduationCap, MapPin,
  Code2, Cpu, Workflow, Bot, ArrowRight, Mail, Award,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { SITE, FOUNDER_ID, breadcrumb, founderNode, organizationNode } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: `${FOUNDER.name} — ${FOUNDER.title} | ${FOUNDER.company}`,
  description: `Learn about ${FOUNDER.name}, ${FOUNDER.title} at ${FOUNDER.company}, specializing in AI systems, full-stack software, and autonomous workflow automation.`,
  alternates: { canonical: "/about/founder" },
  openGraph: {
    title: `${FOUNDER.name} — ${FOUNDER.title} | ${FOUNDER.company}`,
    description: `Meet ${FOUNDER.name}, ${FOUNDER.title} at ${FOUNDER.company}, working across AI systems, full-stack software engineering, intelligent automation, and autonomous workflows.`,
    url: `${SITE}/about/founder`,
    type: "profile",
    images: [{ url: FOUNDER.ogImageUrl, width: 1200, height: 630, alt: `${FOUNDER.name}, ${FOUNDER.title}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${FOUNDER.name} | Founder of ${FOUNDER.company}`,
    description: FOUNDER.shortBio,
    images: [FOUNDER.ogImageUrl],
  },
};

const expertise = [
  { icon: Cpu, title: "Artificial Intelligence & Data Science", body: "Structured AI systems, RAG pipelines, and deterministic orchestration around probabilistic models." },
  { icon: Code2, title: "Full-stack engineering", body: "Production web applications with Next.js, React, TypeScript, and solid backend architecture." },
  { icon: Bot, title: "Robotic Process Automation", body: "Headless browser automation and Playwright-based bots for high-volume workflow execution." },
  { icon: Workflow, title: "Systems architecture", body: "Schema validation, state-based automation, and maintainable software designed for scale." },
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
        about: { "@id": FOUNDER_ID },
        primaryImageOfPage: { "@type": "ImageObject", url: FOUNDER.imageUrl },
        breadcrumb: breadcrumb([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
          { name: "Founder", path: "/about/founder" },
        ]),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BackButton fallbackHref="/about" label="Back to About" />
      <section className="relative px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,320px)_1fr] gap-10 lg:gap-14 items-start">
          <div className="relative mx-auto lg:mx-0 w-full max-w-[320px]">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40">
              <Image src="/images/founder/vikash-saravanan-profile.webp" alt={`${FOUNDER.name} Profile`} fill priority className="object-cover object-top" sizes="(max-width: 768px) 280px, 320px" />
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">{FOUNDER.title}</p>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Leadership</p>
            <h1 className="uppercase text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2">{FOUNDER.name}</h1>
            <p className="text-lg sm:text-xl text-zinc-300 font-medium mb-6">{FOUNDER.title}</p>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6">{FOUNDER.shortBio}</p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-zinc-400 mb-8">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />{FOUNDER.location}</span>
              <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-primary" />{FOUNDER.education.institution}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a href={FOUNDER.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"> LinkedIn</a>
              <a href={FOUNDER.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"> GitHub</a>
              <a href={FOUNDER.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"><ExternalLink className="w-4 h-4" /> Portfolio</a>
              <a href={FOUNDER.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"> Instagram</a>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">About Vikash</h2>
          {FOUNDER.longBio.split("\n\n").map((para, i) => (
            <p key={i} className="text-zinc-400 leading-relaxed mb-4 text-base sm:text-lg">{para}</p>
          ))}
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">Technical focus</h2>
          <p className="text-zinc-500 text-center mb-10 max-w-2xl mx-auto">Core specializations applied across client platforms and internal systems at {FOUNDER.company}.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {expertise.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <item.icon className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <GraduationCap className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Education</h2>
                <p className="text-zinc-200 font-medium">{FOUNDER.education.degree}</p>
                <p className="text-zinc-400 mt-1">{FOUNDER.education.institution}</p>
                <p className="text-zinc-500 text-sm mt-1">{FOUNDER.education.location} · {FOUNDER.education.timeline}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Award className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="w-full">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="text-xl font-bold text-white">Credentials & Professional Training</h2>
                  <Link href="/certifications" className="text-xs text-primary font-bold hover:underline">
                    View All Certifications →
                  </Link>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="border-b border-white/5 pb-3">
                    <p className="text-sm font-semibold text-zinc-200">Data Analytics Professional Internship</p>
                    <p className="text-xs text-zinc-400">Edu Tantr · Professional Internship</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">The Joy of Computing using Python</p>
                    <p className="text-xs text-zinc-400">NPTEL · Technical Certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Selected engineering initiatives</h2>
          {FOUNDER.projects.map((project) => (
            <div key={project.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{project.name}</h3>
              <p className="text-zinc-400 mb-4 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {project.technologies.map((tech) => (
                  <span key={tech} className="text-xs font-medium px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300">{tech}</span>
                ))}
              </div>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline">View on GitHub <ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          ))}
          {FOUNDER.initiatives.map((initiative) => (
            <div key={initiative.project} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{initiative.project}</h3>
              <p className="text-zinc-400 font-medium mb-2">{initiative.role} at {initiative.organization}</p>
              <p className="text-zinc-400 leading-relaxed">{initiative.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 lg:px-8 py-14 sm:py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Building with {FOUNDER.company}</h2>
          <p className="text-zinc-400 leading-relaxed mb-8">As Founder and Lead Systems Engineer, Vikash leads product architecture, delivery quality, and client engagement. Every engagement is engineering-first: clear scope, production code, and systems designed to last.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/book-consultation" className="inline-flex items-center gap-2 rounded-full bg-primary text-black font-semibold px-6 py-3 hover:opacity-90 transition-opacity">Book a consultation <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-white/5 transition-colors">About the company</Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-white/5 transition-colors"><Mail className="w-4 h-4" /> Contact</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
