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
      <main className="relative min-h-screen min-h-[100dvh] overflow-x-hidden bg-transparent">
        <div className="relative z-[1] w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </main>
      <Footer />
      <ClientWidgets />
    </>
  );
}
