import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, User, Calendar } from "lucide-react";
import PageBackdrop from "@/components/ui/page-backdrop";
import SafeImage from "@/components/ui/safe-image";
import { blogPosts } from "@/data/blogData";

export const metadata: Metadata = {
  title: "Engineering Blog & Technical Insights | Logic Intelligence Technologies",
  description: "Executive guides and architectural insights on web development, custom software, AI integration, and production systems.",
  openGraph: {
    title: "Engineering Blog | Logic Intelligence Technologies",
    description: "Expert guides on web development, AI, and building software for the modern web — written for founders and CTOs.",
    images: [{ url: "/api/og?title=Engineering+Blog&category=Technical+Insights", width: 1200, height: 630, alt: "Logic Intelligence Blog" }],
  },
};

export default function BlogListPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-32 pb-24 relative overflow-hidden">
      <PageBackdrop src="/assets/backdrops/work-hero.jpg" />
      
      <section className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <span className="inline-block text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-4 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            Insights &amp; Architecture Guides
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            ENGINEERING &amp; BUSINESS BLOG
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto md:mx-0">
            Unbiased architectural breakdowns on software economics, build vs buy frameworks, and modern web systems.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/[0.02]">
            <p className="text-xl text-zinc-500 font-medium">New posts coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,191,255,0.15)]"
              >
                {/* Visual Cover */}
                <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-white/10 bg-black/40">
                  <SafeImage
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {post.publishedAt}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {post.readingTime}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
