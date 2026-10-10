"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  BookOpen,
  Mail,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import type { BlogPost } from "@/data/blogData";

interface Props {
  posts: BlogPost[];
}

export default function BlogFilterableList({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    const cats = Object.keys(counts).sort();
    return [
      { name: "All", count: posts.length },
      ...cats.map((c) => ({ name: c, count: counts[c] })),
    ];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || subscribing) return;

    setSubscribing(true);
    setNewsletterError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail.trim(),
          consentPage: "/blog",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to subscribe. Please try again.");
      }

      setSubscribed(true);
      setNewsletterEmail("");
    } catch (err: unknown) {
      setNewsletterError(
        err instanceof Error ? err.message : "Failed to subscribe."
      );
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engineering guides and articles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:bg-white focus:ring-2 focus:ring-[#1565C0]/10 transition-all"
              aria-label="Search articles"
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
              {filteredPosts.length}
            </strong>
            <span>of {posts.length} published articles</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]"
          role="tablist"
          aria-label="Blog categories"
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

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col h-full rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden hover:border-[#1565C0]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              {/* Visual Cover */}
              <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-100">
                <SafeImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--lit-blue,#1565C0)] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[var(--lit-border-light,#DFE7EF)] shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex flex-col flex-1 p-6 sm:p-8">
                <div className="flex items-center gap-4 text-xs text-[var(--lit-text-muted,#52677C)] mb-3 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
                    {post.publishedAt}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {post.readingTime}
                  </span>
                </div>

                <h2 className="font-poppins text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] mb-3 leading-snug group-hover:text-[var(--lit-blue,#1565C0)] transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-[var(--lit-text-muted,#52677C)] text-sm leading-relaxed mb-6 flex-grow font-light line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between border-t border-[var(--lit-border-light,#DFE7EF)] pt-5 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-[var(--lit-text-muted,#52677C)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-[10px]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--lit-navy,#0B2545)] block">{post.author.name}</span>
                      <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">{post.author.role}</span>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lit-blue,#1565C0)] group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            No articles match your search
          </h3>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
            We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo;. Try using different keywords or resetting filters.
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

      {/* Engineering Newsletter Subscription Strip */}
      <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
              Architecture &amp; Engineering Digest
            </span>
            <h3 className="font-poppins text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)]">
              Direct technical breakdowns in your inbox
            </h3>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
              No promotional spam or filler. Monthly deep dives on distributed systems, AI workflows, and software economics.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 min-w-[280px]">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscription confirmed! Check your inbox for confirmation.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter corporate email"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-xs text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {subscribing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-cyan-300" />
                    )}
                    <span>Subscribe</span>
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-[11px] text-rose-600">{newsletterError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
