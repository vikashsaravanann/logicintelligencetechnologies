import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { Sparkles } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import CTASection from "@/components/ui/cta-section";
import { blogPosts } from "@/data/blogData";
import BlogFilterableList from "./components/BlogFilterableList";

export const metadata: Metadata = {
  title: "Engineering Blog & Technical Insights | Logic Intelligence Technologies",
  description: "Executive guides and architectural insights on web development, custom software, AI integration, and production systems.",
  alternates: {
    canonical: "/blog",
  },
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
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <JsonLd
          data={breadcrumb([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ])}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Home" inline />
          </div>

          {/* Hero Section */}
          <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineering &amp; Architecture Insights</span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Engineering &amp; Architecture Blog
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-[var(--lit-teal,#1FA9A2)] max-w-2xl mx-auto">
              Unbiased architectural breakdowns on software economics, build-versus-buy frameworks, and resilient systems.
            </p>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              In-depth technical guides written by practicing software architects. Transparent analysis for founders, CTOs, and product engineering leaders navigating real-world tradeoffs.
            </p>
          </div>

          {/* Filterable Articles Grid & Newsletter */}
          <BlogFilterableList posts={posts} />

          {/* Canonical Enterprise CTA */}
          <div className="mt-20">
            <CTASection
              title="Have a Complex Software Architecture Question?"
              subtitle="Discuss your system requirements, performance bottlenecks, or build-vs-buy decisions directly with our lead architects."
              primaryCta={{
                label: "Book Architecture Consultation",
                href: "/book-consultation",
              }}
              secondaryCta={{
                label: "Explore Resources Library",
                href: "/resources",
              }}
            />
          </div>
        </div>
      </main>
    </PageShell>
  );
}
