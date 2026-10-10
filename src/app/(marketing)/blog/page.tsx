import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { ArrowRight, Clock, User, Calendar, Sparkles } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
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
    <PageShell>
      <BackToHome href="/" label="Back to Home" />

      {/* Ambient background glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[85%] h-[55%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[65%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 relative z-10">
        <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Engineering &amp; Architecture Insights
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Engineering & Business Blog
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Unbiased architectural breakdowns on software economics, build-versus-buy decision frameworks, and resilient production systems.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#151922]">
            <p className="text-lg text-zinc-400 font-medium">New engineering guides coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-white/10 bg-[#151922] overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl"
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
                    <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-6 sm:p-8">
                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {post.publishedAt}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {post.readingTime}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug group-hover:text-cyan-300 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow font-light">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
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
    </PageShell>
  );
}

