import { Metadata } from "next";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, faqPage, packageOffers, PACKAGES_FAQ } from "@/lib/seo/schema";
import PackagesSection from "@/features/home/components/packages-section";
import Link from "next/link";
import { servicesData } from "@/data/servicesData";
import CTASection from "@/components/ui/cta-section";
import { 
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart, 
  Smartphone, Search, Palette, Brush, Layout, UploadCloud, 
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud,
  Sparkles, ArrowRight
} from "lucide-react";

const iconMap: Record<string, any> = {
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart,
  Smartphone, Search, Palette, Brush, Layout, UploadCloud,
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud
};

export const metadata: Metadata = {
  title: "Packages & Services | Logic Intelligence Technologies",
  description: "Transparent, fixed-price packages and expert services for web development, e-commerce, and enterprise software.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: "Pricing Packages | Logic Intelligence Technologies",
    description: "Digital Launch Pack from ₹8,999 · Business Pro from ₹18,999 · Enterprise from ₹50,000. Transparent fixed-price packages for web, e-commerce, and AI software.",
    images: [{ url: "/assets/og-banner.png", width: 1200, height: 630, alt: "LIT Packages & Pricing" }],
  },
};

export default function PackagesAndServicesPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Back to Home" inline />
        </div>

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
        <section className="relative pt-6 pb-14 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Transparent Commercial Models</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.08] mb-6">
            Engineered Packages &amp; Specialized Services
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Deterministic delivery, verifiable engineering milestones, and clear fixed-fee pricing.
            Explore our curated flagship packages or engage individual domain capabilities.
          </p>
        </section>

        {/* Flagship Packages Section */}
        <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-xs mb-16">
          <PackagesSection />
        </div>
        
        {/* Core Services Grid */}
        <section className="py-12 relative">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] text-xs font-semibold tracking-wider uppercase mb-3 shadow-2xs">
              Capabilities Catalog
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-4 tracking-tight">
              Specialized Engineering &amp; Digital Services
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Every service is backed by production-grade software architecture, automated CI/CD pipelines,
              and robust code quality guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.map((service) => {
              const Icon = iconMap[service.icon] || Code;
              return (
                <Link
                  key={service.slug}
                  href={`/packages/${service.slug}`}
                  className="group relative p-7 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-[#1565C0]/40 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-[#1565C0]/20 bg-[#E7F3FF] text-[#1565C0] group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-[#1565C0]" />
                    </div>
                    <h3 className="text-xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2.5 tracking-tight group-hover:text-[#1565C0] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {service.subtitle}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#1565C0]">
                    <span>Explore Service</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-12">
          <CTASection
            title="Need a Custom Enterprise Scope?"
            subtitle="Schedule a consultation with our solutions architects to tailor an engagement specifically to your team's architecture."
            primaryCta={{ label: "Schedule Architecture Call", href: "/book-consultation" }}
            secondaryCta={{ label: "Calculate Project ROI", href: "/roi-calculator" }}
          />
        </div>
      </div>
    </main>
  );
}
