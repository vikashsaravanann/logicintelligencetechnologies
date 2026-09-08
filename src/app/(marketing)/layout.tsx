import dynamic from "next/dynamic";
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const SupportChatWidget = dynamic(() => import('@/components/shared/support-chat-widget'), { ssr: false });
const FloatingWhatsApp = dynamic(() => import('@/components/shared/floating-whatsapp'), { ssr: false });

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
      <SupportChatWidget />
      <FloatingWhatsApp />
    </>
  );
}
