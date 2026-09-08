import { Metadata } from "next";
import Link from "next/link";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import PageBackdrop from "@/components/ui/page-backdrop";
import { portfolioProjects } from "@/data/portfolioData";
import { COMPANY } from "@/config/company";
import MasonryGrid from "./masonry-grid";

export const metadata: Metadata = {
  title: "Featured Projects | Portfolio",
  description:
    "Explore our curated selection of high-performance web applications, scalable enterprise platforms, and bespoke digital solutions designed to drive business growth.",
  openGraph: {
    title: "Featured Projects | Logic Intelligence Technologies",
    description: "Explore our curated selection of high-performance web applications, scalable enterprise platforms, and bespoke digital solutions.",
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: "Logic Intelligence Technologies" }],
  },
};

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-32">
      <BackToHome />
      <section className="relative py-16 px-6 lg:px-8 overflow-hidden">
        <PageBackdrop src="/assets/backdrops/work-hero.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
            Our Portfolio
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6">Featured Projects</h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Explore our curated selection of high-performance web applications, scalable enterprise platforms, and bespoke digital solutions designed to drive business growth and operational excellence.
          </p>
        </div>

        <MasonryGrid projects={portfolioProjects} />

        <div className="mt-20 text-center">
          <p className="text-zinc-400 mb-6">Want something similar built for your business?</p>
          <Link href="/free-demo" className="inline-flex px-8 py-4 rounded-xl text-sm font-bold text-black bg-primary neon-btn">
            Request a Free Demo
          </Link>
        </div>
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
