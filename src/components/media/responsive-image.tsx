"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import ImageFallback from "./image-fallback";

export interface ResponsiveImageProps extends Omit<ImageProps, "onError"> {
  fallbackLabel?: string;
  containerClassName?: string;
}

export function ResponsiveImage({
  src,
  alt,
  className,
  containerClassName,
  fallbackLabel,
  ...props
}: ResponsiveImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={containerClassName}>
        <ImageFallback label={fallbackLabel || alt || "Image"} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        src={src}
        alt={alt || "Logic Intelligence Technologies media"}
        className={cn("transition-opacity duration-300", className)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
}

export default ResponsiveImage;
