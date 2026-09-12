import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PDF_RESOURCES } from "@/config/pdfs";
import { ArrowLeft, Download, FileText, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import ResourceDownloadForm from "./components/ResourceDownloadForm";
import SafeImage from "@/components/ui/safe-image";
import Breadcrumbs from "@/components/ui/breadcrumbs";

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

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-28 pb-20 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { name: "Resources", url: "/resources" },
              { name: res.title, url: `/resources/${res.slug}` },
            ]}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Cover & Details */}
          <div className="lg:col-span-7">
            {/* Visual Cover Mockup */}
            <div className="w-full aspect-[16/10] relative rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-black/40">
              <SafeImage
                src={res.coverImage}
                alt={`${res.title} Document Cover`}
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <FileText className="w-3.5 h-3.5" />
              <span>{res.category}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-6">
              {res.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8">
              {res.description}
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
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
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm shadow-2xl sticky top-28">
            <h2 className="text-xl font-bold text-white mb-2">Get Instant Access</h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Enter your corporate email to receive the direct download link and periodic technical whitepapers.
            </p>

            <ResourceDownloadForm resource={res} />
          </div>
        </div>
      </div>
    </div>
  );
}
