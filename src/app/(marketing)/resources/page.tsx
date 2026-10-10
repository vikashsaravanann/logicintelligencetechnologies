import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { PDF_RESOURCES } from "@/config/pdfs";
import { ArrowRight, Download, FileText, BookOpen, Code2, Brain, BarChart3, Briefcase, FileCheck, Archive, Lock, MessageSquare, Sparkles } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import PageShell from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Engineering Resources, Guides & Architecture Whitepapers | Logic Intelligence Technologies",
  description: "Enterprise technical guides, architecture checklists, business automation playbooks, and corporate capability profiles.",
  openGraph: {
    title: "Resources & Downloads | Logic Intelligence Technologies",
    description: "Enterprise guides, technical checklists, AI readiness frameworks, and project templates from Logic Intelligence Technologies.",
    images: [{ url: "/api/og?title=Technical+Resources+%26+Whitepapers&category=Executive+Briefs", width: 1200, height: 630, alt: "LIT Resources" }],
  },
};

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string; Icon: React.ComponentType<{ className?: string }> }> = {
  "Corporate":       { color: "#45D9D2", bg: "rgba(69,217,210,0.1)",  border: "rgba(69,217,210,0.3)",  Icon: Briefcase },
  "Services":        { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", Icon: Code2 },
  "Technical Guide": { color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", Icon: FileCheck },
  "AI & Data":       { color: "#38BDF8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.3)", Icon: Brain },
  "Strategy":        { color: "#F43F5E", bg: "rgba(244,63,94,0.1)",  border: "rgba(244,63,94,0.3)",  Icon: BarChart3 },
  "Templates":       { color: "#6366F1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)", Icon: Archive },
  "Legal & Contracts": { color: "#F97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", Icon: FileText },
  "Case Studies":    { color: "#22C55E", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  Icon: BookOpen },
};

export default function ResourcesPage() {
  return (
    <PageShell>
      <BackToHome href="/" label="Back to Home" />

      {/* Ambient lighting glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[85%] h-[55%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[65%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Executive & Technical Knowledge Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Resources, Frameworks &amp; Technical Briefs
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto font-light">
            Authoritative documents, architecture checklists and implementation guides. Free for signed-in members: choose a document and receive your verified PDF download.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <a
              href="#library"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-black hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Browse documents
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151922] px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:border-cyan-500/40 hover:bg-[#181D28] transition-all"
            >
              <MessageSquare className="h-4 w-4 text-cyan-400" aria-hidden />
              Request a custom brief
            </Link>
          </div>

          <ol className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto" aria-label="How to get a document">
            {["Sign in or create a free account", "Open a document and confirm your details", "Receive the PDF link by email"].map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#151922] px-4 py-3 text-xs sm:text-sm text-zinc-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-400">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div id="library" className="scroll-mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PDF_RESOURCES.map((res) => {
            const catStyle = CATEGORY_STYLES[res.category] ?? {
              color: "#45D9D2",
              bg: "rgba(69,217,210,0.1)",
              border: "rgba(69,217,210,0.3)",
              Icon: FileText,
            };
            return (
              <div
                key={res.id}
                className="group rounded-2xl border border-white/10 bg-[#151922] flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-1.5 shadow-xl overflow-hidden"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-white/10 bg-black/40">
                  <SafeImage
                    src={res.coverImage}
                    alt={`${res.title} Cover`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border backdrop-blur-md"
                      style={{ color: catStyle.color, background: "rgba(10, 15, 26, 0.85)", borderColor: catStyle.border }}
                    >
                      {res.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {res.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed flex-grow font-light">
                    {res.description}
                  </p>

                  <div className="pt-5 border-t border-white/10 mt-auto space-y-2.5">
                    <Link
                      href={`/resources/${res.slug}`}
                      aria-label={`${res.accessType === "public" ? "Open" : "Get"} ${res.title}`}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 text-xs font-bold uppercase tracking-wider text-black hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
                    >
                      <Download className="w-4 h-4" aria-hidden />
                      <span>{res.accessType === "public" ? "Open PDF" : "Get this PDF"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden />
                    </Link>
                    {res.accessType !== "public" && (
                      <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                        <Lock className="w-3 h-3 text-cyan-400" aria-hidden />
                        Free with verified account
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

