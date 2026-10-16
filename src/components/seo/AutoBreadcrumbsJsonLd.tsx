"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { generateBreadcrumbJsonLd } from "@/lib/seo/breadcrumb-routes";

/**
 * AutoBreadcrumbsJsonLd
 *
 * Injects Google Search Console-compliant Schema.org BreadcrumbList JSON-LD
 * on every single page across the platform without rendering ANY visible UI.
 *
 * - Zero visual elements (100% invisible to visitors, clients, and admins).
 * - Exists strictly in coding/structured data for Googlebot and search crawlers.
 * - Dynamically updates on client-side route transitions and SSR/SSG pre-rendering.
 */
export function AutoBreadcrumbsJsonLd() {
  const pathname = usePathname();

  const jsonLd = useMemo(() => {
    return generateBreadcrumbJsonLd(pathname || "/");
  }, [pathname]);

  return (
    <script
      type="application/ld+json"
      id="lit-breadcrumbs-jsonld"
      key={pathname || "/"}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}

export default AutoBreadcrumbsJsonLd;
