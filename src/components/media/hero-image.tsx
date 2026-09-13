import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function HeroImage({
  src,
  alt,
  className,
  priority = true,
}: HeroImageProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-3xl overflow-hidden border border-white/15 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/70 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default HeroImage;
