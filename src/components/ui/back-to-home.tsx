"use client";

import BackButton, { BackButtonProps } from "@/components/navigation/BackButton";

/**
 * Enterprise back navigation pill button.
 * Backwards compatibility wrapper for @/components/navigation/BackButton.
 */
export default function BackToHome({
  href = "/",
  fallbackHref,
  label = "Back to Home",
  className = "",
  inline = false,
  forceFallback = false,
}: BackButtonProps & { href?: string }) {
  return (
    <BackButton
      fallbackHref={fallbackHref || href}
      label={label}
      className={className}
      inline={inline}
      forceFallback={forceFallback}
    />
  );
}

export { BackButton };
export type { BackButtonProps };