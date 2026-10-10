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
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-md shadow-cyan-500/20"
                  : "bg-[#151922] text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white"
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
              className="group rounded-2xl border border-white/10 bg-[#151922] overflow-hidden hover:border-cyan-500/40 transition-all duration-500 flex flex-col relative shadow-xl hover:-translate-y-1.5"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151922] via-[#151922]/40 to-transparent flex items-end p-6">
                  <div className="relative z-10 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                        {project.category}
                      </span>
                      {project.externalUrl && (
                        <a
                          href={project.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Visit live site for ${project.title}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors drop-shadow-sm">
                      {project.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-zinc-400 leading-relaxed mb-6 flex-1 text-sm">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide text-zinc-300 bg-white/5 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-all group/btn"
                  >
                    Read Case Study
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

