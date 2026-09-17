import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ClientWidgets from '@/components/shared/client-widgets';
import InitialLoader from '@/components/motion/initial-loader';

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
        </div>
        <div className="relative z-[1]">{children}</div>
      </main>
      <Footer />
      <ClientWidgets />
    </>
  );
}
