import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { COMPANY } from "@/config/company";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({
  items,
  className = "",
  showHome = true,
}: BreadcrumbsProps) {
  const baseUrl = COMPANY.websiteUrl;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...(showHome
        ? [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
          ]
        : []),
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: (showHome ? 1 : 0) + index + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex flex-wrap items-center gap-2 text-xs text-zinc-400 ${className}`}
      >
        {showHome && (
          <>
            <Link
              href="/"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
            >
              Home
            </Link>
            {items.length > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" aria-hidden="true" />
            )}
          </>
        )}
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={item.url} className="flex items-center gap-2">
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="text-cyan-400 font-semibold truncate max-w-[220px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-white transition-colors truncate max-w-[160px] sm:max-w-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
                >
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default Breadcrumbs;
