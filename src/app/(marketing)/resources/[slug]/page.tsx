import { Metadata } from "next";
import { notFound } from "next/navigation";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { PDF_RESOURCES } from "@/config/pdfs";
import { Download, FileText, CheckCircle2, ShieldCheck, Calendar, Layers, Hash } from "lucide-react";
import ResourceDownloadForm from "./components/ResourceDownloadForm";
import SafeImage from "@/components/ui/safe-image";
import { getViewer } from "@/lib/auth/viewer";
import PageShell from "@/components/layout/page-shell";
import CTASection from "@/components/ui/cta-section";

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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Corporate: { bg: "bg-[#EDE7F6]", text: "text-[#5E35B1]", border: "border-[#D1C4E9]" },
  Services: { bg: "bg-[#E7F3FF]", text: "text-[#1565C0]", border: "border-[#BBDEFB]" },
  "AI & Automation": { bg: "bg-[#E0F2F1]", text: "text-[#00796B]", border: "border-[#B2DFDB]" },
  "Case Studies": { bg: "bg-[#FFF8E1]", text: "text-[#B78103]", border: "border-[#FFE082]" },
  Pricing: { bg: "bg-[#F3E5F5]", text: "text-[#7B1FA2]", border: "border-[#E1BEE7]" },
  Guides: { bg: "bg-[#FCE4EC]", text: "text-[#C2185B]", border: "border-[#F8BBD0]" },
  Engineering: { bg: "bg-[#E1F5FE]", text: "text-[#0277BD]", border: "border-[#B3E5FC]" },
  Security: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#C8E6C9]" },
  "Press & Media": { bg: "bg-[#E0F7FA]", text: "text-[#00838F]", border: "border-[#B2EBF2]" },
  Investors: { bg: "bg-[#ECEFF1]", text: "text-[#37474F]", border: "border-[#CFD8DC]" },
};

const INCLUDED_ITEMS = [
  "Complete architectural schematics, system topologies, and state machines",
  "Actionable implementation checklists with engineering readiness gates",
  "Regulatory compliance references (DPDP Act, GDPR, and ISO 27001 hardening)",
  "Resource allocation blueprints and delivery timeline estimates",
  "Deterministic code patterns and zero-trust security policies",
];

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = PDF_RESOURCES.find((r) => r.slug === slug);

  if (!res) {
    notFound();
  }

  const viewer = await getViewer();
  const catStyle = CATEGORY_COLORS[res.category] || {
    bg: "bg-[#E7F3FF]",
    text: "text-[#1565C0]",
    border: "border-[#BBDEFB]",
  };

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
            { name: "Resources", path: "/resources" },
            { name: res.title, path: `/resources/${slug}` },
          ])}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <BackButton fallbackHref="/resources" label="Resources Library" inline />
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cover & Details */}
            <div className="lg:col-span-7 space-y-8">
              {/* Cover Mockup */}
              <div className="w-full aspect-[16/10] relative rounded-2xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-slate-100 shadow-sm">
                <SafeImage
                  src={res.coverImage}
                  alt={`${res.title} Document Cover`}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Title & Metadata Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{res.category}</span>
                  </span>
                  <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                    Document Ref: LIT-{res.slug.toUpperCase().slice(0, 8)}
                  </span>
                </div>

                <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                  {res.title}
                </h1>

                <p className="text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
                  {res.description}
                </p>

                {/* Mobile Quick Download Jump */}
                <div className="pt-2 lg:hidden">
                  <a
                    href="#get-pdf"
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all"
                  >
                    <Download className="h-4 w-4 text-cyan-300" aria-hidden />
                    <span>Get this PDF</span>
                  </a>
                </div>
              </div>

              {/* What's Included */}
              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 shadow-sm space-y-4">
                <h2 className="font-poppins text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                  What&apos;s Included in This Document:
                </h2>
                <div className="space-y-3">
                  {INCLUDED_ITEMS.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--lit-ink,#121826)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Strip */}
              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2.5 text-[var(--lit-text-muted,#52677C)]">
                    <Layers className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[var(--lit-navy,#0B2545)]">Format</span>
                      <span>Vector PDF (Print/Digital)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-[var(--lit-text-muted,#52677C)] col-span-2 sm:col-span-1">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[var(--lit-navy,#0B2545)]">Last Published</span>
                      <span>{res.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Assurance */}
              <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
                  <div className="text-xs text-[var(--lit-text-muted,#52677C)] space-y-1">
                    <p className="font-semibold text-[var(--lit-navy,#0B2545)]">Verified Enterprise Document Delivery</p>
                    <p>Documents are delivered via cryptographic single-use download tokens. All downloads are logged for regulatory audit trails and version authenticity.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Download Form (Sticky) */}
            <div
              id="get-pdf"
              className="lg:col-span-5 scroll-mt-28 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-md lg:sticky lg:top-32 space-y-4"
            >
              <div>
                <h2 className="font-poppins text-xl font-bold text-[var(--lit-navy,#0B2545)]">
                  Get this PDF
                </h2>
                <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed mt-1">
                  Free for signed-in members. Confirm your details to generate your authenticated download token.
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <ResourceDownloadForm resource={res} viewer={viewer} />
              </div>
            </div>
          </div>

          {/* Bottom Canonical CTA */}
          <div className="mt-20">
            <CTASection
              title="Need Bespoke Architecture for Your Organization?"
              subtitle="Our principal architects work directly with your engineering leads to design, validate, and execute mission-critical systems."
              primaryCta={{
                label: "Schedule Technical Discovery",
                href: "/discovery",
              }}
              secondaryCta={{
                label: "Browse All Resources",
                href: "/resources",
              }}
            />
          </div>
        </div>
      </main>
    </PageShell>
  );
}
