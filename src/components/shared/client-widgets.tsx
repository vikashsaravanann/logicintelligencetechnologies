"use client";

import dynamic from "next/dynamic";

const SupportChatWidget = dynamic(() => import("./support-chat-widget"), { ssr: false });
const FloatingWhatsApp = dynamic(() => import("./floating-whatsapp"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <SupportChatWidget />
      <FloatingWhatsApp />
    </>
  );
}
