"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  containerClassName?: string;
}

/**
 * Enterprise SafeImage component with automatic fallback handling,
 * skeleton shimmer state, and guaranteed layout stability.
 */
export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/assets/banner.jpg",
  className = "",
  containerClassName = "",
  fill,
  width,
  height,
  priority = false,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // SVG images or external URLs can also use standard Next.js image
  return (
    <div className={`relative overflow-hidden ${containerClassName} ${fill ? "w-full h-full" : ""}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-white/[0.03] animate-pulse pointer-events-none z-0"
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        src={hasError ? fallbackSrc : imgSrc}
        alt={alt || "Logic Intelligence Technologies Visual"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"} ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

export { SafeImage };
