import { Metadata } from "next";
import Link from "next/link";
import { PDF_RESOURCES } from "@/config/pdfs";
import { ArrowRight, Download, FileText, Sparkles, BookOpen, Code2, Brain, BarChart3, Briefcase, FileCheck, Archive } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Resources, Guides & Architecture Whitepapers | Logic Intelligence Technologies",
  description: "Download enterprise technical guides, architecture checklists, business automation playbooks, and corporate capability profiles.",
  openGraph: {
    title: "Resources & Downloads | Logic Intelligence Technologies",
    description: "Free enterprise guides, technical checklists, AI readiness frameworks, and project templates from Logic Intelligence Technologies.",
    images: [{ url: "/assets/og-banner.jpg", width: 1200, height: 630, alt: "LIT Resources" }],
  },
};

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string; Icon: React.ComponentType<{ className?: string }> }> = {
  "Corporate":       { color: "#00BFFF", bg: "rgba(0,191,255,0.08)",  border: "rgba(0,191,255,0.2)",  Icon: Briefcase },
  "Services":        { color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", Icon: Code2 },
  "Technical Guide": { color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", Icon: FileCheck },
  "AI & Data":       { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", Icon: Brain },
  "Strategy":        { color: "#EC4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.2)", Icon: BarChart3 },
  "Templates":       { color: "#6366F1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", Icon: Archive },
  "Legal & Contracts": { color: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", Icon: FileText },
  "Case Studies":    { color: "#22C55E", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  Icon: BookOpen },
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
          {PDF_RESOURCES.map((res) => {
            const catStyle = CATEGORY_STYLES[res.category] ?? {
              color: "#00BFFF",
              bg: "rgba(0,191,255,0.08)",
              border: "rgba(0,191,255,0.2)",
              Icon: FileText,
            };
            const { Icon: CatIcon } = catStyle;
            return (
            <div
              key={res.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,191,255,0.1)] overflow-hidden relative"
              style={{ borderTopColor: catStyle.color, borderTopWidth: "2px" }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, ${catStyle.color}, transparent)` }} />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}`, color: catStyle.color }}>
                    <CatIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border" style={{ color: catStyle.color, background: catStyle.bg, borderColor: catStyle.border }}>
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border text-zinc-300 hover:text-black"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = catStyle.color; (e.currentTarget as HTMLAnchorElement).style.borderColor = catStyle.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
