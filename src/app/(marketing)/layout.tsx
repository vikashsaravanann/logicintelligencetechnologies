import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ClientWidgets from '@/components/shared/client-widgets';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0F1E]">{children}</main>
      <Footer />
      <ClientWidgets />
    </>
  );
}
