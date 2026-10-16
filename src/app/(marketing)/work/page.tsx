import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { portfolioProjects } from "@/data/portfolioData";
import { COMPANY } from "@/config/company";
import MasonryGrid from "./masonry-grid";
import { Sparkles } from "lucide-react";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Featured Client Projects | Logic Intelligence Technologies",
  description:
    "Explore our curated high-performance web applications, scalable enterprise platforms, and bespoke digital solutions driving operational excellence.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Featured Client Projects | Logic Intelligence Technologies",
    description:
      "Explore our curated selection of high-performance web applications, scalable enterprise platforms, and bespoke digital solutions.",
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: "Logic Intelligence Technologies" }],
  },
};

export default function WorkPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Proven Case Studies &amp; Deployments</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight mb-6 leading-[1.08]">
            Our Work &amp; Client Deployments
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Explore our curated portfolio of high-performance web applications, cloud systems, and production AI platforms built for scale.
          </p>
        </div>

        {/* Project Portfolio Grid with Category Filtering */}
        <MasonryGrid projects={portfolioProjects} />

        {/* Bottom CTA Banner */}
        <div className="mt-20">
          <CTASection
            title="Ready to Build Something Exceptional?"
            subtitle="From intelligent AI workflows to high-scale digital platforms, we architect and ship production-ready systems tailored to your requirements."
            primaryCta={{ label: "Request Free Demo", href: "/free-demo" }}
            secondaryCta={{ label: "Schedule Consultation", href: "/book-consultation" }}
          />
        </div>
      </div>
    </main>
  );
}
