import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageFallbackProps {
  label?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "banner";
}

export function ImageFallback({
  label = "Image preview",
  className,
  aspectRatio = "video",
}: ImageFallbackProps) {
  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    banner: "aspect-[21/9]",
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-zinc-900/60 flex flex-col items-center justify-center p-6 text-center text-zinc-500",
        aspectClasses[aspectRatio],
        className
      )}
      aria-label={label}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-zinc-400">
        <ImageIcon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default ImageFallback;
