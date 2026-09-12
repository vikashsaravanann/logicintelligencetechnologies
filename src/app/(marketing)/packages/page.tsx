import { Metadata } from 'next';
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
    images: [{ url: '/assets/og-banner.jpg', width: 1200, height: 630, alt: 'LIT Packages & Pricing' }],
  },
};

export default function PackagesAndServicesPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-20">
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
      <section className="relative overflow-hidden">
        <PageBackdrop src="/assets/jobs/studio-hero.jpg" />
        <div className="relative z-10">
          <PackagesSection />
        </div>
      </section>
      
      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">Our Core Services</h2>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-6">Expert Solutions for Your Digital Needs</h3>
          <p className="text-zinc-400">Discover our comprehensive range of specialized services tailored to elevate your business in the digital landscape.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {servicesData.map((service) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <Link key={service.slug} href={`/packages/${service.slug}`} className="group relative p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-primary/50 transition-all overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="bg-white/5 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{service.title}</h4>
                <p className="text-zinc-400 text-sm line-clamp-2">{service.subtitle}</p>
                <div className="mt-auto pt-4 flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  Explore Service <span className="ml-2">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
