import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, HOWTO_STEPS, ORG_ID } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Website Scoping Checklist",
  description: "The 50-point enterprise deployment checklist used before and during builds.",
};

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Checklist", path: "/checklist" },
          ]),
          {
            "@type": "HowTo",
            name: "Scope a production website with Logic Intelligence Technologies",
            description: "Eight phases from architecture to release, covering the 50-point SOP and verified gates.",
            url: `${SITE}/checklist`,
            totalTime: "P7D",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "INR",
              value: "8999",
            },
            step: HOWTO_STEPS.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
            publisher: { "@id": ORG_ID },
          },
        ]}
      />
      {children}
    </>
  );
}
