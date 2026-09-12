import { Metadata } from "next";
import Link from "next/link";
import { PDF_RESOURCES } from "@/config/pdfs";
import { ArrowRight, Download, FileText, Sparkles, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Resources, Guides & Architecture Whitepapers | Logic Intelligence Technologies",
  description: "Download enterprise technical guides, architecture checklists, business automation playbooks, and corporate capability profiles.",
};

export default function ResourcesPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-1/4 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Executive & Technical Knowledge Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            RESOURCES, FRAMEWORKS & <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TECHNICAL BRIEFS</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Curated blueprints, checklists, and templates developed from our real-world enterprise deployments. Available for direct download.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PDF_RESOURCES.map((res) => (
            <div
              key={res.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,191,255,0.15)]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                    {res.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {res.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/resources/${res.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-primary transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href={res.publicPath}
                  download={res.filename}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary hover:text-black transition-all border border-white/10 text-zinc-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
