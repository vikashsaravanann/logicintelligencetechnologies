import { packagesData } from "@/data/packagesData";
import { servicesData } from "@/data/servicesData";
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
import Breadcrumbs from "@/components/ui/breadcrumbs";

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
      <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 mb-8">
          <Breadcrumbs
            items={[
              { name: "Packages", url: "/packages" },
              { name: pkg.title, url: `/packages/${pkg.slug}` },
            ]}
          />
        </div>

        <section className="px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
          {/* Visual Banner */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl bg-black/50">
            <SafeImage
              src={`/images/packages/${pkg.slug}.svg`}
              alt={`${pkg.title} Architecture Visual`}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[300px] opacity-[0.1] blur-[100px] bg-gradient-to-r from-primary to-accent pointer-events-none" />
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 relative z-10">{pkg.title}</h1>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto mb-6 relative z-10">{pkg.subtitle}</p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-10 relative z-10">{pkg.price}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href="/contact" className="px-8 py-4 rounded-xl font-bold text-black bg-primary neon-btn w-full sm:w-auto">Get Started</Link>
            <a href="https://wa.me/919342877474" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors w-full sm:w-auto border border-white/10">WhatsApp Us</a>
          </div>
        </section>

        <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="p-8 md:p-6 md:p-12 rounded-3xl glass-card bg-zinc-900/60 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-8">What's Included</h2>
            <div className="space-y-6">
              {pkg.inclusions.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {pkg.timeline && pkg.timeline.length > 0 && (
          <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Delivery Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.timeline.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <strong className="text-primary block mb-1">{item.day}</strong>
                  <span className="text-zinc-300">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {pkg.paymentTerms && pkg.paymentTerms.length > 0 && (
          <section className="py-16 px-6 lg:px-8 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Terms</h2>
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center">
              {pkg.paymentTerms.map((term, i) => (
                <div key={i} className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-zinc-300">
                  {term}
                </div>
              ))}
            </div>
          </section>
        )}

        <FloatingElements />
      </main>
    );
  }

  if (srv) {
    const Icon = iconMap[srv.icon] || Code;
    
    return (
      <main className="min-h-screen bg-[#0A0F1E] text-white pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <Breadcrumbs
            items={[
              { name: "Services", url: "/services" },
              { name: srv.title, url: `/packages/${srv.slug}` },
            ]}
          />
        </div>

        {/* Visual Banner */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
            <SafeImage
              src={`/images/services/${srv.slug}.svg`}
              alt={`${srv.title} Architecture Visual`}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Service Hero Section */}
        <section className="py-12 px-6 lg:px-8 max-w-6xl mx-auto relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 blur-[120px] bg-primary pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-12 relative z-10">
            <div className="flex-1">
              <div className="bg-white/5 p-4 rounded-2xl w-fit mb-6 border border-white/10">
                <Icon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">{srv.title}</h1>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl">{srv.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="px-8 py-4 rounded-xl font-bold text-black bg-primary neon-btn w-full sm:w-auto text-center">Request Quote</Link>
                <a href="https://wa.me/919342877474" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors w-full sm:w-auto border border-white/10 text-center">Chat on WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="py-12 px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none">
            {srv.description.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-lg text-zinc-300 leading-relaxed mb-6">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* What We Build / Tech Stack */}
        <section className="py-16 px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {srv.whatWeBuild && srv.whatWeBuild.length > 0 && (
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8">What We Build</h2>
              <ul className="space-y-4">
                {srv.whatWeBuild.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {srv.techStack && Object.keys(srv.techStack).length > 0 && (
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8">Technologies We Use</h2>
              <div className="space-y-6">
                {Object.entries(srv.techStack).map(([category, techArray], i) => (
                  <div key={i}>
                    <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(techArray as string[]).map((tech, j) => (
                        <span key={j} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300">
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
              <h2 className="text-3xl font-bold text-white mb-4">Our Process</h2>
              <p className="text-zinc-400">How we bring your project to life.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {srv.process.map((step, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="text-5xl font-black text-white/5 absolute -right-2 -bottom-2 group-hover:text-primary/10 transition-colors">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 relative z-10">{step.step}</h3>
                  {step.desc && <p className="text-sm text-zinc-400 relative z-10">{step.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing Tiers */}
        {srv.pricing && srv.pricing.length > 0 && (
          <section className="py-16 px-6 lg:px-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Service Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {srv.pricing.map((tier, i) => (
                <div key={i} className="bg-zinc-900/60 p-8 rounded-3xl border border-white/10 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.tier}</h3>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6">{tier.price}</div>
                  {'details' in tier && (tier as any).details.length > 0 && (
                    <ul className="space-y-3 mb-8 flex-1">
                      {(tier as any).details.map((detail: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto pt-8 block w-full">
                    <Link href="/contact" className="w-full block text-center py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
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
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {srv.faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-zinc-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <FloatingElements />
      </main>
    );
  }
}
