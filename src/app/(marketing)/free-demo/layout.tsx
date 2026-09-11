import { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, faqPage, DEMO_FAQ } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Request a Free Demo",
  description:
    "Get a free, no-obligation prototype or consultation for your software project before you commit to anything.",
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
