"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchCategoryFilterProps {
  currentCategory: string;
  counts: {
    all: number;
    products: number;
    packages: number;
    services: number;
    guides: number;
  };
}

export default function SearchClientFilter({
  currentCategory = "all",
  counts,
}: SearchCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/search?${params.toString()}`);
  };

  const categories = [
    { id: "all", label: "All Results", count: counts.all },
    { id: "products", label: "Products", count: counts.products },
    { id: "packages", label: "Packages", count: counts.packages },
    { id: "services", label: "Services", count: counts.services },
    { id: "guides", label: "Guides & Blog", count: counts.guides },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
      {categories.map((cat) => {
        const isActive = currentCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-poppins font-medium transition-all ${
              isActive
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs font-semibold"
                : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)] hover:text-[var(--lit-navy,#0B2545)]"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)]"
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
