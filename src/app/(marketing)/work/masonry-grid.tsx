"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PortfolioProject } from "@/data/portfolioData";

export default function MasonryGrid({ projects }: { projects: PortfolioProject[] }) {
  return (
    <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
      {projects.map((project, idx) => (
        <motion.article
          key={project.slug}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: "easeOut" }}
          className="break-inside-avoid group glass-card overflow-hidden hover:border-primary/30 transition-all duration-500 flex flex-col relative"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/20 to-transparent flex items-end p-6 lg:p-8">
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md">
                    {project.category}
                  </span>
                  {project.externalUrl && (
                    <a
                      href={project.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white group-hover:text-primary transition-colors drop-shadow-md">
                  {project.title}
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 flex flex-col flex-1">
            <p className="text-zinc-400 leading-relaxed mb-6 flex-1 text-sm md:text-base">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-zinc-300 bg-white/5 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <Link
                href={`/work/${project.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary transition-all relative z-10 w-full group/btn"
              >
                Read Case Study 
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                <span className="absolute inset-0 -z-10" />
              </Link>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
