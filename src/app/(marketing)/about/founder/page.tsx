import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink, Github, LinkedIn, Instagram, GraduationCap, MapPin,
  Code2, Cpu, Workflow, Bot, ArrowRight, Mail,
} from "lucide-react";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { FOUNDER } from "@/config/founder";
import { SITE, FOUNDER_ID, breadcrumb, founderNode, organizationNode } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Vikash Saravanan — Founder & Lead Systems Engineer",
  description: FOUNDER.oneLine,
  alternates: { canonical: "/about/founder" },
  openGraph: {
    title: "Vikash Saravanan | Founder of Logic Intelligence Technologies",
    description: FOUNDER.shortBio,
    url: `${SITE}/about/founder`,
    type: "profile",
    images: [{ url: FOUNDER.images.og, width: 1200, height: 630, alt: FOUNDER.images.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vikash Saravanan | Founder of Logic Intelligence Technologies",
    description: FOUNDER.shortBio,
    images: [FOUNDER.images.og],
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
        name: "Vikash Saravanan — Founder & Lead Systems Engineer",
        description: FOUNDER.shortBio,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": FOUNDER_ID },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}${FOUNDER.images.profile}` },
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
      <BackToHome />
      <section className="relative px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,320px)_1fr] gap-10 lg:gap-14 items-start">
          <div className="relative mx-auto lg:mx-0 w-full max-w-[320px]">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40">
              <Image src={FOUNDER.images.profile} alt={FOUNDER.images.alt} fill priority className="object-cover object-top" sizes="(max-width: 768px) 280px, 320px" />
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">Founder & Lead Systems Engineer</p>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Leadership</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2">{FOUNDER.fullName}</h1>
            <p className="text-lg sm:text-xl text-zinc-300 font-medium mb-6">{FOUNDER.title}</p>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-6">{FOUNDER.shortBio}</p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-zinc-400 mb-8">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" />{FOUNDER.location}</span>
              <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-primary" />{FOUNDER.education.institution}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a href={FOUNDER.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"><LinkedIn className="w-4 h-4" /> LinkedIn</a>
              <a href={FOUNDER.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"><Github className="w-4 h-4" /> GitHub</a>
              <a href={FOUNDER.links.portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"><ExternalLink className="w-4 h-4" /> Portfolio</a>
              <a href={FOUNDER.links.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 hover:border-primary/40 hover:bg-primary/10 transition-colors"><Instagram className="w-4 h-4" /> Instagram</a>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">About Vikash</h2>
          {FOUNDER.extendedBio.split("\n\n").map((para, i) => (
            <p key={i} className="text-zinc-400 leading-relaxed mb-4 text-base sm:text-lg">{para}</p>
          ))}
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">Technical focus</h2>
          <p className="text-zinc-500 text-center mb-10 max-w-2xl mx-auto">Core specializations applied across client platforms and internal systems at {COMPANY.displayName}.</p>
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
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-start gap-4">
            <GraduationCap className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Education</h2>
              <p className="text-zinc-200 font-medium">{FOUNDER.education.degree}</p>
              <p className="text-zinc-400 mt-1">{FOUNDER.education.institution}</p>
              <p className="text-zinc-500 text-sm mt-1">{FOUNDER.education.location} · Expected graduation {FOUNDER.education.expectedGraduation}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 lg:px-8 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Selected engineering initiative</h2>
          {FOUNDER.projects.map((project) => (
            <div key={project.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
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
        </div>
      </section>
      <section className="px-6 lg:px-8 py-14 sm:py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Building with Logic Intelligence Technologies</h2>
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
