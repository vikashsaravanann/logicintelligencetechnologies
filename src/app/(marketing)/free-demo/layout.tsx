import { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, faqPage, DEMO_FAQ } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Request a Free Demo | Logic Intelligence Technologies",
  description:
    "See your website before you pay anything. Submit your project brief and our team will reply within 48–72 hours with a clear plan and — where it fits — a free prototype.",
  openGraph: {
    title: "Request a Free Demo | Logic Intelligence Technologies",
    description: "Zero risk. Zero commitment. See a working direction for your website before you invest. Free demo available for qualifying projects.",
    images: [{ url: "/assets/og-banner.jpg", width: 1200, height: 630, alt: "Free Demo — Logic Intelligence Technologies" }],
  },
};

export default function FreeDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Free Demo", path: "/free-demo" },
          ]),
          faqPage(`${SITE}/free-demo`, DEMO_FAQ),
        ]}
      />
      {children}
    </>
  );
}
