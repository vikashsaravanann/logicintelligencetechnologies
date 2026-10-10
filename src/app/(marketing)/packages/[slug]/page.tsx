import { packagesData } from "@/data/packagesData";
import { servicesData, getServiceVisual } from "@/data/servicesData";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import { CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { 
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart, 
  Smartphone, Search, Palette, Brush, Layout, UploadCloud, 
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart,
  Smartphone, Search, Palette, Brush, Layout, UploadCloud,
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud
};

import SafeImage from "@/components/ui/safe-image";

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
  if (!item) return { title: "Not Found" };

  const ogUrl = `/api/og?title=${encodeURIComponent(item.title)}&category=${encodeURIComponent(pkg ? "Package" : "Service")}&tagline=${encodeURIComponent(item.subtitle)}`;
  
  return {
    title: `${item.title} | Logic Intelligence Technologies`,
    description: item.subtitle,
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
      <div className="min-h-screen bg-[#07090D] text-white pt-28 pb-20">
        <BackToHome href="/packages" label="Back to Packages" />

        <section className="px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
          {/* Visual Banner */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl bg-[#10131A]">
            <SafeImage
              src={`/images/packages/${pkg.slug}.jpg`}
              alt={`${pkg.title} Architecture Visual`}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[300px] opacity-15 blur-[120px] bg-gradient-to-r from-[#1565C0] to-[#1FA9A2] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#45D9D2]/30 bg-[#45D9D2]/10 relative z-10">
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
              Package Specifications
            </span>
          </div>

          <h1 className="uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 relative z-10 tracking-tight">
            {pkg.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-6 relative z-10 leading-relaxed">
            {pkg.subtitle}
          </p>
          <p className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-[#1FA9A2] to-[#1565C0] mb-10 relative z-10 font-mono">
            {pkg.price}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#1565C0] to-[#1FA9A2] hover:brightness-110 shadow-lg shadow-[#1565C0]/20 transition-all w-full sm:w-auto text-sm uppercase tracking-wider"
            >
              Start Project
            </Link>
            <a
              href="https://wa.me/917550067712"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-bold text-slate-200 bg-white/5 hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto border border-white/10 text-sm uppercase tracking-wider"
            >
              WhatsApp Us
            </a>
          </div>
        </section>

        <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="p-8 md:p-12 rounded-3xl bg-[#151922] border border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">What&apos;s Included</h2>
            <div className="space-y-6">
              {pkg.inclusions.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 rounded-full p-1 bg-[#1FA9A2]/15 border border-[#1FA9A2]/30 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#45D9D2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {pkg.timeline && pkg.timeline.length > 0 && (
          <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center tracking-tight">Delivery Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.timeline.map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border border-white/5 bg-[#151922]">
                  <strong className="text-[#45D9D2] font-mono text-sm block mb-1.5 uppercase tracking-wider">
                    {item.day}
                  </strong>
                  <span className="text-slate-300 text-sm leading-relaxed">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {pkg.paymentTerms && pkg.paymentTerms.length > 0 && (
          <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Payment Terms</h2>
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center">
              {pkg.paymentTerms.map((term, i) => (
                <div key={i} className="px-6 py-3 rounded-full bg-[#151922] border border-white/10 text-slate-300 text-sm font-medium">
                  {term}
                </div>
              ))}
            </div>
          </section>
        )}

        <FloatingElements />
      </div>
    );
  }

  if (srv) {
    const Icon = iconMap[srv.icon] || Code;
    
    return (
      <div className="min-h-screen bg-[#07090D] text-white pt-28 pb-20">
        <BackToHome href="/packages" label="Back to Services" />

        {/* Visual Banner */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#10131A]">
            <SafeImage
              src={getServiceVisual(srv.slug)}
              alt={`${srv.title} Architecture Visual`}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Service Hero Section */}
        <section className="py-12 px-6 lg:px-8 max-w-6xl mx-auto relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-15 blur-[120px] bg-[#1FA9A2] pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-12 relative z-10">
            <div className="flex-1">
              <div className="bg-[#1FA9A2]/10 p-4 rounded-2xl w-fit mb-6 border border-[#1FA9A2]/30">
                <Icon className="w-10 h-10 text-[#45D9D2]" />
              </div>
              <h1 className="uppercase text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {srv.title}
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">{srv.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#1565C0] to-[#1FA9A2] hover:brightness-110 shadow-lg shadow-[#1565C0]/20 transition-all w-full sm:w-auto text-center text-sm uppercase tracking-wider"
                >
                  Start Project
                </Link>
                <a
                  href="https://wa.me/917550067712"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl font-bold text-slate-200 bg-white/5 hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto border border-white/10 text-center text-sm uppercase tracking-wider"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="py-12 px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none">
            {srv.description.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-lg text-slate-300 leading-relaxed mb-6">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* What We Build / Tech Stack */}
        <section className="py-16 px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {srv.whatWeBuild && srv.whatWeBuild.length > 0 && (
            <div className="bg-[#151922] p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">What We Build</h2>
              <ul className="space-y-4">
                {srv.whatWeBuild.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full p-1 bg-[#1FA9A2]/15 border border-[#1FA9A2]/30 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#45D9D2]" />
                    </div>
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {srv.techStack && Object.keys(srv.techStack).length > 0 && (
            <div className="bg-[#151922] p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Technologies We Use</h2>
              <div className="space-y-6">
                {Object.entries(srv.techStack).map(([category, techArray], i) => (
                  <div key={i}>
                    <h3 className="text-xs uppercase tracking-widest text-[#45D9D2] font-mono font-bold mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(techArray as string[]).map((tech, j) => (
                        <span key={j} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
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
          <section className="py-16 px-6 lg:px-8 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Our Process</h2>
              <p className="text-slate-400 text-sm">Deterministic delivery methodology.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {srv.process.map((step, i) => (
                <div key={i} className="bg-[#151922] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-[#1FA9A2]/30 transition-all duration-300">
                  <div className="text-5xl font-mono font-extrabold text-white/5 absolute -right-2 -bottom-2 group-hover:text-[#45D9D2]/10 transition-colors">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 relative z-10">{step.step}</h3>
                  {step.desc && <p className="text-xs text-slate-400 relative z-10 leading-relaxed">{step.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing Tiers */}
        {srv.pricing && srv.pricing.length > 0 && (
          <section className="py-16 px-6 lg:px-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center tracking-tight">Service Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {srv.pricing.map((tier, i) => (
                <div key={i} className="bg-[#151922] p-8 rounded-3xl border border-white/5 hover:border-[#1FA9A2]/30 transition-all duration-300 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{tier.tier}</h3>
                    <div className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] to-[#1FA9A2] mb-6">
                      {tier.price}
                    </div>
                    {'details' in tier && (tier as any).details.length > 0 && (
                      <ul className="space-y-3 mb-8">
                        {(tier as any).details.map((detail: string, j: number) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                            <ChevronRight className="w-4 h-4 text-[#45D9D2] shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <Link
                      href="/contact"
                      className="w-full block text-center py-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-[#1565C0] hover:to-[#1FA9A2] text-white font-bold transition-all text-xs uppercase tracking-wider"
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
          <section className="py-16 px-6 lg:px-8 max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {srv.faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#151922] border border-white/5">
                  <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <FloatingElements />
      </div>
    );
  }
}
