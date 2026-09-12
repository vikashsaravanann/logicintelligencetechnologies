import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { servicesData } from "@/data/servicesData";
import { ArrowLeft, CheckCircle2, Layers, Cpu, ShieldCheck, Zap, ArrowRight, HelpCircle } from "lucide-react";

const serviceVisuals: Record<string, string> = {
  "full-stack-development":      "linear-gradient(135deg, #1a3a5c 0%, #0d1b2e 100%)",
  "hotel-website":               "linear-gradient(135deg, #3a2a1a 0%, #2e1b0d 100%)",
  "travel-agency-website":       "linear-gradient(135deg, #1a5c3a 0%, #0d2e1b 100%)",
  "ecommerce-website":           "linear-gradient(135deg, #3a1a5c 0%, #1e0d2e 100%)",
  "software-development":        "linear-gradient(135deg, #1a5c3a 0%, #0d2e1b 100%)",
  "game-development":            "linear-gradient(135deg, #5c1a3a 0%, #2e0d1b 100%)",
  "mobile-app-development":      "linear-gradient(135deg, #1a4a5c 0%, #0d2030 100%)",
  "seo-optimization":            "linear-gradient(135deg, #3a5c1a 0%, #1e2e0d 100%)",
  "ui-ux-design":                "linear-gradient(135deg, #5c1a4a 0%, #2e0d20 100%)",
  "logo-branding":               "linear-gradient(135deg, #5c3a1a 0%, #2e1b0d 100%)",
  "web-designing":               "linear-gradient(135deg, #1a1a5c 0%, #0d0d2e 100%)",
  "web-deployment":              "linear-gradient(135deg, #1a4a5c 0%, #0d2030 100%)",
  "business-website":            "linear-gradient(135deg, #1a3a5c 0%, #0d1b2e 100%)",
  "crm-software":                "linear-gradient(135deg, #1a5c3a 0%, #0d2e1b 100%)",
  "school-management-software":  "linear-gradient(135deg, #3a4a1a 0%, #1e260d 100%)",
  "billing-software":            "linear-gradient(135deg, #5c3a1a 0%, #2e1b0d 100%)",
  "api-development":             "linear-gradient(135deg, #1a3a5c 0%, #0d1b2e 100%)",
  "cloud-deployment":            "linear-gradient(135deg, #1a4a5c 0%, #0d2030 100%)",
  "ai-solutions":                "linear-gradient(135deg, #5c3a1a 0%, #2e1b0d 100%)",
  "ai-integration":              "linear-gradient(135deg, #5c3a1a 0%, #2e1b0d 100%)",
};

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

  return {
    title: `${service.title} | Enterprise Services | Logic Intelligence Technologies`,
    description: service.description.slice(0, 160),
    alternates: {
      canonical: `/services/${slug}`,
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

  const serviceHeroGradient = serviceVisuals[canonicalSlug] ?? "linear-gradient(135deg, #1a2a4a 0%, #0d1520 100%)";

  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>

        {/* Service Hero Visual */}
        <div
          className="relative rounded-3xl overflow-hidden mb-12 h-[200px] md:h-[260px]"
          style={{ background: serviceHeroGradient }}
        >
          <div className="absolute inset-0 opacity-[0.07] flex items-center justify-end pr-10">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="110" cy="110" r="100" stroke="white" strokeWidth="3" strokeDasharray="12 8" />
              <circle cx="110" cy="110" r="70" stroke="white" strokeWidth="2" strokeDasharray="8 6" />
              <circle cx="110" cy="110" r="40" stroke="white" strokeWidth="1.5" />
              <circle cx="110" cy="110" r="12" fill="white" />
              <line x1="110" y1="10" x2="110" y2="50" stroke="white" strokeWidth="2" />
              <line x1="110" y1="170" x2="110" y2="210" stroke="white" strokeWidth="2" />
              <line x1="10" y1="110" x2="50" y2="110" stroke="white" strokeWidth="2" />
              <line x1="170" y1="110" x2="210" y2="110" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
          <div className="relative z-10 p-8 md:p-12 flex items-end h-full">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-2 block">{service.subtitle}</span>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{service.title}</h1>
            </div>
          </div>
        </div>

        {/* Hero Description */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            {service.subtitle}
          </div>
          <p className="text-base sm:text-lg text-zinc-300 max-w-4xl leading-relaxed whitespace-pre-line mb-8">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book-consultation"
              className="px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] flex items-center gap-2"
            >
              <span>Book Strategy Call</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>

        {/* What We Build & Tech Stack Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Deliverables / What We Build */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>Scope & Core Capabilities</span>
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
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent" />
              <span>Technology Stack</span>
            </h2>
            {service.techStack ? (
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
              <p className="text-xs text-zinc-400">Customized per enterprise requirement.</p>
            )}
          </div>
        </div>

        {/* Engineering Process */}
        {service.process && service.process.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8 text-center">
              Our Structured Engineering Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.process.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] p-6 relative">
                  <div className="text-3xl font-black text-primary/30 mb-2">0{idx + 1}</div>
                  <h3 className="text-base font-bold text-white mb-2">{step.step}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tiers & Why Us */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {service.pricing && (
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
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

          {service.whyUs && (
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 lg:p-12 mb-16">
            <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-6">
              {service.faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-white/5 pb-4">
                  <h4 className="text-sm font-bold text-white mb-2">{faq.q}</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center py-10 border-t border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Project?</h3>
          <p className="text-zinc-400 text-sm mb-6">Connect with our engineering team for an architectural review.</p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)]"
          >
            <span>Schedule Discovery Call</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
