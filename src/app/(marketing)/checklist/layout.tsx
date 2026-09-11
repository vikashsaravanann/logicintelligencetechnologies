import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { SITE, breadcrumb, HOWTO_STEPS, ORG_ID } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Website Scoping Checklist",
  description: "The scoping checklist Logic Intelligence Technologies uses before a build.",
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
            description: "Eight steps from goal to live hand-over, including the 31-point scope and free demo.",
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
