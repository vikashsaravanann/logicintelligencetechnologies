"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  ArrowRight,
  Lock,
  Search,
  Sparkles,
  Briefcase,
  Code2,
  Brain,
  ShieldCheck,
  Layers,
  HelpCircle,
  DollarSign,
  FileText,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import type { PdfResource } from "@/config/pdfs";

interface Props {
  resources: PdfResource[];
}

interface CategoryStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  Corporate: {
    label: "Corporate",
    badgeBg: "bg-[#EDE7F6]",
    badgeText: "text-[#5E35B1]",
    badgeBorder: "border-[#D1C4E9]",
    Icon: Briefcase,
  },
  Services: {
    label: "Services",
    badgeBg: "bg-[#E7F3FF]",
    badgeText: "text-[#1565C0]",
    badgeBorder: "border-[#BBDEFB]",
    Icon: Code2,
  },
  "AI & Automation": {
    label: "AI & Automation",
    badgeBg: "bg-[#E0F2F1]",
    badgeText: "text-[#00796B]",
    badgeBorder: "border-[#B2DFDB]",
    Icon: Brain,
  },
  "Case Studies": {
    label: "Case Studies",
    badgeBg: "bg-[#FFF8E1]",
    badgeText: "text-[#B78103]",
    badgeBorder: "border-[#FFE082]",
    Icon: FileCheck,
  },
  Pricing: {
    label: "Pricing",
    badgeBg: "bg-[#F3E5F5]",
    badgeText: "text-[#7B1FA2]",
    badgeBorder: "border-[#E1BEE7]",
    Icon: DollarSign,
  },
  Guides: {
    label: "Guides",
    badgeBg: "bg-[#FCE4EC]",
    badgeText: "text-[#C2185B]",
    badgeBorder: "border-[#F8BBD0]",
    Icon: HelpCircle,
  },
  Engineering: {
    label: "Engineering",
    badgeBg: "bg-[#E1F5FE]",
    badgeText: "text-[#0277BD]",
    badgeBorder: "border-[#B3E5FC]",
    Icon: Layers,
  },
  Security: {
    label: "Security",
    badgeBg: "bg-[#E8F5E9]",
    badgeText: "text-[#2E7D32]",
    badgeBorder: "border-[#C8E6C9]",
    Icon: ShieldCheck,
  },
  "Press & Media": {
    label: "Press & Media",
    badgeBg: "bg-[#E0F7FA]",
    badgeText: "text-[#00838F]",
    badgeBorder: "border-[#B2EBF2]",
    Icon: Sparkles,
  },
  Investors: {
    label: "Investors",
    badgeBg: "bg-[#ECEFF1]",
    badgeText: "text-[#37474F]",
    badgeBorder: "border-[#CFD8DC]",
    Icon: Briefcase,
  },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  label: "Technical",
  badgeBg: "bg-[#E7F3FF]",
  badgeText: "text-[#1565C0]",
  badgeBorder: "border-[#BBDEFB]",
  Icon: FileText,
};

export default function ResourcesFilterableGrid({ resources }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique categories and counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of resources) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    const cats = Object.keys(counts).sort();
    return [
      { name: "All", count: resources.length },
      ...cats.map((cat) => ({ name: cat, count: counts[cat] })),
    ];
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return resources.filter((res) => {
      const matchesCategory =
        activeCategory === "All" || res.category === activeCategory;
      const matchesSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [resources, activeCategory, searchQuery]);

  return (
    <div id="library" className="scroll-mt-28 space-y-8">
      {/* Search and Category Filter Controls */}
      <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, topic, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:bg-white focus:ring-2 focus:ring-[#1565C0]/10 transition-all"
              aria-label="Search resources"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-[var(--lit-text-muted,#52677C)] flex items-center gap-1.5 self-end md:self-center">
            <span>Showing</span>
            <strong className="font-semibold text-[var(--lit-navy,#0B2545)]">
              {filteredResources.length}
            </strong>
            <span>of {resources.length} verified documents</span>
          </div>
        </div>

        {/* Category Pills */}
        <div
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]"
          role="tablist"
          aria-label="Resource categories"
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCategory(cat.name)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-sm ring-1 ring-[var(--lit-navy,#0B2545)]"
                    : "bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0]/40 hover:text-[var(--lit-navy,#0B2545)]"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Resource Cards */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredResources.map((res) => {
            const style = CATEGORY_MAP[res.category] || DEFAULT_CATEGORY_STYLE;
            const CategoryIcon = style.Icon;

            return (
              <article
                key={res.id}
                className="group rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white flex flex-col justify-between transition-all duration-300 hover:border-[#1565C0]/50 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div>
                  {/* Visual Cover */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-100">
                    <SafeImage
                      src={res.coverImage}
                      alt={`${res.title} Document Cover`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                      >
                        <CategoryIcon className="w-3 h-3" />
                        {res.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[11px] text-[var(--lit-text-muted,#52677C)] mb-2 font-mono">
                      <span>Ver. {res.version}</span>
                      <span>•</span>
                      <span>{res.publishedAt}</span>
                    </div>

                    <h2 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-blue,#1565C0)] transition-colors leading-snug mb-2.5">
                      <Link href={`/resources/${res.slug}`}>
                        {res.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light line-clamp-3">
                      {res.description}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] space-y-2.5">
                    <Link
                      href={`/resources/${res.slug}`}
                      aria-label={`Get ${res.title}`}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] px-5 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-sm group/btn active:scale-[0.99]"
                    >
                      <Download className="w-4 h-4 text-cyan-300" aria-hidden />
                      <span>{res.accessType === "public" ? "Open Document" : "Get this PDF"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" aria-hidden />
                    </Link>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--lit-text-muted,#52677C)]">
                      <Lock className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" aria-hidden />
                      <span>Verified corporate download (Free)</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            No matching documents found
          </h3>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
            We couldn&apos;t find any documents matching &ldquo;{searchQuery}&rdquo; in the{" "}
            {activeCategory} category. Try refining your keywords or clearing the filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
