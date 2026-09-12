import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.logicintelligencetechnologies.in",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": item.url.startsWith("http")
          ? item.url
          : `https://www.logicintelligencetechnologies.in${item.url}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs text-zinc-400 ${className}`}>
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={item.url} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              {isLast ? (
                <span className="text-primary font-semibold truncate max-w-[200px] sm:max-w-none" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-white transition-colors truncate max-w-[150px] sm:max-w-none">
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
