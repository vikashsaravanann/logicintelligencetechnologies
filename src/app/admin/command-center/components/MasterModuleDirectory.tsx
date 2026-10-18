"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ListChecks,
  Receipt,
  Users,
  Mail,
  Zap,
  Globe,
  LayoutDashboard,
  Building,
  ArrowRight,
  Search,
  ExternalLink,
  ShieldCheck,
  Plus,
  FileText,
  Calendar,
  Ticket,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Inbox,
  Send,
  Eye,
  FileSpreadsheet,
  Cpu,
  Clock,
  Radio,
  Sliders,
  CheckCircle2,
  FileCheck2,
  Share2,
  Bot,
  Scale,
  BookOpen,
  HeartPulse,
  Compass,
  HelpCircle,
  Lock,
  User,
  Shield,
  FileCheck,
  Code,
  Smartphone,
  Award,
  Flame,
  Key,
} from "lucide-react";
import type { StaffRole } from "@/config/roles";
import {
  MODULE_CATEGORIES,
  filterModuleCategoriesForRole,
  type ModuleCategory,
  type ModuleItem,
} from "@/config/module-directory";

export type { ModuleCategory, ModuleItem };
export { MODULE_CATEGORIES, filterModuleCategoriesForRole };

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ListChecks,
  Receipt,
  Users,
  Send,
  Mail,
  Zap,
  Globe,
  LayoutDashboard,
  Building,
  Layers,
};

export interface MasterModuleDirectoryProps {
  role?: StaffRole;
  categories?: ModuleCategory[];
}

export function MasterModuleDirectory({ role, categories: initialCategories }: MasterModuleDirectoryProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  const baseCategories = useMemo(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories;
    }
    if (role) {
      return filterModuleCategoriesForRole(role);
    }
    return MODULE_CATEGORIES;
  }, [initialCategories, role]);

  const totalToolCount = useMemo(() => {
    return baseCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [baseCategories]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return baseCategories.map((cat) => {
      // Filter items within category
      const matchingItems = cat.items.filter((item) => {
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        );
      });

      return {
        ...cat,
        items: matchingItems,
      };
    }).filter((cat) => {
      // Category filter check
      if (activeCategoryId !== "all" && cat.id !== activeCategoryId) {
        return false;
      }
      return cat.items.length > 0;
    });
  }, [baseCategories, searchQuery, activeCategoryId]);

  const matchedToolCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <div className="space-y-6 pt-2">
      {/* Directory Title & Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lit-navy,#0B2545)]/10 text-[var(--lit-navy,#0B2545)]">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span>Master Operations &amp; Module Directory</span>
            </h2>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#1565C0] border border-blue-200 px-2.5 py-0.5 rounded-full">
              {matchedToolCount === totalToolCount
                ? `${totalToolCount} Modules Connected`
                : `${matchedToolCount} of ${totalToolCount} Modules`}
            </span>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
            Complete, authoritative directory of authorized administrative tools, portals, billing tools, and automated pipelines.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px] sm:min-w-[340px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by module name, keyword, or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setActiveCategoryId("all")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
            activeCategoryId === "all"
              ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
              : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Categories ({totalToolCount})
        </button>
        {baseCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
              activeCategoryId === cat.id
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                activeCategoryId === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {cat.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm font-bold text-slate-700">No modules match your search &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-xs text-slate-400 mt-1">Try searching for keywords like &ldquo;invoice&rdquo;, &ldquo;seo&rdquo;, &ldquo;lead&rdquo;, or &ldquo;checklist&rdquo;.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategoryId("all");
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => {
            const IconComponent = (category.iconName ? ICON_MAP[category.iconName] : (category as unknown as { icon?: React.ComponentType<{ className?: string }> }).icon) || Layers;

            return (
              <div
                key={category.id}
                className={`rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs ${category.tone.hoverBorder} transition-all flex flex-col justify-between`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${category.tone.border} ${category.tone.bg} ${category.tone.text}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] font-mono">
                          {category.name}
                        </h3>
                        <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                          {category.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${category.tone.badge}`}>
                      {category.items.length} tools
                    </span>
                  </div>

                  {/* Module List Items */}
                  <div className="space-y-1.5">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-[var(--lit-cloud,#F7F9FC)] border border-transparent hover:border-[var(--lit-border-light,#DFE7EF)] transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[#1565C0] transition-colors">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {item.badge}
                              </span>
                            )}
                            {item.isExternalPreview && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5">
                                Preview <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] line-clamp-1 mt-0.5">
                            {item.desc}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600 truncate block mt-0.5">
                            {item.href}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Category Footer Shortcut Link */}
                <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
                  <Link
                    href={category.footerLink.href}
                    className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${category.tone.button}`}
                  >
                    <span>{category.footerLink.label}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
