import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import { notFound } from "next/navigation";
import { PDF_RESOURCES } from "@/config/pdfs";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import ResourceDownloadForm from "./components/ResourceDownloadForm";
import SafeImage from "@/components/ui/safe-image";
import { getViewer } from "@/lib/auth/viewer";
import PageShell from "@/components/layout/page-shell";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = PDF_RESOURCES.find((r) => r.slug === slug);

  if (!res) {
    return { title: "Resource Not Found | Logic Intelligence Technologies" };
  }

  const ogUrl = `/api/og?title=${encodeURIComponent(res.title)}&category=${encodeURIComponent(res.category)}&tagline=Verified+PDF+Technical+Download`;

  return {
    title: `${res.title} | Technical Download | Logic Intelligence Technologies`,
    description: res.description,
    alternates: {
      canonical: `/resources/${slug}`,
    },
    openGraph: {
      title: res.title,
      description: res.description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: res.title }],
    },
  };
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = PDF_RESOURCES.find((r) => r.slug === slug);

  if (!res) {
    notFound();
  }

  const viewer = await getViewer();

  return (
    <PageShell>
      <div className="relative min-h-screen text-white pt-28 pb-20 overflow-hidden">
        {/* Ambient Lighting */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[85%] h-[55%] bg-[radial-gradient(ellipse_at_center,_rgba(69,217,210,0.10)_0%,_rgba(0,0,0,0)_70%)]" />
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[65%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(31,169,162,0.06)_0%,_rgba(0,0,0,0)_60%)]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BackToHome href="/resources" label="Back to Resources" inline className="mb-6" />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Cover & Details */}
            <div className="lg:col-span-7">
              {/* Visual Cover Mockup */}
              <div className="w-full aspect-[16/10] relative rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-black/40">
                <SafeImage
                  src={res.coverImage}
                  alt={`${res.title} Document Cover`}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <FileText className="w-3.5 h-3.5" />
                <span>{res.category}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                {res.title}
              </h1>

              <p className="text-base text-zinc-300 leading-relaxed mb-6 font-light">
                {res.description}
              </p>

              <a
                href="#get-pdf"
                className="lg:hidden mb-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 text-xs font-bold uppercase tracking-wider text-black hover:opacity-95 shadow-lg shadow-cyan-500/25"
              >
                <Download className="h-4 w-4" aria-hidden />
                Get this PDF
              </a>

              <div className="rounded-2xl border border-white/10 bg-[#151922] p-6 mb-8">
                <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4">
                  What’s Included in This Document:
                </h2>
                <div className="space-y-3">
                  {[
                    "Complete architectural diagrams & flowcharts",
                    "Actionable checklists for engineering & leadership",
                    "Security & regulatory compliance references",
                    "Implementation timeline estimates & resource allocation",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 border-t border-white/10 pt-6">
                <div>
                  <span className="font-semibold text-white">Version:</span> {res.version}
                </div>
                <div>
                  <span className="font-semibold text-white">Format:</span> Portable Document Format (PDF)
                </div>
                <div>
                  <span className="font-semibold text-white">Updated:</span> {res.publishedAt}
                </div>
              </div>
            </div>

            {/* Right Column: Download Form */}
            <div id="get-pdf" className="lg:col-span-5 scroll-mt-28 rounded-2xl border border-white/10 bg-[#151922] p-6 sm:p-8 backdrop-blur-sm shadow-2xl lg:sticky lg:top-28">
              <h2 className="text-xl font-bold text-white mb-2">Get this PDF</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                Free for signed-in members. Confirm your details and receive your secure download link.
              </p>

              <ResourceDownloadForm resource={res} viewer={viewer} />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

