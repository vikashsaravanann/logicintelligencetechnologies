import React from "react";
import Image from "next/image";
import { FOUNDER } from "@/config/founder";
import { cn } from "@/lib/utils";

export interface FounderImageProps {
  variant?: "square" | "portrait" | "banner";
  className?: string;
  priority?: boolean;
}

export function FounderImage({
  variant = "square",
  className,
  priority = false,
}: FounderImageProps) {
  const imageSrc = FOUNDER.imageUrl;

  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[4/5]",
    banner: "aspect-[21/9]",
  };

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl group",
        aspectClasses[variant],
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={FOUNDER.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default FounderImage;
