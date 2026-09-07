"use client";

import Link from "next/link";
import { packagesData } from "@/data/packagesData";

export function mentionedPackages(text: string) {
  const t = (text || "").toLowerCase();
  return packagesData.filter((p) => {
    if (p.id === "digital-launch-pack") return /digital launch|launch pack/.test(t);
    if (p.id === "business-pro-pack") return /business pro|pro pack/.test(t);
    if (p.id === "enterprise-pack") return /enterprise pack|enterprise/.test(t) && /pack|quote|₹|price/.test(t);
    return false;
  });
}

export function InChatPackageCards({ text }: { text: string }) {
  const packs = mentionedPackages(text);
  if (!packs.length) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {packs.map((p) => (
        <Link
          key={p.id}
          href={`/packages/${p.slug}`}
          className="block rounded-xl border border-orange-400/25 bg-black/40 px-3 py-3 hover:border-orange-400/60"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">Package</p>
          <p className="mt-1 text-sm font-semibold text-white">{p.title}</p>
          <p className="mt-0.5 text-xs text-[#E8651C] font-bold">{p.price}</p>
          <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">{p.subtitle}</p>
        </Link>
      ))}
    </div>
  );
}
