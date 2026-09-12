import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageBackdrop from "@/components/ui/page-backdrop";
import { blogPosts } from "@/data/blogData";

export const metadata: Metadata = {
  title: "Blog | Logic Intelligence",
  description: "Guides and insights on web development, software, and building for the web.",
  openGraph: {
    title: "Blog | Logic Intelligence Technologies",
    description: "Expert guides on web development, AI, and building software for the modern web — written for founders, not developers.",
    images: [{ url: "/assets/og-banner.jpg", width: 1200, height: 630, alt: "Logic Intelligence Blog" }],
  },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Web Development":  "from-blue-900/80 to-cyan-900/60",
  "Business":         "from-emerald-900/80 to-teal-900/60",
  "AI & Automation":  "from-orange-900/80 to-amber-900/60",
  "Design":           "from-pink-900/80 to-rose-900/60",
  "E-Commerce":       "from-violet-900/80 to-purple-900/60",
  "SEO":              "from-lime-900/80 to-green-900/60",
};

export default function BlogListPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-32 pb-24 relative overflow-hidden">
      <PageBackdrop src="/assets/backdrops/work-hero.jpg" />
      
      <section className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-16 md:mb-24 text-center md:text-left">
          <span className="inline-block text-primary font-bold tracking-widest uppercase text-sm mb-4 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            Insights & Guides
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
            Our Blog
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed mx-auto md:mx-0">
            Guides on web development, software, and building for the web — written for founders, not developers.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/[0.02]">
            <p className="text-xl text-zinc-500 font-medium">New posts coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const gradientClass = CATEGORY_GRADIENTS[post.category] ?? "from-slate-900/80 to-zinc-900/60";
              return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]"
              >
                {/* Gradient header strip */}
                <div className={`h-[100px] bg-gradient-to-br ${gradientClass} flex items-center justify-center relative overflow-hidden shrink-0`}>
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">
                      <circle cx="160" cy="50" r="60" fill="white" />
                      <circle cx="40" cy="20" r="30" fill="white" />
                    </svg>
                  </div>
                  <span className="relative z-10 text-[10px] font-bold tracking-widest uppercase text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">{post.category}</span>
                </div>

                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-4 uppercase tracking-wider font-semibold">
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary transition-colors mt-auto border-t border-white/10 pt-6">
                    Read Article 
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
