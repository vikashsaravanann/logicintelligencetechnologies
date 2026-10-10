import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Package,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Code,
  X,
  ExternalLink,
} from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { blogPosts } from "@/data/blogData";
import { packagesData } from "@/data/packagesData";
import { productsData } from "@/data/productsData";
import { servicesData } from "@/data/servicesData";
import CTASection from "@/components/ui/cta-section";
import SearchClientFilter from "./components/SearchClientFilter";

export const metadata: Metadata = {
  title: "Search | Logic Intelligence Technologies",
  description:
    "Search solutions, technical packages, architectural guides, and engineering articles across Logic Intelligence Technologies.",
  robots: { index: false, follow: true },
};

const POPULAR_TAGS = [
  "Voice AI",
  "Healthcare",
  "Architecture",
  "RAG",
  "Full Stack",
  "MVP",
  "Speech",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "all" } = await searchParams;
  const query = q.trim().toLowerCase();

  // 1. Filter Products
  const matchedProducts = query
    ? productsData.filter(
        (p) =>
          `${p.name} ${p.tagline} ${p.category} ${p.description}`
            .toLowerCase()
            .includes(query)
      )
    : productsData;

  // 2. Filter Packages
  const matchedPackages = query
    ? packagesData.filter((p) =>
        `${p.title} ${p.subtitle} ${p.price} ${p.bestFor}`
          .toLowerCase()
          .includes(query)
      )
    : packagesData;

  // 3. Filter Services
  const matchedServices = query
    ? servicesData.filter((s) =>
        `${s.title} ${s.subtitle} ${s.description}`
          .toLowerCase()
          .includes(query)
      )
    : servicesData.slice(0, 4);

  // 4. Filter Blog & Guides
  const matchedPosts = query
    ? blogPosts.filter((p) =>
        `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(query)
      )
    : blogPosts.slice(0, 6);

  const totalResults =
    matchedProducts.length +
    matchedPackages.length +
    matchedServices.length +
    matchedPosts.length;

  const showProducts = category === "all" || category === "products";
  const showPackages = category === "all" || category === "packages";
  const showServices = category === "all" || category === "services";
  const showGuides = category === "all" || category === "guides";

  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ])}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back Navigation */}
          <div>
            <BackButton fallbackHref="/" label="Home" inline className="mb-6" />
          </div>

          {/* Header & Search Form */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Search className="w-3.5 h-3.5" />
              <span>Global Repository Index • Enterprise Search</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              {query ? (
                <>
                  Search Results for{" "}
                  <span className="font-serif italic text-[var(--lit-teal,#1FA9A2)] font-normal">
                    &ldquo;{q.trim()}&rdquo;
                  </span>
                </>
              ) : (
                <>
                  Explore Enterprise{" "}
                  <span className="font-serif italic text-[var(--lit-teal,#1FA9A2)] font-normal">
                    Solutions &amp; Knowledge
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl">
              Search across our active software products, fixed-scope delivery packages, engineering services, and architectural knowledge guides.
            </p>

            {/* Search Input Bar */}
            <form action="/search" method="get" className="relative pt-2">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)] absolute left-4 pointer-events-none" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search packages, voice AI, healthcare, architectures..."
                  className="w-full rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white pl-12 pr-32 py-4 text-sm text-[var(--lit-navy,#0B2545)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:border-[var(--lit-teal,#1FA9A2)] focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 shadow-xs transition-all"
                />
                {query && (
                  <Link
                    href="/search"
                    className="absolute right-24 p-1.5 text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </Link>
                )}
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#153e75] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Popular Search Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--lit-text-muted,#52677C)]">
              <span className="font-mono uppercase text-[10px] tracking-wider font-semibold">
                Popular:
              </span>
              {POPULAR_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Category Filter Tabs */}
            <SearchClientFilter
              currentCategory={category}
              counts={{
                all: totalResults,
                products: matchedProducts.length,
                packages: matchedPackages.length,
                services: matchedServices.length,
                guides: matchedPosts.length,
              }}
            />
          </div>

          {/* Results Container */}
          {totalResults === 0 ? (
            <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] text-[#B78103] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                No Results Found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
                We couldn&apos;t find matching records. Try searching with broader keywords like &ldquo;AI&rdquo;, &ldquo;Cloud&rdquo;, &ldquo;Voice&rdquo;, or &ldquo;Development&rdquo;.
              </p>
              <div className="pt-2">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:bg-[#153e75] transition-all"
                >
                  <span>Reset Search Filter</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* 1. Products Section */}
              {showProducts && matchedProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)] flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>Products &amp; Platforms ({matchedProducts.length})</span>
                    </h2>
                    <Link
                      href="/products"
                      className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedProducts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        className="bg-white p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)] shadow-xs hover:shadow-sm transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#E7F3FF] text-[#1565C0] border border-[#BBDEFB]">
                              {p.category}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                              {p.status}
                            </span>
                          </div>
                          <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-1.5 line-clamp-2">
                            {p.tagline}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] font-mono text-[var(--lit-teal,#1FA9A2)] flex items-center justify-between">
                          <span>Product Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Packages Section */}
              {showPackages && matchedPackages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)] flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Execution Packages ({matchedPackages.length})</span>
                    </h2>
                    <Link
                      href="/packages"
                      className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedPackages.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/packages/${p.slug}`}
                        className="bg-white p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)] shadow-xs hover:shadow-sm transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono font-semibold text-[var(--lit-teal,#1FA9A2)] uppercase tracking-wider line-clamp-1 max-w-[65%]">
                              {p.bestFor}
                            </span>
                            <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                              {p.price}
                            </span>
                          </div>
                          <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors">
                            {p.title}
                          </h3>
                          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-1.5 line-clamp-2">
                            {p.subtitle}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] flex items-center justify-between">
                          <span>{p.inclusions.length} Core Inclusions</span>
                          <span className="text-[var(--lit-teal,#1FA9A2)] flex items-center gap-1 font-semibold">
                            <span>Explore Package</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Services Section */}
              {showServices && matchedServices.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)] flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      <span>Engineering Services ({matchedServices.length})</span>
                    </h2>
                    <Link
                      href="/services"
                      className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedServices.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        className="bg-white p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)] shadow-xs hover:shadow-sm transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#EDE7F6] text-[#5E35B1] border border-[#D1C4E9] inline-block mb-2">
                            Custom Engineering
                          </span>
                          <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors">
                            {s.title}
                          </h3>
                          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-1.5 line-clamp-2">
                            {s.subtitle}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] font-mono text-[var(--lit-teal,#1FA9A2)] flex items-center justify-between">
                          <span>Service Scope</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Technical Guides & Blog */}
              {showGuides && matchedPosts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--lit-teal,#1FA9A2)] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Technical Guides &amp; Blog ({matchedPosts.length})</span>
                    </h2>
                    <Link
                      href="/blog"
                      className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors flex items-center gap-1"
                    >
                      <span>Browse All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedPosts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="bg-white p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-teal,#1FA9A2)] shadow-xs hover:shadow-sm transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#FFF8E1] text-[#B78103] border border-[#FFE082] inline-block mb-2">
                            {post.category}
                          </span>
                          <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-1.5 line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] flex items-center justify-between">
                          <span>{post.readingTime}</span>
                          <span className="text-[var(--lit-teal,#1FA9A2)] flex items-center gap-1 font-semibold">
                            <span>Read Guide</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Canonical CTA */}
          <CTASection
            title="Looking for a Tailored Enterprise Solution?"
            subtitle="Speak directly with our technical leads to scope a customized architecture or fixed-price sprint."
            primaryCta={{
              label: "Schedule Technical Review",
              href: "/book-consultation",
            }}
            secondaryCta={{
              label: "Browse All Packages",
              href: "/packages",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
