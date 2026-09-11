import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { SITE, ORG_ID, LOGO_192, breadcrumb, faqPage, AI_FAQ } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Logic AI",
  description:
    "LOGIC INTELLIGENCE TECHNOLOGIES — Logic AI. Private answers from your documents, plus company knowledge. Streaming assistant. Demo first.",
};

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Logic AI", path: "/ai" },
          ]),
          faqPage(`${SITE}/ai`, AI_FAQ),
          {
            "@type": "SoftwareApplication",
            name: "Logic AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: `${SITE}/ai`,
            image: LOGO_192,
            description:
              "Studio assistant for Logic Intelligence Technologies. Company packages and document context. Grok primary model.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
            publisher: { "@id": ORG_ID },
          },
        ]}
      />
      {children}
    </>
  );
}
