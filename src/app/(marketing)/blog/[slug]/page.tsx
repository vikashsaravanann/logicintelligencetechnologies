import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, Calendar, ArrowRight } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/data/blogData";
import ShareButton from "@/components/ui/share-button";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Formatting date
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pb-24 relative selection:bg-primary/30">
      {/* Full-width article hero banner */}
      <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b3e] via-[#0A0F1E] to-[#0d2533]" />
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice">
            <circle cx="900" cy="210" r="250" fill="white" />
            <circle cx="200" cy="80" r="140" fill="white" />
            <circle cx="600" cy="380" r="100" fill="#00BFFF" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-6 lg:px-8 pb-12 pt-24">
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-5">
            <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full border border-primary/20 text-xs">
              <Tag className="w-3.5 h-3.5" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="flex items-center gap-1.5 text-xs">
              <Clock className="w-4 h-4" />
              {post.readingTime}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-[1.1] tracking-tight">
            {post.title}
          </h1>
          <p className="text-lg text-zinc-300 leading-relaxed font-light max-w-2xl">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-30" />

      <article className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10 pt-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-12 group"
        >
          <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 
          </div>
          Back to all articles
        </Link>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300">
          {post.body.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="list-disc pl-6 space-y-3 text-zinc-300 my-6 marker:text-primary">
                  {block.items.map((item, j) => (
                    <li key={j} className="pl-2">{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-zinc-300 leading-relaxed mb-6 text-lg">
                {block.text}
              </p>
            );
          })}
        </div>

        <footer className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-400">Share this article:</span>
            <ShareButton title={post.title} text={post.excerpt} />
          </div>
        </footer>

        <div className="mt-20 p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-3">Ready to start your project?</h3>
          <p className="text-zinc-400 text-lg mb-8 max-w-lg mx-auto">
            Get a free demo and see exactly what we'd build for your business. No commitments.
          </p>
          <Link
            href="/free-demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-black bg-primary hover:bg-primary/90 transition-all neon-btn hover:scale-105 duration-200"
          >
            Request a Free Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </article>
    </main>
  );
}
