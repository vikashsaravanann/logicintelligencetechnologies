import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/navigation/back-button";
import { Clock, Calendar, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/data/blogData";
import ShareButton from "@/components/ui/share-button";
import BlogHeroConsole from "@/components/blog/blog-hero-console";
import CTASection from "@/components/ui/cta-section";
import PageShell from "@/components/layout/page-shell";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found | Logic Intelligence Technologies" };

  const ogUrl = `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`;

  return {
    title: `${post.title} | Logic Intelligence Technologies`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <BackButton fallbackHref="/blog" label="Engineering Blog" inline />
          </div>

          {/* Article Header */}
          <header className="space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--lit-text-muted,#52677C)]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
                {formattedDate}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--lit-navy,#0B2545)] leading-tight tracking-tight">
              {post.title}
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-[var(--lit-teal,#1FA9A2)] leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Featured Architecture Animation Console */}
          <BlogHeroConsole
            slug={post.slug}
            title={post.title}
            category={post.category}
            readingTime={post.readingTime}
          />

          {/* Author Byline & Social Share */}
          <div className="flex items-center justify-between border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 sm:p-5 rounded-2xl shadow-sm mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-sm">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">{post.author.name}</p>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)]">{post.author.role}</p>
              </div>
            </div>
            <ShareButton title={post.title} url={`/blog/${post.slug}`} />
          </div>

          {/* Article Body Content */}
          <article className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-10 md:p-12 shadow-sm mb-16 space-y-6">
            {post.body.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2
                    key={i}
                    className="font-poppins text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] mt-8 mb-4 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] first:border-0 first:pt-0"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="space-y-3.5 my-6 pl-1">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm sm:text-base text-[var(--lit-ink,#121826)] leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-[var(--lit-teal,#1FA9A2)] mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={i}
                  className="text-base sm:text-lg text-[var(--lit-ink,#121826)] leading-relaxed font-light my-4"
                >
                  {block.text}
                </p>
              );
            })}
          </article>

          {/* Author Credential Bio Box */}
          <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-sm mb-16 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] flex items-center justify-center font-bold text-xl shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)]">
                  Written by {post.author.name}
                </h3>
                <span className="text-xs font-semibold text-[var(--lit-teal,#1FA9A2)]">
                  {post.author.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                Leads engineering architecture and client system delivery at Logic Intelligence Technologies. Specializes in distributed cloud infrastructure, resilient workflows, and business software economics.
              </p>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-12 mb-16 space-y-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                  Related Architectural Guides
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group block p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[#1565C0]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 shadow-sm"
                  >
                    <span className="inline-block text-[10px] font-bold text-[var(--lit-blue,#1565C0)] bg-[var(--lit-light-blue,#E7F3FF)] px-2.5 py-0.5 rounded-full border border-[#BBDEFB] uppercase tracking-wider mb-3">
                      {related.category}
                    </span>
                    <h4 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-blue,#1565C0)] transition-colors mb-2 leading-snug">
                      {related.title}
                    </h4>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] line-clamp-2 leading-relaxed">
                      {related.excerpt}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs font-semibold text-[var(--lit-blue,#1565C0)]">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Canonical Enterprise CTA */}
          <CTASection
            title="Need Architecture Advice for Your Next Build?"
            subtitle="Book a 30-minute discovery call to evaluate tech stack options, cost estimates, and risk analysis."
            primaryCta={{
              label: "Schedule Architecture Review",
              href: "/book-consultation",
            }}
            secondaryCta={{
              label: "Explore Resources Library",
              href: "/resources",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
