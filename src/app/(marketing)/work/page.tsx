import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import PageShell from "@/components/layout/page-shell";
import { portfolioProjects } from "@/data/portfolioData";
import { COMPANY } from "@/config/company";
import MasonryGrid from "./masonry-grid";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Featured Client Projects | Logic Intelligence Technologies",
  description:
    "Explore our curated selection of high-performance web applications, scalable enterprise platforms, and bespoke digital solutions designed to drive operational excellence.",
  openGraph: {
    title: "Featured Client Projects | Logic Intelligence Technologies",
    description:
      "Explore our curated selection of high-performance web applications, scalable enterprise platforms, and bespoke digital solutions.",
    images: [{ url: COMPANY.bannerPath, width: 1200, height: 630, alt: "Logic Intelligence Technologies" }],
  },
};

export default function WorkPage() {
  return (
    <PageShell>
      <BackToHome href="/" label="Back to Home" />

      {/* Ambient Glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80%] h-[55%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Proven Case Studies
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Our Work & Client Deployments
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Explore our curated portfolio of high-performance web applications, cloud systems, and production AI platforms built for scale.
          </p>
        </div>

        <MasonryGrid projects={portfolioProjects} />

        {/* Bottom CTA Banner */}
        <div className="mt-24 relative bg-gradient-to-br from-[#10131A] via-[#151922] to-[#10131A] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 md:p-14 overflow-hidden shadow-[0_20px_60px_-20px_rgba(69,217,210,0.15)] text-center">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ready to build something exceptional?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              From intelligent AI workflows to high-scale digital platforms, we architect and ship production-ready systems tailored to your requirements.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/free-demo"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-black bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                Request a Free Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

