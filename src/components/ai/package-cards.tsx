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
        <div key={p.id} className="rounded-xl border border-orange-400/25 bg-black/40 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">Package</p>
          <p className="mt-1 text-sm font-semibold text-white">{p.title}</p>
          <p className="mt-0.5 text-xs text-[#E8651C] font-bold">{p.price}</p>
          <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">{p.subtitle}</p>
          <div className="mt-3 flex gap-2">
            <Link href={`/packages/${p.slug}`} className="text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/15 px-3 py-1.5 hover:bg-white/10">Details</Link>
            <Link href={`/free-demo?pack=${p.slug}`} className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#E8651C] px-3 py-1.5 text-white">Book demo</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
