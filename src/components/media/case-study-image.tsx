import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CaseStudyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function CaseStudyImage({ src, alt, className }: CaseStudyImageProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl group",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover object-top transition-transform duration-500 group-hover:scale-102"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/70 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default CaseStudyImage;
