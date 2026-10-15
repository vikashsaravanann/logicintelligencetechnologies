"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  GitBranch,
  CheckSquare,
  FileEdit,
  Calendar,
  FileText,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import type { SearchResultItem } from "@/app/api/client/search/route";

export function ClientSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/client/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.results)) {
            setResults(data.results);
            setIsOpen(true);
            setSelectedIndex(-1);
          }
        }
      } catch (err) {
        console.warn("Search fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < results.length) {
      e.preventDefault();
      const target = results[selectedIndex];
      router.push(target.link);
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "engagement":
        return <GitBranch className="w-3.5 h-3.5 text-indigo-600" />;
      case "approval":
        return <CheckSquare className="w-3.5 h-3.5 text-teal-600" />;
      case "rfc":
        return <FileEdit className="w-3.5 h-3.5 text-amber-600" />;
      case "meeting":
        return <Calendar className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search stages, tasks, RFCs..."
          className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/70 text-xs text-[var(--lit-navy,#0B2545)] placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-[var(--lit-teal,#1FA9A2)] transition-all font-sans"
        />
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 absolute right-2.5 text-teal-600 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 right-0 max-h-80 overflow-y-auto rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-lg z-50 p-1.5 text-xs">
          {results.length === 0 ? (
            <div className="p-3 text-center text-slate-500">
              {isLoading ? "Searching workspace..." : "No matching items found."}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors ${
                    idx === selectedIndex
                      ? "bg-teal-50 text-[var(--lit-navy,#0B2545)]"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getCategoryIcon(item.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-xs truncate text-[var(--lit-navy,#0B2545)]">
                        {item.title}
                      </span>
                      {item.statusBadge && (
                        <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-100 text-slate-600">
                          {item.statusBadge}
                        </span>
                      )}
                    </div>
                    {item.snippet && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-sans">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
