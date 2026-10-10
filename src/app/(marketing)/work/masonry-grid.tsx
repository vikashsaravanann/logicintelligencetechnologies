"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PortfolioProject } from "@/data/portfolioData";

export default function MasonryGrid({ projects }: { projects: PortfolioProject[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                isActive
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-sm border border-[var(--lit-navy,#0B2545)]"
                  : "bg-white text-slate-600 border border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300 hover:text-[var(--lit-navy,#0B2545)] shadow-2xs"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredProjects.map((project, idx) => (
            <motion.article
              layout
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
              className="group rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden hover:border-[#1565C0]/40 transition-all duration-300 flex flex-col relative shadow-xs hover:shadow-md hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,37,69,0.85)] via-[rgba(11,37,69,0.25)] to-transparent flex items-end p-6 pointer-events-none">
                  <div className="relative z-10 w-full pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#45D9D2] bg-[rgba(11,37,69,0.6)] px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        {project.category}
                      </span>
                      {project.externalUrl && (
                        <a
                          href={project.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/80 hover:text-white transition-colors bg-[rgba(11,37,69,0.6)] p-1 rounded-md"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Visit live site for ${project.title}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <h2 className="text-xl font-bold font-poppins text-white group-hover:text-[#45D9D2] transition-colors drop-shadow-xs">
                      {project.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-sm">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide text-slate-700 bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1565C0] hover:text-[#0B2545] transition-all group/btn"
                  >
                    <span>Read Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  {project.client && (
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                      {project.client}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
