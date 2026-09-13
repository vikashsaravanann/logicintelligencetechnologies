import React from "react";
import Image from "next/image";
import { COMPANY } from "@/config/company";
import { cn } from "@/lib/utils";

export interface SocialPreviewImageProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SocialPreviewImage({
  title,
  subtitle,
  className,
}: SocialPreviewImageProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-[1200/630] rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#070d24] via-[#050814] to-black p-12 flex flex-col justify-between shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
          <Image
            src={COMPANY.logoIconPath}
            alt={COMPANY.displayName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-bold uppercase tracking-[0.16em] text-white">
          {COMPANY.displayName}
        </span>
      </div>

      <div className="space-y-3 max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-zinc-400 line-clamp-2">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-white/10 pt-4">
        <span>https://www.logicintelligencetechnologies.in</span>
        <span>Enterprise Platform Architecture</span>
      </div>
    </div>
  );
}

export default SocialPreviewImage;
