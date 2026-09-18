"use client";

import { motion } from "framer-motion";
import BackButton from "@/components/navigation/back-button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { PortfolioProject } from "@/data/portfolioData";
import FloatingElements from "@/components/motion/floating-elements";

// Using any here for Testimonial to decouple from the exact type, or just defined inline
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
        staggerChildren: 0.15,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  return (
    <main className="min-h-screen bg-transparent text-white pt-24 lg:pt-32 pb-24 overflow-hidden relative">
      <FloatingElements />
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <article className="px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-3xl mx-auto">
            <div className="mb-12">
              <BackButton fallbackHref="/work" label="Back to Work" inline />
            </div>

          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              {project.category}
              {project.client ? ` · ${project.client}` : ""}
            </span>
            <h1 className="uppercase text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-light">
              {project.description}
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-12">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-zinc-300 bg-white/5 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full aspect-video md:aspect-[21/9] relative rounded-[2rem] overflow-hidden mb-20 border border-white/10 shadow-2xl shadow-primary/10"
        >
          <Image src={project.image} alt={project.title} fill className="object-cover" priority />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {project.metrics && project.metrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-20"
            >
              {project.metrics.map((m, i) => (
                <div
                  key={m.label}
                  className="p-6 md:p-8 rounded-[2rem] border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="text-3xl md:text-5xl font-black text-white mb-2 relative z-10">{m.value}</p>
                  <p className="text-xs md:text-sm text-zinc-400 uppercase tracking-widest font-semibold relative z-10">{m.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {isCaseStudy ? (
            <div className="space-y-20 mb-20">
              {project.problem && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-primary block" />
                    The Challenge
                  </h2>
                  <div className="prose prose-lg prose-invert text-zinc-300">
                    <p className="leading-relaxed text-lg md:text-xl font-light">{project.problem}</p>
                  </div>
                </motion.section>
              )}

              {project.solution && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-primary block" />
                    The Solution
                  </h2>
                  <div className="prose prose-lg prose-invert text-zinc-300">
                    <p className="leading-relaxed text-lg md:text-xl font-light">{project.solution}</p>
                  </div>
                </motion.section>
              )}

              {project.results && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="p-8 md:p-12 rounded-[2rem] border border-primary/20 bg-primary/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckCircle2 className="w-32 h-32 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-6 relative z-10">The Impact</h2>
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light relative z-10">
                    {project.results}
                  </p>
                </motion.section>
              )}
            </div>
          ) : (
            project.results && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="p-8 md:p-12 rounded-[2rem] border border-primary/20 bg-primary/5 mb-20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CheckCircle2 className="w-32 h-32 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6 relative z-10">The Impact</h2>
                <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light relative z-10">
                  {project.results}
                </p>
              </motion.section>
            )
          )}

          {linkedTestimonial && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="mb-20"
            >
              <blockquote className="p-8 md:p-10 rounded-[2rem] bg-zinc-900/50 border border-white/5 relative">
                <div className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif">"</div>
                <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed mb-8 relative z-10">
                  {linkedTestimonial.quote}
                </p>
                <footer className="flex items-center gap-4">
                  {linkedTestimonial.avatar && (
                    <Image
                      src={linkedTestimonial.avatar}
                      alt={linkedTestimonial.name}
                      width={56}
                      height={56}
                      className="rounded-full border-2 border-primary/20 object-cover"
                    />
                  )}
                  <div>
                    <div className="font-bold text-white">{linkedTestimonial.name}</div>
                    <div className="text-sm text-zinc-400">
                      {linkedTestimonial.role} at {linkedTestimonial.company}
                    </div>
                  </div>
                </footer>
              </blockquote>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-10 border-t border-white/10"
          >
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-black bg-primary neon-btn text-center"
            >
              Start a Similar Project
            </Link>
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors text-center inline-flex items-center justify-center gap-2 border border-white/10"
              >
                View Live Site <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </motion.div>
        </div>
      </article>
    </main>
  );
}
