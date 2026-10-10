import { packagesData } from "@/data/packagesData";
import { servicesData, getServiceVisual } from "@/data/servicesData";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import { CheckCircle2, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { 
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart, 
  Smartphone, Search, Palette, Brush, Layout, UploadCloud, 
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud 
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";

const iconMap: Record<string, any> = {
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart,
  Smartphone, Search, Palette, Brush, Layout, UploadCloud,
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud
};

export function generateStaticParams() {
  const pkgParams = packagesData.map((pkg) => ({ slug: pkg.slug }));
  const srvParams = servicesData.map((srv) => ({ slug: srv.slug }));
  return [...pkgParams, ...srvParams];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packagesData.find((p) => p.slug === slug);
  const srv = servicesData.find((s) => s.slug === slug);
  
  const item = pkg || srv;
  if (!item) return { title: "Not Found | Logic Intelligence Technologies" };

  const ogUrl = `/api/og?title=${encodeURIComponent(item.title)}&category=${encodeURIComponent(pkg ? "Package" : "Service")}&tagline=${encodeURIComponent(item.subtitle)}`;
  
  return {
    title: `${item.title} | Logic Intelligence Technologies`,
    description: item.subtitle,
    alternates: {
      canonical: `/packages/${slug}`,
    },
    openGraph: {
      title: item.title,
      description: item.subtitle,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: item.title }],
    },
  };
}

export default async function PackageOrServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = packagesData.find((p) => p.slug === slug);
  const srv = servicesData.find((s) => s.slug === slug);
  
  if (!pkg && !srv) return notFound();

  if (pkg) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Navigation Breadcrumb */}
          <div className="mb-6">
            <BackButton fallbackHref="/packages" label="Back to Packages" inline />
          </div>

          <section className="text-center relative max-w-4xl mx-auto">
            {/* Visual Banner */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden mb-10 border border-[var(--lit-border-light,#DFE7EF)] shadow-sm bg-white">
              <SafeImage
                src={`/images/packages/${pkg.slug}.jpg`}
                alt={`${pkg.title} Architecture Visual`}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,37,69,0.35)] via-transparent to-transparent pointer-events-none" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Package Specifications</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-4 tracking-tight leading-[1.08]">
              {pkg.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-6 leading-relaxed">
              {pkg.subtitle}
            </p>
            <div className="mb-8">
              <span className="text-3xl sm:text-4xl font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                {pkg.price}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-mono block mt-1">
                Starting Investment · Fixed Price
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] shadow-sm transition-all w-full sm:w-auto text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Start Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book-consultation"
                className="px-8 py-3.5 rounded-xl font-bold text-[var(--lit-navy,#0B2545)] bg-white hover:bg-slate-50 transition-all w-full sm:w-auto border border-[var(--lit-border-light,#DFE7EF)] text-xs uppercase tracking-wider shadow-2xs"
              >
                Schedule Architecture Call
              </Link>
            </div>
          </section>

          {/* Inclusions */}
          <section className="py-12 max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-3xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-sm">
              <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-8 tracking-tight">
                What&apos;s Included
              </h2>
              <div className="space-y-6">
                {pkg.inclusions.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-full p-1 bg-[#E7F3FF] border border-[#1565C0]/20 shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#1565C0]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)]">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline */}
          {pkg.timeline && pkg.timeline.length > 0 && (
            <section className="py-10 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-8 text-center tracking-tight">
                Delivery Timeline &amp; Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.timeline.map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
                    <strong className="text-[#1565C0] font-mono text-sm block mb-1.5 uppercase tracking-wider font-semibold">
                      {item.day}
                    </strong>
                    <span className="text-slate-700 text-sm leading-relaxed">{item.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment Terms */}
          {pkg.paymentTerms && pkg.paymentTerms.length > 0 && (
            <section className="py-10 max-w-4xl mx-auto text-center">
              <h2 className="text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-6 tracking-tight">
                Payment Terms &amp; Protections
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {pkg.paymentTerms.map((term, i) => (
                  <div key={i} className="px-5 py-2.5 rounded-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-700 text-sm font-medium shadow-2xs">
                    {term}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <div className="mt-12">
            <CTASection
              title="Ready to Launch This Package?"
              subtitle="Schedule an onboarding call with our technical lead or request a working demo before any payment."
              primaryCta={{ label: "Start This Package", href: "/contact" }}
              secondaryCta={{ label: "Schedule Architecture Call", href: "/book-consultation" }}
            />
          </div>
        </div>
      </main>
    );
  }

  if (srv) {
    const Icon = iconMap[srv.icon] || Code;
    
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Navigation Breadcrumb */}
          <div className="mb-6">
            <BackButton fallbackHref="/packages" label="Back to Services" inline />
          </div>

          {/* Visual Banner */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden mb-10 border border-[var(--lit-border-light,#DFE7EF)] shadow-sm bg-white">
            <SafeImage
              src={getServiceVisual(srv.slug)}
              alt={`${srv.title} Architecture Visual`}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,37,69,0.35)] via-transparent to-transparent pointer-events-none" />
          </div>
          
          {/* Service Hero Section */}
          <section className="py-6 max-w-4xl mx-auto mb-10">
            <div className="bg-[#E7F3FF] p-3.5 rounded-2xl w-fit mb-6 border border-[#1565C0]/20 text-[#1565C0]">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-4 leading-tight tracking-tight">
              {srv.title}
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">{srv.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] shadow-sm transition-all w-full sm:w-auto text-center text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Start Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book-consultation"
                className="px-8 py-3.5 rounded-xl font-bold text-[var(--lit-navy,#0B2545)] bg-white hover:bg-slate-50 transition-all w-full sm:w-auto border border-[var(--lit-border-light,#DFE7EF)] text-center text-xs uppercase tracking-wider shadow-2xs"
              >
                Schedule Consultation
              </Link>
            </div>
          </section>

          {/* Description Section */}
          <section className="py-8 max-w-4xl mx-auto mb-10">
            <div className="space-y-4">
              {srv.description.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">{paragraph}</p>
              ))}
            </div>
          </section>

          {/* What We Build / Tech Stack */}
          <section className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {srv.whatWeBuild && srv.whatWeBuild.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
                <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-6 tracking-tight">
                  What We Build
                </h2>
                <ul className="space-y-4">
                  {srv.whatWeBuild.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1 bg-[#E7F3FF] border border-[#1565C0]/20 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#1565C0]" />
                      </div>
                      <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {srv.techStack && Object.keys(srv.techStack).length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
                <h2 className="text-2xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-6 tracking-tight">
                  Technologies We Use
                </h2>
                <div className="space-y-6">
                  {Object.entries(srv.techStack).map(([category, techArray], i) => (
                    <div key={i}>
                      <h3 className="text-xs uppercase tracking-widest text-[#1565C0] font-mono font-bold mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(techArray as string[]).map((tech, j) => (
                          <span key={j} className="px-3 py-1 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-700 font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Process */}
          {srv.process && srv.process.length > 0 && (
            <section className="py-10 max-w-5xl mx-auto mb-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2 tracking-tight">
                  Our Engineering Process
                </h2>
                <p className="text-slate-600 text-sm">Deterministic delivery methodology.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {srv.process.map((step, i) => (
                  <div key={i} className="bg-white border border-[var(--lit-border-light,#DFE7EF)] p-6 rounded-2xl relative overflow-hidden shadow-xs hover:border-[#1565C0]/40 transition-all">
                    <div className="text-5xl font-mono font-extrabold text-slate-100 absolute -right-2 -bottom-2 pointer-events-none">
                      {i + 1}
                    </div>
                    <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2 relative z-10">{step.step}</h3>
                    {step.desc && <p className="text-xs text-slate-600 relative z-10 leading-relaxed">{step.desc}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pricing Tiers */}
          {srv.pricing && srv.pricing.length > 0 && (
            <section className="py-10 max-w-5xl mx-auto mb-10">
              <h2 className="text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-10 text-center tracking-tight">
                Service Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {srv.pricing.map((tier, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0]/40 transition-all shadow-xs flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2 tracking-tight">{tier.tier}</h3>
                      <div className="text-2xl font-mono font-bold text-[var(--lit-navy,#0B2545)] mb-6">
                        {tier.price}
                      </div>
                      {'details' in tier && (tier as any).details.length > 0 && (
                        <ul className="space-y-3 mb-8">
                          {(tier as any).details.map((detail: string, j: number) => (
                            <li key={j} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                              <ChevronRight className="w-4 h-4 text-[#1565C0] shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
                      <Link
                        href="/contact"
                        className="w-full block text-center py-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] hover:bg-[var(--lit-navy,#0B2545)] hover:text-white text-[var(--lit-navy,#0B2545)] font-bold transition-all text-xs uppercase tracking-wider border border-[var(--lit-border-light,#DFE7EF)]"
                      >
                        Inquire Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {srv.faqs && srv.faqs.length > 0 && (
            <section className="py-10 max-w-3xl mx-auto mb-10">
              <h2 className="text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-8 text-center tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {srv.faqs.map((faq, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
                    <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">{faq.q}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <div className="mt-12">
            <CTASection
              title="Ready to Build With Us?"
              subtitle="Schedule an engineering review or request a working prototype before payment."
              primaryCta={{ label: "Schedule Consultation", href: "/book-consultation" }}
              secondaryCta={{ label: "Contact Engineering", href: "/contact" }}
            />
          </div>
        </div>
      </main>
    );
  }
}
