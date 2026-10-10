"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Layers, RotateCcw } from "lucide-react";

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  keyTakeaway?: string;
}

interface Props {
  terms: GlossaryTerm[];
}

export default function KnowledgeBaseGlossary({ terms }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    terms.forEach((t) => set.add(t.category));
    return ["All", ...Array.from(set).sort()];
  }, [terms]);

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchQuery =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [terms, query, activeCategory]);

  return (
    <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lexicon &amp; Architectural Definitions</span>
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)]">
            Enterprise AI Terminology &amp; Vocabulary
          </h2>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)]">
            Standardized definitions, architectural protocols, and foundational concepts underlying production-grade AI deployments.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--lit-text-muted,#52677C)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter glossary terms..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-xs text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/10 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2" role="tablist">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-sm"
                  : "bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0]/40 hover:text-[var(--lit-navy,#0B2545)]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Definitions */}
      {filteredTerms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-white hover:border-[#1565C0]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-blue,#1565C0)] font-mono">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-poppins text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  {item.term}
                </h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                  {item.definition}
                </p>
              </div>

              {item.keyTakeaway && (
                <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] font-mono text-[var(--lit-teal,#1FA9A2)]">
                  <strong>Standard:</strong> {item.keyTakeaway}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <Layers className="w-8 h-8 text-[var(--lit-text-muted,#52677C)] mx-auto" />
          <p className="text-sm font-medium text-[var(--lit-navy,#0B2545)]">
            No terms match &ldquo;{query}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--lit-blue,#1565C0)] font-semibold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
