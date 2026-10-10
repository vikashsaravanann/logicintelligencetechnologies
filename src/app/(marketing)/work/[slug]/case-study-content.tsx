"use client";

import { motion } from "framer-motion";
import BackButton from "@/components/navigation/back-button";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { PortfolioProject } from "@/data/portfolioData";
import PageShell from "@/components/layout/page-shell";

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <PageShell>
      <div className="min-h-screen text-white pt-24 lg:pt-32 pb-24 overflow-hidden relative">
        {/* Background ambient glows */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[85%] h-[55%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[65%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
        </div>

        <article className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
          <div className="mb-10">
            <BackButton fallbackHref="/work" label="Back to Case Studies" inline />
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-3xl mx-auto">
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {project.category}
                </span>
                {project.client && (
                  <span className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-xs font-medium">
                    Client: {project.client}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                {project.title}
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
                {project.description}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-12">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-medium tracking-wide text-zinc-300 bg-[#151922] border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full aspect-video md:aspect-[21/9] relative rounded-2xl overflow-hidden mb-16 border border-white/10 shadow-2xl bg-black/40"
          >
            <Image src={project.image} alt={project.title} fill className="object-cover" priority />
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {/* Key Outcomes / Metrics */}
            {project.metrics && project.metrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-16"
              >
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-6 rounded-2xl border border-white/10 bg-[#151922] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-cyan-500/30 transition-all"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-white mb-1.5 relative z-10">{m.value}</p>
                    <p className="text-xs text-cyan-400 font-mono tracking-wider uppercase relative z-10">{m.label}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {isCaseStudy ? (
              <div className="space-y-12 mb-16">
                {project.problem && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="p-8 rounded-2xl border border-white/10 bg-[#151922]"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-cyan-400 block" />
                      The Challenge
                    </h2>
                    <p className="leading-relaxed text-base md:text-lg text-zinc-300 font-light">
                      {project.problem}
                    </p>
                  </motion.section>
                )}

                {project.solution && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="p-8 rounded-2xl border border-white/10 bg-[#151922]"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-teal-400 block" />
                      The Engineering Solution
                    </h2>
                    <p className="leading-relaxed text-base md:text-lg text-zinc-300 font-light">
                      {project.solution}
                    </p>
                  </motion.section>
                )}

                {project.results && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="p-8 md:p-10 rounded-2xl border border-cyan-500/30 bg-[#10131A] relative overflow-hidden shadow-xl"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <CheckCircle2 className="w-28 h-28 text-cyan-400" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-4 relative z-10">
                      <ShieldCheck className="w-3.5 h-3.5" /> Delivered Impact
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Production Outcome</h2>
                    <p className="text-base md:text-lg text-zinc-300 leading-relaxed font-light relative z-10">
                      {project.results}
                    </p>
                  </motion.section>
                )}
              </div>
            ) : (
              project.results && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className="p-8 md:p-10 rounded-2xl border border-cyan-500/30 bg-[#10131A] mb-16 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckCircle2 className="w-28 h-28 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Production Outcome</h2>
                  <p className="text-base md:text-lg text-zinc-300 leading-relaxed font-light relative z-10">
                    {project.results}
                  </p>
                </motion.section>
              )
            )}

            {linkedTestimonial && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <blockquote className="p-8 md:p-10 rounded-2xl bg-[#151922] border border-white/10 relative">
                  <div className="absolute -top-3 -left-1 text-5xl text-cyan-400/20 font-serif leading-none">“</div>
                  <p className="text-lg md:text-xl text-white font-medium italic leading-relaxed mb-6 relative z-10">
                    {linkedTestimonial.quote}
                  </p>
                  <footer className="flex items-center gap-4">
                    {linkedTestimonial.avatar && (
                      <Image
                        src={linkedTestimonial.avatar}
                        alt={linkedTestimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-cyan-500/20 object-cover"
                      />
                    )}
                    <div>
                      <div className="font-bold text-white">{linkedTestimonial.name}</div>
                      <div className="text-xs text-zinc-400">
                        {linkedTestimonial.role} at {linkedTestimonial.company}
                      </div>
                    </div>
                  </footer>
                </blockquote>
              </motion.div>
            )}

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t border-white/10"
            >
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 shadow-lg shadow-cyan-500/25 text-center flex items-center justify-center gap-2"
              >
                Start a Similar Project <ArrowRight className="w-4 h-4" />
              </Link>
              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#151922] hover:bg-white/10 transition-colors text-center inline-flex items-center justify-center gap-2 border border-white/10"
                >
                  View Live Site <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </div>
        </article>
      </div>
    </PageShell>
  );
}

