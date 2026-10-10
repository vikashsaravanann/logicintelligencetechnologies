import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import { notFound } from "next/navigation";
import Link from "next/link";
import { servicesData, getServiceVisual } from "@/data/servicesData";
import { ArrowLeft, CheckCircle2, Layers, Cpu, ShieldCheck, Zap, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import ProcessTimeline from "@/components/ui/process-timeline";
import FAQAccordion from "@/components/ui/faq-accordion";
import CTASection from "@/components/ui/cta-section";

// Alias resolution map to handle canonical routes from audit
const SLUG_ALIASES: Record<string, string> = {
  "web-development": "full-stack-development",
  "ai-development": "software-development",
  "business-automation": "crm-software",
  "custom-software": "software-development",
  "cloud-solutions": "cloud-deployment",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = SLUG_ALIASES[slug] || slug;
  const service = servicesData.find((s) => s.slug === canonicalSlug);

  if (!service) {
    return { title: "Service Not Found | Logic Intelligence Technologies" };
  }

  const ogUrl = `/api/og?title=${encodeURIComponent(service.title)}&category=${encodeURIComponent("Engineering Service")}&tagline=${encodeURIComponent(service.subtitle)}`;

  return {
    title: `${service.title} | Enterprise Engineering | Logic Intelligence Technologies`,
    description: service.description.slice(0, 160),
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title: service.title,
      description: service.subtitle,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: service.title }],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const canonicalSlug = SLUG_ALIASES[slug] || slug;
  const service = servicesData.find((s) => s.slug === canonicalSlug);

  if (!service) {
    notFound();
  }

  const serviceVisualSrc = getServiceVisual(canonicalSlug);

  return (
    <div className="relative min-h-screen bg-[#07090D] text-white pt-28 pb-20 overflow-hidden">
      <BackToHome href="/services" label="Back to Solutions" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Hero Visual Banner */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-[#10131A]">
          <SafeImage
            src={serviceVisualSrc}
            alt={`${service.title} Architecture`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-transparent opacity-80" />
        </div>

        {/* Hero Description & Strategic Overview */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{service.subtitle}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.08]">
            {service.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-4xl leading-relaxed whitespace-pre-line mb-8">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-8 py-4 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all flex items-center gap-2 group shadow-lg"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/free-demo"
              className="px-7 py-4 rounded-xl border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Request Free Working Demo
            </Link>
          </div>
        </div>

        {/* What We Build & Tech Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Deliverables / What We Build */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#45D9D2]" />
              <span>Scope &amp; Core Deliverables</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {service.whatWeBuild?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#151922] border border-white/5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#45D9D2]" />
                <span>Production Stack</span>
              </h2>
              {service.techStack && Object.keys(service.techStack).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(service.techStack).map(([category, techs]) => (
                    <div key={category}>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(techs as string[]).map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg bg-[#151922] border border-white/10 text-xs font-medium text-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Customized per enterprise requirement: Next.js App Router, TypeScript, Python FastAPI, PostgreSQL, Supabase, and AWS.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#45D9D2]" />
              <span>Full source code ownership on project completion</span>
            </div>
          </div>
        </div>

        {/* Engineering Process */}
        {service.process && service.process.length > 0 && (
          <div className="mb-16">
            <ProcessTimeline
              steps={service.process}
              title="Structured Engineering Process"
              subtitle="Deterministic milestones, code reviews, and measurable deliveries."
            />
          </div>
        )}

        {/* Pricing Tiers & Why Us */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {service.pricing && service.pricing.length > 0 && (
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#45D9D2]" />
                <span>Published Investment Tiers</span>
              </h3>
              <div className="space-y-3">
                {service.pricing.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#151922] border border-white/5"
                  >
                    <span className="font-semibold text-sm text-white">{p.tier}</span>
                    <span className="text-[#45D9D2] font-mono font-bold text-sm">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {service.whyUs && service.whyUs.length > 0 && (
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#45D9D2]" />
                <span>The LIT Engineering Advantage</span>
              </h3>
              <div className="space-y-4">
                {service.whyUs.map((w, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#151922] border border-white/5">
                    <h4 className="text-sm font-bold text-white mb-1">{w.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="mb-16">
            <FAQAccordion
              items={service.faqs}
              title="Technical FAQs & Specifications"
              subtitle="Frequently addressed questions about IP ownership, hosting architecture, and SLA guarantees."
            />
          </div>
        )}

        {/* Bottom Conversion CTA */}
        <CTASection
          title="Ready to Build Your System?"
          subtitle="Connect directly with our engineering team in Coimbatore for an architectural roadmap and working prototype."
          primaryCta={{ label: "Schedule Architecture Review", href: "/book-consultation" }}
          secondaryCta={{ label: "Request Free Demo", href: "/free-demo" }}
        />
      </div>
    </div>
  );
}
