import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Tag, Calendar, User, ArrowRight } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/data/blogData";
import ShareButton from "@/components/ui/share-button";
import SafeImage from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";
import PageShell from "@/components/layout/page-shell";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const ogUrl = `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`;

  return {
    title: `${post.title} | Logic Intelligence Technologies`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <PageShell>
      <div className="min-h-screen text-white pb-24 relative selection:bg-cyan-500/30 pt-28">
        <BackToHome href="/blog" label="Back to Blog" />

        {/* Ambient background glows */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[85%] h-[55%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[65%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Article Meta Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-6">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-wider text-[11px]">
              <Tag className="w-3.5 h-3.5" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {formattedDate}
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {post.readingTime}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-light mb-10">
            {post.excerpt}
          </p>

          {/* Featured Visual Image */}
          <div className="w-full aspect-[16/9] relative rounded-2xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-black/40">
            <SafeImage
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Author Byline */}
          <div className="flex items-center justify-between border-y border-white/10 py-4 mb-12 bg-[#10131A] px-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{post.author.name}</p>
                <p className="text-xs text-zinc-400">{post.author.role}</p>
              </div>
            </div>
            <ShareButton title={post.title} url={`/blog/${post.slug}`} />
          </div>

          {/* Article Body Content */}
          <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 mb-16">
            {post.body.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2 key={i} className="text-2xl sm:text-3xl font-bold text-white mt-12 mb-6">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="list-disc pl-6 space-y-3 text-zinc-300 my-6 marker:text-cyan-400">
                    {block.items.map((item, j) => (
                      <li key={j} className="pl-2">{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-base sm:text-lg text-zinc-300 leading-relaxed my-6 font-light">
                  {block.text}
                </p>
              );
            })}
          </article>

          {/* Related Guides */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-white/10 pt-16 mb-16">
              <h3 className="text-xl font-bold text-white mb-8">Related Architectural Guides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group block p-6 rounded-2xl border border-white/10 bg-[#151922] hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase mb-2 block">
                      {related.category}
                    </span>
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                      {related.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Closing CTA */}
          <CTASection
            title="Need Architecture Advice for Your Next Build?"
            subtitle="Book a 30-minute discovery call to evaluate tech stack options, cost estimates, and risk analysis."
            primaryCta={{ label: "Schedule Architecture Review", href: "/book-consultation" }}
            secondaryCta={{ label: "View Services", href: "/services" }}
          />
        </div>
      </div>
    </PageShell>
  );
}

