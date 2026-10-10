"use client";

import BackButton from "@/components/navigation/back-button";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { PortfolioProject } from "@/data/portfolioData";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
  videoUrl?: string;
  rating?: number;
};

export default function CaseStudyContent({
  project,
  linkedTestimonial,
}: {
  project: PortfolioProject;
  linkedTestimonial?: Testimonial;
}) {
  const isCaseStudy = Boolean(project.problem || project.solution || project.metrics?.length);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <article className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <BackButton fallbackHref="/work" label="Back to Case Studies" inline />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
              {project.category}
            </span>
            {project.client && (
              <span className="inline-block px-3 py-1 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-slate-600 text-xs font-medium shadow-2xs">
                Client: {project.client}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] leading-tight mb-6 tracking-tight">
            {project.title}
          </h1>

          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-medium tracking-wide text-slate-700 bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-video md:aspect-[21/9] relative rounded-2xl overflow-hidden mb-14 border border-[var(--lit-border-light,#DFE7EF)] shadow-md bg-white">
          <Image src={project.image} alt={project.title} fill className="object-cover" priority />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Key Outcomes / Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-14">
              {project.metrics.map((m) => (
                <div
                  key={m.label}
                  className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white flex flex-col items-center justify-center text-center shadow-xs hover:border-[#1565C0]/40 transition-colors"
                >
                  <p className="text-xl sm:text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-1.5">{m.value}</p>
                  <p className="text-xs text-[#1565C0] font-mono tracking-wider uppercase font-semibold">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          {isCaseStudy ? (
            <div className="space-y-8 mb-14">
              {project.problem && (
                <section className="p-8 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs">
                  <h2 className="text-xl font-bold font-poppins text-amber-900 mb-3 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 block shrink-0" />
                    The Challenge &amp; Problem Statement
                  </h2>
                  <p className="leading-relaxed text-base md:text-lg text-slate-700 font-normal">
                    {project.problem}
                  </p>
                </section>
              )}

              {project.solution && (
                <section className="p-8 rounded-2xl border border-teal-200 bg-teal-50/40 shadow-xs">
                  <h2 className="text-xl font-bold font-poppins text-teal-900 mb-3 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-teal-500 block shrink-0" />
                    The Engineering Solution
                  </h2>
                  <p className="leading-relaxed text-base md:text-lg text-slate-700 font-normal">
                    {project.solution}
                  </p>
                </section>
              )}

              {project.results && (
                <section className="p-8 md:p-10 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white relative overflow-hidden shadow-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wider uppercase mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Delivered Impact
                  </div>
                  <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">
                    Production Outcome
                  </h2>
                  <p className="text-base md:text-lg text-slate-700 leading-relaxed font-normal">
                    {project.results}
                  </p>
                </section>
              )}
            </div>
          ) : (
            project.results && (
              <section className="p-8 md:p-10 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white mb-14 relative overflow-hidden shadow-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wider uppercase mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Delivered Impact
                </div>
                <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-3">
                  Production Outcome
                </h2>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed font-normal">
                  {project.results}
                </p>
              </section>
            )
          )}

          {linkedTestimonial && (
            <div className="mb-14">
              <blockquote className="p-8 md:p-10 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs relative">
                <p className="text-lg md:text-xl text-[var(--lit-navy,#0B2545)] font-serif italic leading-relaxed mb-6">
                  “{linkedTestimonial.quote}”
                </p>
                <footer className="flex items-center gap-4">
                  {linkedTestimonial.avatar && (
                    <Image
                      src={linkedTestimonial.avatar}
                      alt={linkedTestimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-[#1565C0]/20 object-cover"
                    />
                  )}
                  <div>
                    <div className="font-bold text-[var(--lit-navy,#0B2545)] text-sm">{linkedTestimonial.name}</div>
                    <div className="text-xs text-slate-500">
                      {linkedTestimonial.role} at {linkedTestimonial.company}
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] shadow-sm text-center flex items-center justify-center gap-2 transition-all"
            >
              <span>Start a Similar Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[var(--lit-navy,#0B2545)] bg-white hover:bg-slate-50 transition-colors text-center inline-flex items-center justify-center gap-2 border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
