import type { Metadata } from "next";
import Link from "next/link";
import { Search, Package, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { blogPosts } from "@/data/blogData";
import { packagesData } from "@/data/packagesData";

export const metadata: Metadata = {
  title: "Search | Logic Intelligence Technologies",
  description: "Search solutions, technical packages, architectural guides, and engineering articles across Logic Intelligence Technologies.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const packs = query
    ? packagesData.filter((p) =>
        `${p.title} ${p.subtitle} ${p.price}`.toLowerCase().includes(query)
      )
    : packagesData;

  const posts = query
    ? blogPosts.filter((p) =>
        `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(query)
      )
    : blogPosts.slice(0, 6);

  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Header */}
        <div className="mt-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <Search className="w-3.5 h-3.5" />
            Global Repository Index
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            {query ? (
              <>
                Search Results for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">
                  “{q.trim()}”
                </span>
              </>
            ) : (
              <>
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">Knowledge & Packages</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Search our fixed-scope execution packages, architectural whitepapers, and engineering blog articles.
          </p>

          {/* Search Input Bar */}
          <form action="/search" method="get" className="mt-8 relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-cyan-400 absolute left-4 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search packages, speech AI, healthcare, architectures..."
                className="w-full rounded-2xl border border-white/10 bg-[#10131A] pl-12 pr-28 py-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-[#151922] focus:outline-none focus:ring-1 focus:ring-cyan-400/50 shadow-2xl transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(69,217,210,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results: Packages */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Execution Packages ({packs.length})
            </h2>
            <Link
              href="/packages"
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {packs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packs.map((p) => (
                <Link
                  key={p.slug}
                  href={`/packages/${p.slug}`}
                  className="p-6 rounded-2xl border border-white/10 bg-[#151922] hover:border-cyan-500/40 hover:bg-[#181d28] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider line-clamp-1 max-w-[60%]">
                        {p.bestFor}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                        {p.price}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white uppercase font-heading group-hover:text-cyan-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">
                      {p.subtitle}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>{p.inclusions.length} Core Inclusions</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-white/5 bg-[#10131A] text-center text-slate-400 text-sm">
              No packages found matching &quot;{query}&quot;. Try searching for &quot;MVP&quot;, &quot;Voice&quot;, or &quot;Enterprise&quot;.
            </div>
          )}
        </div>

        {/* Results: Technical Guides & Articles */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Technical Guides & Insights ({posts.length})
            </h2>
            <Link
              href="/blog"
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="p-6 rounded-2xl border border-white/10 bg-[#151922] hover:border-cyan-500/40 hover:bg-[#181d28] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                      {post.category}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>{post.readingTime}</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      Read Guide <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-white/5 bg-[#10131A] text-center text-slate-400 text-sm">
              No technical guides matching &quot;{query}&quot;.
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
}
