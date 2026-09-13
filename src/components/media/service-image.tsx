import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ServiceImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ServiceImage({ src, alt, className }: ServiceImageProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl group",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default ServiceImage;
