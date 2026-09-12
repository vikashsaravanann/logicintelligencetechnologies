import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { servicesData } from "@/data/servicesData";
import { ArrowLeft, CheckCircle2, Layers, Cpu, ShieldCheck, Zap, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import Breadcrumbs from "@/components/ui/breadcrumbs";
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

  const serviceVisualSrc = `/images/services/${canonicalSlug}.svg`;

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-28 pb-20 overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { name: "Services", url: "/services" },
              { name: service.title, url: `/services/${service.slug}` },
            ]}
          />
        </div>

        {/* Hero Visual Banner */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-black/50">
          <SafeImage
            src={serviceVisualSrc}
            alt={`${service.title} Architecture`}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Hero Description & Strategic Overview */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            {service.subtitle}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            {service.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-4xl leading-relaxed whitespace-pre-line mb-8">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-7 py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center gap-2 group"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/free-demo"
              className="px-7 py-3.5 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
            >
              Request Free Demo
            </Link>
          </div>
        </div>

        {/* What We Build & Tech Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Deliverables / What We Build */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>Scope &amp; Core Capabilities</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {service.whatWeBuild?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" />
              <span>Technology Stack</span>
            </h2>
            {service.techStack && Object.keys(service.techStack).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(service.techStack).map(([category, techs]) => (
                  <div key={category}>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(techs as string[]).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Customized per enterprise requirement: Next.js, Node.js, PostgreSQL, AWS, Docker.</p>
            )}
          </div>
        </div>

        {/* Engineering Process */}
        {service.process && service.process.length > 0 && (
          <ProcessTimeline
            steps={service.process}
            title="Our Structured Engineering Process"
            subtitle="Transparent milestones and deliverables throughout development."
          />
        )}

        {/* Pricing Tiers & Why Us */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {service.pricing && service.pricing.length > 0 && (
            <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
                Investment Tiers
              </h3>
              <div className="space-y-4">
                {service.pricing.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="font-bold text-sm text-white">{p.tier}</span>
                    <span className="text-primary font-black text-sm">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {service.whyUs && service.whyUs.length > 0 && (
            <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
                Why Logic Intelligence
              </h3>
              <div className="space-y-4">
                {service.whyUs.map((w, idx) => (
                  <div key={idx}>
                    <h4 className="text-sm font-bold text-white mb-1">{w.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <FAQAccordion
            items={service.faqs}
            title="Service Technical FAQs"
            subtitle="Frequently asked questions about ownership, hosting, maintenance, and delivery."
          />
        )}

        {/* Bottom Conversion CTA */}
        <CTASection
          title="Ready to Engineer Your System?"
          subtitle="Connect directly with our engineering team in Coimbatore for an architectural roadmap."
          primaryCta={{ label: "Schedule Discovery Call", href: "/book-consultation" }}
          secondaryCta={{ label: "Request Free Demo", href: "/free-demo" }}
        />
      </div>
    </div>
  );
}
