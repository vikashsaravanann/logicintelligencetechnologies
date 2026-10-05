"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SupportChatWidget = dynamic(() => import("./support-chat-widget"), { ssr: false });
const FloatingWhatsApp = dynamic(() => import("./floating-whatsapp"), { ssr: false });

/** Floating AI chat is site-wide except support flows (ticket form is the support channel). */
function shouldHideAiChat(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/support" ||
    pathname.startsWith("/support/") ||
    pathname.startsWith("/admin/support") ||
    pathname.startsWith("/client/support")
  );
}

export default function ClientWidgets() {
  const pathname = usePathname();
  const hideAi = shouldHideAiChat(pathname);

  return (
    <>
      {!hideAi ? <SupportChatWidget /> : null}
      <FloatingWhatsApp />
    </>
  );
}
