import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ClientWidgets from '@/components/shared/client-widgets';
import InitialLoader from '@/components/motion/initial-loader';
import AmbientTechBackground from '@/components/motion/ambient-tech-background';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InitialLoader />
      <Navbar />
      <main className="min-h-screen bg-[#0A0F1E] relative">
        {/* Fixed ambient — all marketing pages A→Z */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <AmbientTechBackground opacity={0.3} />
        </div>
        <div className="relative z-[1]">{children}</div>
      </main>
      <Footer />
      <ClientWidgets />
    </>
  );
}
