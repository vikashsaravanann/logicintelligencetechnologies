import { Metadata } from 'next';
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, faqPage, packageOffers, PACKAGES_FAQ } from "@/lib/seo/schema";
import FloatingElements from "@/components/motion/floating-elements";
import PackagesSection from "@/features/home/components/packages-section";
import Link from 'next/link';
import PageBackdrop from '@/components/ui/page-backdrop';
import { servicesData } from '@/data/servicesData';
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

export const metadata: Metadata = {
  title: 'Packages & Services | Logic Intelligence Technologies',
  description: 'Transparent, fixed-price packages and expert services for web development, e-commerce, and enterprise software.',
  openGraph: {
    title: 'Pricing Packages | Logic Intelligence Technologies',
    description: 'Digital Launch Pack from ₹8,999 · Business Pro from ₹18,999 · Enterprise from ₹50,000. Transparent fixed-price packages for web, e-commerce, and AI software.',
    images: [{ url: '/assets/og-banner.png', width: 1200, height: 630, alt: 'LIT Packages & Pricing' }],
  },
};

export default function PackagesAndServicesPage() {
  return (
    <div className="min-h-screen bg-[#07090D] text-white pt-24 pb-20">
      <BackToHome href="/" label="Back to Home" />
      <JsonLd
        data={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Packages", path: "/packages" },
          ]),
          packageOffers(),
          faqPage(`${SITE}/packages`, PACKAGES_FAQ),
        ]}
      />

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#1FA9A2]/10 blur-[120px] rounded-full pointer-events-none"
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-[#45D9D2]/30 bg-[#45D9D2]/10">
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2]">
              Transparent Commercial Models
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Engineered Packages &{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#45D9D2] via-[#1FA9A2] to-[#1565C0]">
              Specialized Services
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Deterministic delivery, verifiable engineering milestones, and clear fixed-fee pricing.
            Explore our curated flagship packages or engage individual domain capabilities.
          </p>
        </div>
      </section>

      {/* Packages Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10">
          <PackagesSection />
        </div>
      </section>
      
      {/* Core Services Grid */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#45D9D2] mb-3 block">
            Capabilities Catalog
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            Specialized Engineering & Digital Services
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Every service is backed by production-grade software architecture, automated CI/CD pipelines,
            and robust code quality guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {servicesData.map((service) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <Link
                key={service.slug}
                href={`/packages/${service.slug}`}
                className="group relative p-7 rounded-2xl bg-[#151922] border border-white/5 hover:border-[#1FA9A2]/30 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl bg-[#1FA9A2]/20"
                />
                <div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-[#1FA9A2]/30 bg-[#1FA9A2]/10 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-[#45D9D2]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight group-hover:text-[#45D9D2] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {service.subtitle}
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-white/5 flex items-center text-xs font-mono font-semibold uppercase tracking-wider text-[#45D9D2]">
                  <span>Explore Service</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <FloatingElements />
    </div>
  );
}
